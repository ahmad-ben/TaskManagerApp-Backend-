const request = require("supertest");
const {
  generateFakeJWT, registerAUser, addAUserList, deleteDBData
} = require("../../../utils/index");
const { default: mongoose } = require("mongoose");
const addTask = require("../../../utils/addTask");

require("../../../../components/validation")(); 

let server, userDocument, existUserJWT, 
  listInfo, validListId, validPath, taskInfo1, validTaskId;

describe("GET /lists/LIST_ID/tasks/TASK_ID", () => {
  // Valid ID for testing purposes.
  const validMongoId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");

    // Register a user.
    userDocument = await registerAUser(server); 
    existUserJWT = userDocument.header["x-access-token"];

    // Add a user list.
    listInfo = await addAUserList(server, existUserJWT);
    validListId = listInfo.body._id;

    // Add 2 tasks.
    taskInfo1 = await addTask(validListId);
    validTaskId = taskInfo1.id;

    validPath = `/lists/${validListId}/tasks/${validTaskId}`;
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

  it("Should return an error if the ListId or the TaskId is invalid.", async () => {  
    const invalidIds = ["aabbccdd", 1234554321, "aabb11__aabb22"];
    
    for(let invalidListId of invalidIds) {
      // Testing the list id:
      const pathWithInvalidListId = `/lists/${invalidListId}/tasks/${validTaskId}`;
      
      const invalidListIdRes = 
        await request(server).get(pathWithInvalidListId).set("x-access-token", existUserJWT);
      
      expect(invalidListIdRes.status).toBe(400);
      expect(invalidListIdRes.body.message).toContain("Invalid url.");
      
      // Testing the task id:
      const pathWithInvalidTaskId = `/lists/${validListId}/tasks/${invalidListId}`;

      const invalidTaskIdRes = 
        await request(server).get(pathWithInvalidTaskId).set("x-access-token", existUserJWT);

      expect(invalidTaskIdRes.status).toBe(400);
      expect(invalidTaskIdRes.body.message).toContain("Invalid url.");
    };
  })

  it("Should return an error if the list or the task isn't exist.", async () => {
    // Testing the list id:
    const notExistListPath = `/lists/${validMongoId}/tasks/${validTaskId}`;

    const listRes = 
      await request(server).get(notExistListPath).set("x-access-token", existUserJWT);

    expect(listRes.status).toBe(404);
    expect(listRes.body.message).toContain("This List does not exist.");

    // Testing the task id:
    const notExistTaskPath = `/lists/${validListId}/tasks/${validMongoId}`;

    const taskRes = 
      await request(server).get(notExistTaskPath).set("x-access-token", existUserJWT);

    expect(taskRes.status).toBe(404);
    expect(taskRes.body.message).toContain("This Task does not exist.");
  });

  it("Should return the task if everything is correct.", async () => {
    const {status, body} = 
      await request(server).get(validPath).set("x-access-token", existUserJWT);

      expect(status).toBe(200);
      expect(body).toMatchObject({ 
        _listId: validListId, _id: validTaskId, title: "Task 1 title."
      });
  })
});