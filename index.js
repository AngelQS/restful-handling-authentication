// Third
const express = require('express');

// Local
require('./db/mongoose');

// Initialization
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`>> Server listening on port ${PORT}`);
});
