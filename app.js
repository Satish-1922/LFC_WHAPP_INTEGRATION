// Import Express.js and axios
const express = require('express');
const axios = require('axios');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

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

    const from = message.from;

    // BUTTON CLICK
    if (message.type === 'button') {
      const buttonText = message.button.text;
      const buttonPayload = message.button.payload;
      const messageId = message.id; // Message ID from the WhatsApp Webhook

      console.log('WaMsgID:', messageId);
      console.log('User:', from);
      console.log('Button clicked:', buttonText);
      console.log('Payload:', buttonPayload);

      // Call your custom API if the payload is "REJECT"
      if (buttonPayload === 'REJECT') {
        console.log('Document rejected');
        try {
          // Your custom API endpoint
          const apiUrl = 'http://localhost:5196/api/WhatsAppWebhook/webhook';
          const requestBody = {
            id: messageId, // Message ID from WhatsApp webhook
            button: {
              payload: 'REJECT',
            },
          };

          // Make the API call using axios
          const response = await axios.post(apiUrl, requestBody, {
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json',
            },
          });

          console.log('Custom API Response:', response.data);

          // You can also handle the response if needed
          if (response.status === 200) {
            console.log('API call was successful');
          } else {
            console.error('API call failed with status:', response.status);
          }

        } catch (error) {
          console.error('Error calling custom API:', error);
        }
      }

      // You can handle other button payloads here if needed
      if (buttonPayload === 'APPROVE') {
        console.log('Document approved');
        // TODO: Save approval to DB / trigger process
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(200);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

