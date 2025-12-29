// Import Express.js
const express = require('express');

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
app.post('/', (req, res) => {
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

      console.log('User:', from);
      console.log('Button clicked:', buttonText);
      console.log('Payload:', buttonPayload);

      if (buttonPayload === 'APPROVE') {
        console.log('Document approved');
        // TODO: Save approval to DB / trigger process
      }

      if (buttonPayload === 'REJECT') {
        console.log('Document rejected');
        // TODO: Save rejection reason / notify team
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
