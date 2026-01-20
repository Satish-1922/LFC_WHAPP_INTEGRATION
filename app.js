const http = require('http');

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
