const request = require("supertest");
const {
  generateFakeJWT, registerAUser, addAUserList, deleteDBData
} = require("../../../utils/index");
const { default: mongoose } = require("mongoose");
const { patch } = require("../../../../routes/tasks.route");
const { TaskModel } = require("../../../../models");

require("../../../../components/validation")(); 

let server, userDocument, existUserJWT, listInfo, validListId, validPath;

describe("GET /lists/LIST_ID/tasks", () => {
  const validId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");

    // Register a user.
    userDocument = await registerAUser(server); 
    existUserJWT = userDocument.header["x-access-token"];

    // Add a user list.
    listInfo = await addAUserList(server, existUserJWT);
    validListId = listInfo.body._id;
    
    validPath = `/lists/${validListId}/tasks`;
  });

  afterEach(async () => {
    await deleteDBData();
    await server.close();
  });

  it("Should throw an error if the JWT header isn't exist ot it's invalid.", async () => {
    const invalidJWT = await generateFakeJWT(userDocument);
    
    const invalidJWTs = ["", invalidJWT];

    for(const invalidJWT of invalidJWTs){
      const {status, error} = 
        await request(server).get(validPath).set("x-access-token", invalidJWT); 
      
      expect(status).toBe(401);
      expect(error).toHaveProperty("message");
    };
  })

  it("Should return an error if the list id is invalid.", async () => {  
    const invalidListIds = ["aabbccdd", 1234554321, "aabb11__aabb22"];
    
    for(let invalidListId of invalidListIds) {
      const newPath = `/lists/${invalidListId}/tasks`;

      const {status, body, error} = 
        await request(server).get(newPath).set("x-access-token", existUserJWT);

      expect(status).toBe(400);
      expect(body.message).toContain("Invalid url.");
    };
  })

  it("Should return an error if the list isn't exist.", async () => {
    const newPath = `/lists/${validId}/tasks`;

    const {status, body, error} = 
      await request(server).get(newPath).set("x-access-token", existUserJWT);
  
    // console.log(error)

      expect(status).toBe(404);
      expect(body.message).toContain("This List does not exist.");
  })
});