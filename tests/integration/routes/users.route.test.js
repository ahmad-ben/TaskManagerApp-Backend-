const request = require("supertest");
const {UserModel} = require("../../../models/index");
const appError = require("../../../errors/appError");
let server;

describe.only("/users", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "testing"
    server = require("../../../app");
  });

  afterEach(async () => {
    await UserModel.deleteMany({})
    server.close();
  });

  describe("POST /signUp", () => {
    it("Should ... the user if the user info isn't valid.", async () => {
      const invalidVals = [
        false, "", {email: "a"}, {email: "test@gamil.com", password: "123"}, undefined
      ];
  
      for(const invalidVal of invalidVals){
        const result = await request(server).post("/users/signUp").send(undefined);
        expect(result).toHaveProperty("error")
        expect(result.status).toBe(400);
      }

      //Test with catch is throwing!!
      await expect(async () => {
        await UserModel.findByCredentials(invalidVals[3].email)
      }).rejects.toThrowError(appError); 
      //Custom function/class for this kind of checks?
      //Check the error status and mess
    })

    it("Should register the user if its info is valid.", async () => {
      const payload = {email: "test@test.com", password: "123456"};
      const res = await request(server).post("/users/signUp").send(payload);
      const userDocumentFromDB = await UserModel.findByCredentials(payload.email, payload.password);
      expect(res.status).toBe(200);
      expect(userDocumentFromDB).toHaveProperty("email", payload.email);
    })

    it("Should throw an error if the user already registered.", async () => {
      const payload = {email: "test@test.com", password: "123456"};
      await request(server).post("/users/signUp").send(payload);
      const res = await request(server).post("/users/signUp").send(payload);

      expect(res.status).toBe(400);
      expect(res.text).toContain("This following email is already registered");
    })
  })
})