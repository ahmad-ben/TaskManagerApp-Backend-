const request = require("supertest");
const {UserModel} = require("../../../../models/index");
const  mongoose = require("mongoose");
const { deleteDBData } = require("../../../utils");
let server;

describe("GET /users/getNewAccessToken", () => {

  beforeEach(() => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");
  });

  afterEach(async () => {
    await deleteDBData();
    await server.close();
  });

  it("Should return an error if the userId isn't valid.", async () => {
    const invalidUserIds= [
      "", 123456, "11223344"
    ];

    for(const invalidUserId of invalidUserIds){ 
      const result = await request(server)
        .get("/users/getNewAccessToken").set("userId", invalidUserId); 

      expect(result.status).toBe(401);
      expect(result).toHaveProperty("error");
    }
  })

  it("Should return an error if the refreshToken isn't exist.", async () => {
    const validUserId = new mongoose.Types.ObjectId();
    const {body, status} = await request(server)
      .get("/users/getNewAccessToken").set("userId", validUserId); 

    expect(status).toBe(401);
    expect(body.message).toContain("Invalid data.");
  })

  it("Should return an error if the user isn't found.", async () => {
    const validUserId = new mongoose.Types.ObjectId();

    const unexistUserDataArr = {"userId": validUserId, "x-refresh-token": 123456};
    const {body, status} = await request(server)
      .get("/users/getNewAccessToken").set(unexistUserDataArr);

    expect(status).toBe(401);
    expect(body.message).toContain("User not found.");
  })

  it("Should return an error if the user refresh token is expired.", async () => {
    const payload = {email: "test@test.com", password: "123456"};
    await request(server).post("/users/signUp").send(payload);

    const userDocumentFromDB = await UserModel.findByCredentials(payload.email, payload.password);
    const expiredToken = await userDocumentFromDB.generateRefreshAuthToken();
    
    userDocumentFromDB.sessions.push({
      token: expiredToken,
      expiresAt: new Date() / 1000,
    });

    await userDocumentFromDB.save();

    const expiredTokenUser = {"userId": userDocumentFromDB._id, "x-refresh-token": expiredToken};
    const {body, status} = await request(server)
      .get("/users/getNewAccessToken").set(expiredTokenUser);

    expect(status).toBe(401);
    expect(body.message).toContain("The session does not exist or is expired.");
  })

  it("Should return a new access token -JWT- if the whole user data and refreshToken is valid.", async () => {
    const payload = {email: "test@test.com", password: "123456"};
    await request(server).post("/users/signUp").send(payload);

    const userDocumentFromDB = await UserModel.findByCredentials(payload.email, payload.password);

    const userId = userDocumentFromDB._id, refreshToken = userDocumentFromDB.sessions[0].token;
    const validUserIdAndRefreshToken = {userId, "x-refresh-token": refreshToken};
    const {status, header, body} = await request(server)
      .get("/users/getNewAccessToken").set(validUserIdAndRefreshToken);

    expect(status).toBe(200);
    expect(header).toMatchObject({
      "x-access-token": expect.any(String)
    });
    expect(body).toHaveProperty("JWTToken");
  })
});