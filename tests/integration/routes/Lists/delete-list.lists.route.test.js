const request = require("supertest");
const {UserModel, ListModel} = require("../../../../models/index");
const  mongoose = require("mongoose");
const {generateFakeJWT, registerAUser, addAUserList} = require("../../../utils/index");
let server;

describe("DELETE /lists/ID", () => {
  const validId = new mongoose.Types.ObjectId();
  let userDocument, existUserJWT, listInfo, validListId;

  beforeEach(async () => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");

    // Register a user.
    userDocument = await registerAUser(server); 
    existUserJWT = userDocument.header["x-access-token"];

    // Add a user list.
    listInfo = await addAUserList(server, existUserJWT);
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
      const {status, error} = await request(server).delete(`/lists/${validListId}`)
        .set("x-access-token", invalidJWT); 

      expect(status).toBe(401);
      expect(error).toHaveProperty("message");
    };
  });

  it("Should return an error if the list id isn't valid", async() => {
    const invalidListIds = [false, undefined, 12345, "aabbcc"]

    for(const invalidListId of invalidListIds){
      const {status, body} = await request(server).delete(`/lists/${invalidListId}`)
        .set("x-access-token", existUserJWT); 

      expect(status).toBe(400);
      expect(body.message).toContain("Invalid url.");
    };
  });

  it("Should return an error if the list isn't exist", async() => {
    const {status, body} = await request(server).delete(`/lists/${validId}`)
      .set("x-access-token", existUserJWT); 

    expect(status).toBe(404);
    expect(body.message).toContain("This list is not exist.");
  });

  it("Should delete and return the list if it's valid and exist", async() => {
    const {status, body} = await request(server).delete(`/lists/${validListId}`)
      .set("x-access-token", existUserJWT); 

    expect(status).toBe(200);
    expect(body).toMatchObject({
      _id: validListId,
      _userId: userDocument.body._id,
    });

    const deletedList = await ListModel.findById(validListId);

    expect(deletedList).toBe(null);
  });
});