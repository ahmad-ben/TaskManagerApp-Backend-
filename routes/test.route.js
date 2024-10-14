const express = require('express');

const testRoute = express.Router();

testRoute.get("/", (req, res) => res.send("🥳"));

module.exports = testRoute;