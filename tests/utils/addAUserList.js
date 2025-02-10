const request = require("supertest");

const addAUserList = async (server, validJWT) => {
  const validListBody = {"title": "list 1"};

  return await request(server)
    .post("/lists")
    .set("x-access-token", validJWT)
    .send(validListBody);
};

module.exports = addAUserList;