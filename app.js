
const express = require('express'); // Import Express.js 
const axios = require('axios'); // Import axios
const app = express(); // Create an Express app
app.use(express.json()); // Middleware to parse JSON bodies

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    if (message.type !== 'button') {
      return res.sendStatus(200);
    }

    const messageId = message.id;
    const buttonPayload = message.button.payload;

    let ApprStatus = buttonPayload === 'Approve' ? 'APPROVE' : 'REJECT';

    console.log('Msg Id - ', messageId);
    console.log('Reply Status - ', ApprStatus);

    const apiUrl = "http://115.124.124.66/api/WhatsAppWebhook/webhook";
    const requestBody = {
      id: messageId,
      button: {
        payload: ApprStatus
      }
    };

    console.log('API call using axios');
    console.log('call at time:', new Date().toISOString().slice(11, 23));

    // Fire-and-forget SAP API call
    axios.post(apiUrl, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000
    })
    .then(response => {
      console.log('SAP API completed successfully');
      console.log('SAP API response:', response.data);
    })
    .catch(error => {
      console.error('SAP API failed:', error.message);
    });

    // Respond to WhatsApp immediately
    res.sendStatus(200);

  } catch (err) {
    console.error('API ERROR -> ', err);
    res.sendStatus(200);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

