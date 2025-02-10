const request = require("supertest");

const registerAUser = async (server) => {
  const payload = {email: "test@test.com", password: "123456"};
  return await request(server).post("/users/signUp").send(payload);
};

module.exports = registerAUser;