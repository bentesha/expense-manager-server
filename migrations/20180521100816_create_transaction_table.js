exports.up = function(knex, Promise) {
  return knex.schema.createTable("transaction", table => {
    table.increments();
    table.date("date");
    table.string('type');
    table.integer("accountId");
    table.integer("categoryId");
    table.string("description");
    table.decimal("amountCredit", 10, 2);
    table.decimal("amountDebit", 10, 2);
    table.decimal("amount", 10, 2);
    table.boolean('isCanceled');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('transaction');
};
