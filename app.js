
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

    // IMPORTANT: Ignore all non-message events (statuses, delivery receipts, etc.)
    if (!message) {
      return res.sendStatus(200);
    }

    // IMPORTANT: Ignore all non-button messages
    if (message.type !== 'button') {
      return res.sendStatus(200);
    }

    const from = message.from;

    // BUTTON CLICK
    const buttonText = message.button.text;
    const buttonPayload = message.button.payload;
    const messageId = message.id;
    let ApprStatus = "";

    if (buttonPayload === 'Approve') {
      ApprStatus = "APPROVE";
    } else {
      ApprStatus = "REJECT";
    }

    try {
      console.log('Msg Id - ',messageId);
      console.log('Reply Status - ',ApprStatus);
      console.log('Url Creation Started');
      const apiUrl = "http://115.124.124.66/api/WhatsAppWebhook/webhook";
      const requestBody = {
        id: "wamid.HBgMOTE5MDk2MjI2NjI3FQIAERgSREQyNTI2QjRFNDEzQUJCODczAA==",
        button: {
          payload: ApprStatus
        }
      };

      console.log('API call using axios');
      console.log('call at time:', new Date().toISOString().slice(11, 23));

      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000 //10 second
      });

      console.log('Custom API Response:-->', response.data);
      console.log('call at time:', new Date().toISOString().slice(11, 23));

      if (response.status === 200) {
        console.log('API call was successful');
      } else {
        console.error('API call failed with status:', response.status);
      }

    } catch (error) {
      console.log('call at time:', new Date().toISOString().slice(11, 23));
      console.error('Error calling custom API:', error);
    }

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

