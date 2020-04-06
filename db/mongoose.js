// Third
const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/restful_handling_auth', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('>> Connected to database');
  })
  .catch((err) => {
    console.log(`<< Failed connect to database. Error: ${err}`);
  });
