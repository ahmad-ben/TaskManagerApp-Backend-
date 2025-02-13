const request = require("supertest");
const {
  generateFakeJWT, registerAUser, addAUserList, deleteDBData,
  addTask
} = require("../../../utils/index");
const { default: mongoose } = require("mongoose");

require("../../../../components/validation")(); 

let server, userDocument, validUserJWT, 
  listInfo, validListId, validPath, taskInfo, validTaskId;

describe("PATCH /lists/LIST_ID/tasks/TASK_ID", () => {
  // Valid ID for testing purposes.
  const validMongoId = new mongoose.Types.ObjectId();

  const validBodyTitle = {title: "New Task Title From validBodyTitle."};
  const validBodyComplete = {completed: true};
  const validBodyTitleAndCompleted = {
    title: "New Task Title From validBodyTitleAndCompleted.",
    completed: false,
  };

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

    validPath = `/lists/${validListId}/tasks/${validTaskId}`;
  });

  afterEach(async () => {
    await deleteDBData();
    await server.close();
  });

  xit("Should throw an error if the JWT header isn't exist ot it's invalid.", async () => {
    const invalidJWT = await generateFakeJWT(userDocument);
    
    const invalidJWTs = ["", invalidJWT];

    for(const invalidJWT of invalidJWTs){
      const {status, error} = 
        await request(server)
          .patch(validPath)
          .send(validPathBodyTitle)
          .set("x-access-token", invalidJWT); 

      expect(status).toBe(401);
      expect(error).toHaveProperty("message");
    };
  })

  xit("Should return an error if the ListId or the TaskId is invalid.", async () => {  
    const invalidIds = ["aabbccdd", 1234554321, "aabb11__aabb22"];
    
    for(let invalidId of invalidIds) {
      // Testing the list id:
      const pathWithInvalidListId = `/lists/${invalidId}/tasks/${validTaskId}`;
      
      const invalidListIdRes = 
        await request(server)
          .patch(pathWithInvalidListId)
          .send(validPathBodyComplete)
          .set("x-access-token", validUserJWT); 
      
      expect(invalidListIdRes.status).toBe(400);
      expect(invalidListIdRes.body.message).toContain("Invalid url.");
      
      // Testing the task id:      
      const pathWithInvalidTaskId = `/lists/${validListId}/tasks/${invalidId}`;

      const invalidTaskIdRes = 
        await request(server)
          .patch(pathWithInvalidTaskId)
          .send(validPathBodyComplete)
          .set("x-access-token", validUserJWT); 

      expect(invalidTaskIdRes.status).toBe(400);
      expect(invalidTaskIdRes.body.message).toContain("Invalid url.");
    };
  })

  it("Should return an error if the body is invalid.", async () => {    
    const invalidPayloads = [
      "", [], false, {}, 

      {"title": ""}, {"title": 12345},
      {"title": 
        `A Long Task Title That Is More Than 100 Characters,
        The Maximum Allowed We Put In Our Conditions In The Joi Validator Fun.`
      },

      {"completed": "completed should be a boolean."},
      {"completed": 123}, {"completed": null},

      {title: null, completed: undefined},
      {title: undefined, completed: null},
    ];

    for(const invalidPayload of invalidPayloads){
      const {status, error, body} = 
        await request(server)
          .patch(validPath)
          .send(invalidPayload)
          .set("x-access-token", validUserJWT); 
      

      expect(status).toBe(400);
      expect(error).toHaveProperty("message");
    }
  });

  it("Should return an error if the list doesn't exist.", async () => {
    const notExistListPath = `/lists/${validMongoId}/tasks/${validTaskId}`;

    const {status, body} = 
      await request(server)
        .patch(notExistListPath)
        .send(validBodyTitleAndCompleted)
        .set("x-access-token", validUserJWT);

    expect(status).toBe(404);
    expect(body.message).toContain("This List does not exist.");
  });

  it("Should return an error if the task doesn't exist.", async () => {
    const notExistTaskPath = `/lists/${validListId}/tasks/${validMongoId}`;

    const {status, body} = 
      await request(server)
        .patch(notExistTaskPath)
        .send(validBodyTitle)
        .set("x-access-token", validUserJWT);

    expect(status).toBe(404);
    expect(body.message).toContain("This Task does not exist.");
  });

  it("Should update and return the task if everything is correct.", async () => {  
    const updatesPayloads = 
      [validBodyTitle, validBodyComplete, validBodyTitleAndCompleted];
    
    for(let updatesPayload of updatesPayloads) {
      const {status, body} = 
        await request(server)
          .patch(validPath)
          .send(updatesPayload)
          .set("x-access-token", validUserJWT);

        expect(status).toBe(200);
        expect(body).toMatchObject({
          _listId: validListId,
          ...updatesPayload
        });
    }
  })
});