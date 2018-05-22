const categoryRouter = require("./category");
const cashAccountRouter = require("./cash-account");

module.exports = function(app) {
  app.use("/categories", categoryRouter);
  app.use("/accounts", cashAccountRouter);
};