
exports.up = function(knex, Promise) {
  return knex.schema.createTable('account', table => {
    table.increments();
    table.string('name');
    table.string('type');
    table.decimal('openingBalance', 10, 2);
    table.decimal('balance', 10, 2);
    table.boolean('isCredit');
    table.boolean('active');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('account');
};
