const TABLE = "category";

module.exports = function(db) {
  const dataStore = {
    /**
     *
     * @param {*} categoryId
     */
    getById(categoryId) {
      return db
        .from(TABLE)
        .where({ id: categoryId })
        .select()
        .first();
    },

    /**
     *
     */
    getAll() {
      return db.from(TABLE).select();
    },

    /**
     *
     * @param {*} attributes
     */
    create(attributes) {
      let { name, type, active } = attributes;
      if (active === undefined || active == null) {
        active = true;
      }
      active = active ? true : false;
      return db
        .into(TABLE)
        .insert({ name, type, active })
        .then(([id]) => {
          return dataStore.getById(id);
        });
    },

    /**
     *
     * @param {*} id
     * @param {*} attributes
     */
    update(id, attributes) {
      let allowedKeys = ["name", "type", "active"];
      let data = {};
      for (let key of allowedKeys) {
        if (key in attributes && attributes[key] !== undefined) {
          data[key] = attributes[key];
        }
      }
      return db
        .from(TABLE)
        .where({ id })
        .update(data)
        .then(count => {
          if (count === 0) {
            return null;
          } else {
            return dataStore.getById(id);
          }
        });
    },

    /**
     *
     * @param {*} cateogryId
     */
    delete(categoryId) {
      return db
        .from(TABLE)
        .where({ id: categoryId })
        .delete()
        .then(count => {
          return count > 0;
        });
    }
  };
  return dataStore;
};
