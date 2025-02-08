const request = require("supertest");
const {UserModel} = require("../../../../models/index");
const  mongoose = require("mongoose");
const generateFakeJWT = require("../../../utils/generateFakeJWT");
const { use } = require("../../../../routes/tasks.route");
let server;

describe("POST /lists", () => {
  const validListBody = {"title": "list 1"};
  let userDocument;
  let validJWT;

  beforeEach(async () => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");

    const payload = {email: "test@test.com", password: "123456"};
    userDocument = await request(server).post("/users/signUp").send(payload);
    validJWT = userDocument.header["x-access-token"];
  });

  afterEach(async () => {
    await UserModel.deleteMany({})
    await server.close();
  });

  it("Should return an error if the JWT isn't valid", async() => {
    // Generate a JWT with a different JWT Secret Key.
    const invalidJWT = await generateFakeJWT(userDocument);
    
    const invalidJWTs = ["", invalidJWT];

    for(const invalidJWT of invalidJWTs){
      const {status, error} = await request(server).post("/lists")
        .send(validListBody).set("x-access-token", invalidJWT); 
  
      expect(status).toBe(401);
      expect(error).toHaveProperty("message");
    };
  });

  it("Should return an error if the body isn't valid", async() => {
    const invalidPayloads = [
      "", [], false, {}, {"title": ""}, {"title": 12345}, 
      {"title": "LongTitleThatIsMoreThan50CharactersTheMaximumAllowed."}
    ];

    for(const invalidPayload of invalidPayloads){
      const {status, error, body} = await request(server).post("/lists")
        .send(invalidPayload).set("x-access-token", validJWT); 

      expect(status).toBe(400);
      expect(error).toHaveProperty("message");
    }
  });

  it("Should register and return the list if the JWT and the list title are valid", async() => {
    const {status, body} = await request(server).post("/lists")
      .send(validListBody).set("x-access-token", validJWT); 

    expect(status).toBe(200);
    expect(body).toMatchObject({
      title: validListBody.title,
      _userId: userDocument.body._id
    });
  });
});