const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Aurascope backend is alive in the cloud');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Aurascope running on port', PORT);
});

