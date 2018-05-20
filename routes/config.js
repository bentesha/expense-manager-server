const categoryRouter = require('./category');

module.exports = function (app) {
    app.use('/category', categoryRouter);
}