const request = require("supertest");
const {UserModel} = require("../../../../models/index");
let server;

describe("POST /users/signUp", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "testing"
    server = require("../../../../app");
  });

  afterEach(async () => {
    await UserModel.deleteMany({})
    await server.close();
  });

  it("Should return an error if the user info isn't valid.", async () => {
    const invalidVals = [
      false, "", {email: "a"}, {email: "test@gamil.com", password: "123"}, undefined
    ];

    for(const invalidVal of invalidVals){ 
      const result = await request(server).post("/users/signUp").send(invalidVal); 
      expect(result).toHaveProperty("error");
      expect(result.status).toBe(400);
    }

    const res = await UserModel.findOne({email: invalidVals[3].email});
    expect(res).toBe(null);
  })

  it("Should throw an error if the user already registered.", async () => {
    const payload = {email: "test@test.com", password: "123456"};
    await request(server).post("/users/signUp").send(payload);
    const res = await request(server).post("/users/signUp").send(payload);

    expect(res.status).toBe(400);
    expect(res.text).toContain("This following email is already registered");
  })

  it("Should register the user if its info is valid.", async () => {
    const payload = {email: "test@test.com", password: "123456"};
    const {status, header, body} = await request(server).post("/users/signUp").send(payload);
    const userDocumentFromDB = await UserModel.findByCredentials(payload.email, payload.password);

    expect(userDocumentFromDB).toHaveProperty("email", payload.email);
    expect(status).toBe(200);
    expect(header).toMatchObject({
      "x-refresh-token": expect.any(String), 
      "x-access-token": expect.any(String)
    });
    expect(body).toHaveProperty("email", payload.email);
  })

});