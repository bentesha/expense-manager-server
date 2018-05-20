const TABLE_NAME = 'cash_account';
const COL_NAME = 'name';
const COL_TYPE = 'type';
const COL_OPENING_BALANCE = 'openingBalance';
const COL_BALANCE = 'balance';
const COL_ACTIVE = 'active';

exports.up = function(knex, Promise) {
  return knex.schema.createTable(TABLE_NAME, table => {
    table.increments();
    table.string(COL_NAME);
    table.string(COL_TYPE);
    table.decimal(COL_OPENING_BALANCE, 10, 2);
    table.decimal(COL_BALANCE, 10, 2);
    table.boolean(COL_ACTIVE);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable(TABLE_NAME);
};
