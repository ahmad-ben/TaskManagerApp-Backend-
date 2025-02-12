const request = require("supertest");
const {
  generateFakeJWT, registerAUser, addAUserList, deleteDBData
} = require("../../../utils/index");
const { default: mongoose } = require("mongoose");

require("../../../../components/validation")(); 

let server, userDocument, validUserJWT, 
  listInfo, validListId, validPath;

describe("POST /lists/LIST_ID/tasks", () => {
  // Valid ID for testing purposes.
  const validMongoId = new mongoose.Types.ObjectId();
  const validTaskBody = {title: "Task 1 Title."};

  beforeEach(async () => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");

    // Register a user.
    userDocument = await registerAUser(server); 
    validUserJWT = userDocument.header["x-access-token"];

    // Add a user list.
    listInfo = await addAUserList(server, validUserJWT);
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
        await request(server)
          .post(validPath)
          .send(validTaskBody)
          .set("x-access-token", invalidJWT); 

      expect(status).toBe(401);
      expect(error).toHaveProperty("message");
    };
  })

  it("Should return an error if the ListId is invalid.", async () => {  
    const invalidListIds = ["aabbccdd", 1234554321, "aabb11__aabb22"];
    
    for(let invalidListId of invalidListIds) {
      // Testing the list id:
      const pathWithInvalidListId = `/lists/${invalidListId}/tasks`;
      
      const {status, body} = 
        await request(server)
          .post(pathWithInvalidListId)
          .send(validTaskBody)
          .set("x-access-token", validUserJWT); 

      expect(status).toBe(400);
      expect(body.message).toContain("Invalid url.");
    };
  })

  it("Should return an error if the task body is invalid.", async () => {
    const invalidPayloads = [
      "", [], false, {}, {"title": ""}, {"title": 12345}, 
      {"title": 
        `A Long Task Title That Is More Than 100 Characters,
        The Maximum Allowed We Put In Our Conditions In The Joi Validator Fun.`
      }
    ];

    for(const invalidPayload of invalidPayloads){
      const {status, error, body} = 
        await request(server)
          .post(validPath)
          .send(invalidPayload)
          .set("x-access-token", validUserJWT); 

      expect(status).toBe(400);
      expect(error).toHaveProperty("message");
    }
  });

  it("Should return an error if the list isn't exist.", async () => {
    // Testing the list id:
    const notExistListPath = `/lists/${validMongoId}/tasks`;

    const {status, body} = 
      await request(server)
        .post(notExistListPath)
        .send(validTaskBody)
        .set("x-access-token", validUserJWT);

    expect(status).toBe(404);
    expect(body.message).toContain("This List does not exist.");
  });

  it("Should register and return the task if everything is correct.", async () => {
    const {status, body} = 
      await request(server)
        .post(validPath)
        .send(validTaskBody)
        .set("x-access-token", validUserJWT);
    
    expect(status).toBe(200);
    expect(body).toMatchObject({ 
      _listId: validListId, title: validTaskBody.title
    });
  })
});