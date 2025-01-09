const express = require('express');

const testRoute = express.Router();

testRoute.get("/", (req, res) => res.send({message: "Warm Backend Server."}));

module.exports = testRoute;