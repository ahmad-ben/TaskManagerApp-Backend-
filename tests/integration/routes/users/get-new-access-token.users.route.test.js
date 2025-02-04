const request = require("supertest");
const {UserModel} = require("../../../../models/index");
const  mongoose = require("mongoose");
let server;

describe("/users", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");
  });

  afterEach(async () => {
    await UserModel.deleteMany({})
    await server.close();
  });

  describe("GET /getNewAccessToken", () => {
    it("Should return an error if the userId isn't valid.", async () => {
      const invalidUserIds= [
        "", 123456, "11223344"
      ];
  
      for(const invalidUserId of invalidUserIds){ 
        const result = await request(server)
          .get("/users/getNewAccessToken").set("userId", invalidUserId); 

        expect(result).toHaveProperty("error");
        expect(result.status).toBe(401);
      }
    })

    it("Should return an error if the refreshToken isn't exist.", async () => {
      const validUserId = new mongoose.Types.ObjectId();
      const result = await request(server)
        .get("/users/getNewAccessToken").set("userId", validUserId); 

      expect(result).toHaveProperty("error");
      expect(result.status).toBe(401);
    })

    it("Should return an error if the user isn't found.", async () => {
      const validUserId = new mongoose.Types.ObjectId();

      const unexistUserDataArr = {"userId": validUserId, "x-refresh-token": 123456};
      const result = await request(server)
        .get("/users/getNewAccessToken").set(unexistUserDataArr);

      expect(result).toHaveProperty("error");
      expect(result.status).toBe(401);
    })

  })
})