const request = require("supertest");
const {UserModel} = require("../../../../models/index");
const  mongoose = require("mongoose");
const generateFakeJWT = require("../../../utils/generateFakeJWT");
let server;

describe("GET /lists", () => {

  beforeEach(() => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");
  });

  afterEach(async () => {
    await UserModel.deleteMany({})
    await server.close();
  });

  it("Should throw an error if the JWT header isn't exist ot it's invalid.", async () => {
    const payload = {email: "test@test.com", password: "123456"};
    const userInfo = await request(server).post("/users/signUp").send(payload);

    // Generate a JWT with a different JWT Secret Key.
    const invalidJWT = await generateFakeJWT(userInfo);
    
    const invalidJWTs = ["", invalidJWT];

    for(const invalidJWT of invalidJWTs){
      const {status, error} = 
        await request(server).get("/lists").set("x-access-token", invalidJWT); 
      
      expect(status).toBe(401);
      expect(error).toHaveProperty("message");
    };
  })

  it("Should return the user list since the JWT is valid.", async () => {    
    const payload = {email: "test@test.com", password: "123456"};
    const {header} = await request(server).post("/users/signUp").send(payload);
    const validAccessToken = {"x-access-token": header["x-access-token"]};

    await request(server)
      .post("/lists").set(validAccessToken).send({title: "list 1"});
    await request(server)
      .post("/lists").set(validAccessToken).send({title: "list 2"});

    const {body} = await request(server).get("/lists").set(validAccessToken);
    
    expect(body[0]).toMatchObject({title: "list 1"});
    expect(body[1]).toMatchObject({title: "list 2"});
  })
});