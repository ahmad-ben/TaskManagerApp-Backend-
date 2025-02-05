const request = require("supertest");
const {UserModel} = require("../../../../models/index");
let server;

describe("POST /users/signIn", () => {

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
      const result = await request(server).post("/users/signIn").send(invalidVal); 
      expect(result).toHaveProperty("error");
      expect(result.status).toBe(400);
    }
  })

  it("Should return an error if the user isn't registered yet.", async () => {
    const payload = {email: "test@test.com", password: "123456"};
    const res = await request(server).post("/users/signIn").send(payload);

    expect(res.status).toBe(404);
    expect(res.text).toContain("This account is not registered, sign up first.");
  })

  it("Should return an error if the user password isn't valid.", async () => {
    const payload = {email: "test@test.com", password: "123456"};
    await request(server).post("/users/signUp").send(payload);

    const {status, body} = await request(server).post("/users/signIn").send({...payload, password: "1234567"});

    expect(status).toBe(404);
    expect(body.message).toBe("Email or password are invalid.");
  })

  it("Should login the user if it already registered and has the correct data.", async () => {
    const payload = {email: "test@test.com", password: "123456"};
    await request(server).post("/users/signUp").send(payload);

    const {status, header, body } = await request(server).post("/users/signIn").send(payload);

    expect(status).toBe(200);
    expect(header).toMatchObject({
      "x-refresh-token": expect.any(String), 
      "x-access-token": expect.any(String)
    });
    expect(body).toHaveProperty("email", payload.email);
  })

});