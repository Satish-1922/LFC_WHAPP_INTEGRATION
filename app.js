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
        console.log('✅ Document approved');
        // TODO: Save approval to DB / trigger process
      }

      if (buttonPayload === 'REJECT') {
        console.log('❌ Document rejected');
        // TODO: Save rejection reason / notify team
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(200);
  }
});
