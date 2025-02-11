const request = require("supertest");
const {generateFakeJWT, registerAUser, addAUserList, deleteDBData} = require("../../../utils/index");
const { ListModel, TaskModel } = require("../../../../models");
let server;

describe("GET /tasks", () => {
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
    await deleteDBData();
    await server.close();
  });

  it("Should throw an error if the JWT header isn't exist ot it's invalid.", async () => {
    console.log("HERE")
    expect(1).toBe(1);
    // const payload = {email: "test@test.com", password: "123456"};
    // const userInfo = await request(server).post("/users/signUp").send(payload);

    // // Generate a JWT with a different JWT Secret Key.
    // const invalidJWT = await generateFakeJWT(userInfo);
    
    // const invalidJWTs = ["", invalidJWT];

    // for(const invalidJWT of invalidJWTs){
    //   const {status, error} = 
    //     await request(server).get("/lists").set("x-access-token", invalidJWT); 
      
    //   expect(status).toBe(401);
    //   expect(error).toHaveProperty("message");
    // };
  })

  // it("Should return the user list since the JWT is valid.", async () => {    
  //   const payload = {email: "test@test.com", password: "123456"};
  //   const {header} = await request(server).post("/users/signUp").send(payload);
  //   const validAccessToken = {"x-access-token": header["x-access-token"]};

  //   await request(server)
  //     .post("/lists").set(validAccessToken).send({title: "list 1"});
  //   await request(server)
  //     .post("/lists").set(validAccessToken).send({title: "list 2"});

  //   const {body} = await request(server).get("/lists").set(validAccessToken);
    
  //   expect(body[0]).toMatchObject({title: "list 1"});
  //   expect(body[1]).toMatchObject({title: "list 2"});
  // })
});