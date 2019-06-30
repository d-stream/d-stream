const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const dbRoutes = require('./routes/db');
app.use(bodyParser.json());
app.use('/db', dbRoutes);


app.listen(4000, () => console.log('App is running on port 4000'))