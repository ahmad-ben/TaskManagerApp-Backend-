const request = require("supertest");
const {UserModel} = require("../../../../models/index");
const  mongoose = require("mongoose");
const generateFakeJWT = require("../../../utils/generateFakeJWT");
const { use } = require("../../../../routes/tasks.route");
let server;

describe("PATCH /lists", () => {
  const validListBody = {"title": "list 1"};
  const newListBody = {"title": "newTitle"};
  const validId = new mongoose.Types.ObjectId();
  let userDocument, validJWT, listInfo, validListId;

  beforeEach(async () => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");

    const payload = {email: "test@test.com", password: "123456"};
    userDocument = await request(server).post("/users/signUp").send(payload);
    validJWT = userDocument.header["x-access-token"];

    listInfo = await request(server).post("/lists")
      .set("x-access-token", validJWT).send(validListBody);
    validListId = listInfo.body._id;     
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
      const {status, error} = await request(server).patch(`/lists/${validListId}`)
        .send(newListBody).set("x-access-token", invalidJWT); 

      expect(status).toBe(401);
      expect(error).toHaveProperty("message");
    };
  });

  it("Should return an error if the list id isn't valid", async() => {
    const invalidListIds = [false, undefined, 12345, "aabbcc"]

    for(const invalidListId of invalidListIds){
      const {status, body} = await request(server).patch(`/lists/${invalidListId}`)
        .send(newListBody).set("x-access-token", validJWT); 

      expect(status).toBe(400);
      expect(body.message).toContain("Invalid url.");
    };
  });

  it("Should return an error if the body isn't valid", async() => {
    const invalidPayloads = [
      "", [], false, {}, {"title": ""}, {"title": 12345}, 
      {"title": "LongTitleThatIsMoreThan50CharactersTheMaximumAllowed."}
    ];

    for(const invalidPayload of invalidPayloads){
      const {status, error} = await request(server).patch(`/lists/${validListId}`)
        .send(invalidPayload).set("x-access-token", validJWT); 

      expect(status).toBe(400);
      expect(error).toHaveProperty("message");
    }
  });

  it("Should return an error if the list isn't exist", async() => {
    const {status, body} = await request(server).patch(`/lists/${validId}`)
      .send(newListBody).set("x-access-token", validJWT); 

    expect(status).toBe(404);
    expect(body.message).toContain("This list is not exist.");
  });

  it("Should update and return the list if it's valid and exist", async() => {
    const {status, body} = await request(server).patch(`/lists/${validListId}`)
      .send(newListBody).set("x-access-token", validJWT); 

    expect(status).toBe(200);
    expect(body).toMatchObject({
      _id: validListId,
      title: newListBody.title,
      _userId: userDocument.body._id,
    });
  });
});