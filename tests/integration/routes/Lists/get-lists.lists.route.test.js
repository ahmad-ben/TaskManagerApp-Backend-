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
    
    console.log("userInfo", userInfo.body)

    const invalidJWT = await generateFakeJWT(userInfo);
    
    const invalidJWTs = ["", invalidJWT];

    for(const invalidJWT of invalidJWTs){
      const res = await request(server).get("/lists").set("x-access-token", invalidJWT); 
      // console.log(res);
      
      expect(res.status).toBe(401);
      expect(res).toHaveProperty("error");
    };

    
  })
});