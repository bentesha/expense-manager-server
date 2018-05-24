exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("expense_document", table => {
      table.increments("id");
      table.date("date");
      table
        .integer("accountId")
        .notNullable()
        .references("id")
        .inTable("account");
      table.string("description").notNullable();
      table
        .boolean("isCanceled")
        .notNullable()
        .defaultTo(0);
      table
        .boolean("isDraft")
        .notNullable()
        .defaultTo(1);
    }),
    knex.schema.createTable("expense_document_item", table => {
      table.increments("id");
      table
        .integer("documentId")
        .notNullable()
        .references("id")
        .inTable("expense_document");
      table.string("description").notNullable();
      table
        .integer("accountId")
        .notNullable()
        .references("id")
        .inTable("account");
      table
        .integer("creditTransId")
        .nullable()
        .references("id")
        .inTable("transaction");
      table
        .integer("debitTransId")
        .nullable()
        .references("id")
        .inTable("transaction");
      table.decimal("amount", 10, 2).notNullable();
    })
  ]);
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('expense_document');
  knex.schema.dropTable('expense_document_item');
};
