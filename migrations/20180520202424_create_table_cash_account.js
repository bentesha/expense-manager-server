const TABLE_NAME = 'account';
const COL_NAME = 'name';
const COL_TYPE = 'type';
const COL_OPENING_BALANCE = 'openingBalance';
const COL_BALANCE = 'balance';
const COL_ACTIVE = 'active';

exports.up = function(knex, Promise) {
  return knex.schema.createTable(TABLE_NAME, table => {
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
  return knex.schema.dropTable(TABLE_NAME);
};
