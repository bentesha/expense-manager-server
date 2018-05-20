const categoryRouter = require("./category");
const cashAccountRouter = require("./cash-account");

module.exports = function(app) {
  app.use("/category", categoryRouter);
  app.use("/cash-accounts", cashAccountRouter);
};