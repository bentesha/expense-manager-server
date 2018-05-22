exports.up = function(knex, Promise) {
  return knex.schema.createTable("account_transfer", table => {
    table.increments().primary();
    table.date("date").notNullable();
    table
      .integer("fromAccountId")
      .notNullable()
      .references("id")
      .inTable("account");
    table
      .integer("toAccountId")
      .notNullable()
      .references("id")
      .inTable("account");
    table.decimal("amount", 10, 2).notNullable();
    table
      .integer("creditTransId")
      .notNullable()
      .references("id")
      .inTable("transaction");
    table
      .integer('debitTransId')
      .notNullable()
      .references('id')
      .inTable('transaction');
    table.string("comments");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('account_transfer');
};
