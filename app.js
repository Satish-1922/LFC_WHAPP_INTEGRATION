const http = require('http');

const express = require('express'); // Import Express.js 
const axios = require('axios'); // Import axios
const app = express(); // Create an Express app
app.use(express.json()); // Middleware to parse JSON bodies

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

const options = {
  hostname: '115.124.124.66',
  port: 80,
  path: '/api/WhatsAppWebhook/webhook',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, res => {
  console.log('statusCode:', res.statusCode);
});

req.on('error', err => {
  console.error('Error:', err.message);
});

req.end();
