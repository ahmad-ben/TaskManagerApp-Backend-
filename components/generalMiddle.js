const express = require('express');
const cors = require('cors');

module.exports = (app) => {
  app.use(express.json());
  app.use(cors({
    origin: "*",
    exposedHeaders: ['X-access-token', 'X-refresh-token'],
  }))
}

