// Import Express.js
const express = require('express');
const { getConnection } = require('./hana');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests (Webhook verification)
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests (Incoming WhatsApp events)
app.post('/', (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    // Always acknowledge Meta
    if (!message) {
      return res.sendStatus(200);
    }

    // BUTTON CLICK EVENT
    if (message.type === 'button') {
      const from = message.from;              // User phone
      const messageId = message.id;            // WhatsApp message id
      const buttonPayload = message.button.payload; // APPROVE / REJECT

      console.log('User:', from);
      console.log('Payload:', buttonPayload);

      const action =
        buttonPayload === 'APPROVE' ? 'APPROVED' : 'REJECTED';

      // --- HANA INSERT START ---
      const conn = getConnection();

      const sql = `
        INSERT INTO WA_DOCUMENT_APPROVAL
        (PHONE, MESSAGE_ID, ACTION, ACTION_TIME)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `;

      conn.prepare(sql, (err, stmt) => {
        if (err) {
          console.error('HANA Prepare Error:', err);
          conn.disconnect();
          return;
        }

        stmt.exec([from, messageId, action], (err) => {
          if (err) {
            console.error('HANA Insert Error:', err);
          } else {
            console.log(`Saved ${action} in HANA`);
          }

          stmt.drop();
          conn.disconnect();
        });
      });
      // --- HANA INSERT END ---
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook Error:', err);
    res.sendStatus(200);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
