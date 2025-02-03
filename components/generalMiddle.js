const express = require('express');
const cors = require('cors');

module.exports = (app) => {
  app.use(express.json());
  app.use(cors({
    origin: "*",
    exposedHeaders: ['x-access-token', 'x-refresh-token'],
  }))
}

