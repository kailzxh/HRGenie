const express = require('express');
const serverless = require('serverless-http');

// This will be your compiled Express app
const app = require('../packages/onboarding/server/dist/index.js');

// Wrap your Express app with serverless-http
exports.handler = serverless(app);