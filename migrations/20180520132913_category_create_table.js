
exports.up = function(knex, Promise) {
  return knex.schema.createTable('category', table => {
    table.increments();
    table.string('name');
    table.string('type');
    table.boolean('active')
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('category');
};
