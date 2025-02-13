const request = require("supertest");
const {
  generateFakeJWT, registerAUser, addAUserList, deleteDBData,
  addTask
} = require("../../../utils/index");
const { default: mongoose } = require("mongoose");
const { TaskModel } = require("../../../../models");

require("../../../../components/validation")(); 

let server, userDocument, validUserJWT, 
  listInfo, validListId, validPath, taskInfo, validTaskId;

describe("DELETE /lists/LIST_ID/tasks", () => {
  // Valid ID for testing purposes.
  const validMongoId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");

    // Register a user.
    userDocument = await registerAUser(server); 
    validUserJWT = userDocument.header["x-access-token"];

    // Add a user list.
    listInfo = await addAUserList(server, validUserJWT);
    validListId = listInfo.body._id;

    // Add a task.
    taskInfo = await addTask(validListId);
    validTaskId = taskInfo.id;

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
          .delete(validPath).set("x-access-token", invalidJWT);

      expect(status).toBe(401);
      expect(error).toHaveProperty("message");
    };
  })

  it("Should return an error if the ListId TaskId is invalid.", async () => {  
    const invalidIds = ["aabbccdd", 1234554321, "aabb11__aabb22"];
    
    for(let invalidId of invalidIds) {
      // Testing the list id:
      const invalidPath = `/lists/${invalidId}/tasks`;
      
      const {status, body} = 
        await request(server)
          .delete(invalidPath).set("x-access-token", validUserJWT);
      
      expect(status).toBe(400);
      expect(body.message).toContain("Invalid url.");
    };
  })

  it("Should return an error if the list doesn't exist.", async () => {
    const notExistListPath = `/lists/${validMongoId}/tasks`;

    const {status, body} = 
      await request(server)
        .delete(notExistListPath).set("x-access-token", validUserJWT);

    expect(status).toBe(404);
    expect(body.message).toContain("This List does not exist.");
  });

  it("Should delete and return the tasks if everything is correct.", async () => {  
    const existTasksCount = (await TaskModel.find({ _listId: validListId })).length;

    const {status, body} = 
      await request(server)
        .delete(validPath).set("x-access-token", validUserJWT);
    
    expect(status).toBe(200);
    expect(body).toMatchObject({
      acknowledged: true, deletedCount: existTasksCount
    });

    const foundTasks = await TaskModel.find({ _listId: validListId });

    expect(foundTasks).toEqual([]);
  })
});