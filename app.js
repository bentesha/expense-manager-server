const express = require("express");
const loadRoutes = require("./routes/config");
const knex = require("knex");
const knexConfig = require("./knexfile");
const cors = require('cors');

const app = express();
app.use(express.json({ strict: true }));

//Configure knex
app.db = knex(knexConfig.development);

//Configure CORS
app.use(cors());

loadRoutes(app);

const PORT_NUMBER = 3100;
app.listen(PORT_NUMBER, () => {
  console.log("Listening on port: " + PORT_NUMBER);
});