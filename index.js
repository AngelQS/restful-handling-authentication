// Third
const express = require('express');

// Local
const userRoutes = require('./router/user');
const postRoutes = require('./router/post');
const envVars = require('./config/envVars');
require('./db/mongoose');

// Initialization
const app = express();
const PORT = envVars.PORT || 5000;

// Middlewares
app.use(express.json());

// Routes
app.use(userRoutes);
app.use(postRoutes);

app.listen(PORT, () => {
  console.log(`>> Server listening on port ${PORT}`);
});
