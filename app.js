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
    if (message.type === 'button') 
    {
      const buttonText = message.button.text;
      const buttonPayload = message.button.payload;
      const messageId = message.id; // Message ID from the WhatsApp Webhook
      let ApprStatus ="";
     
      // You can handle other button payloads here if needed
      if (buttonPayload === 'Approve') 
      {
        ApprStatus = "APPROVE";
      }else
      {
        ApprStatus = "REJECT";
      }
      try {
        // Your custom API endpoint
        console.log('Url Creation Started');
        const apiUrl = "http://115.124.124.66/api/WhatsAppWebhook/webhook";
        const requestBody = {
          id: "wamid.HBgMOTE5MDk2MjI3FQIAERgSQjJERTJDOTA3RjY3Nzc3RjY4AA==",
          button: {
            payload: ApprStatus // "REJECT" or "APPROVE"
          }
        };
       
        // Make the API call using axios
        try{
          console.log('API call using axios');
          const response = await axios.post(apiUrl, requestBody, {
            headers: {
              "Content-Type": "application/json"
            }
          });
        console.log('Custom API Response:-->', response.data);

        }catch(error)
        {
          
        }
       
        // You can also handle the response if needed
        if (response.status === 200) {
          console.log('API call was successful');
        } 
        else {
          console.error('API call failed with status:', response.status);
        }
      } catch (error) {
        console.error('Error calling custom API:', error);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('API ERROR -> ',err);
    res.sendStatus(200);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

