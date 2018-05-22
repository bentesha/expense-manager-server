const filterKeys = require("./utils/filterKeys");
const getTransactionStore = require("./transaction");

const TABLE = "cash_account";

module.exports = function(db) {
  let dataStore = {
    /**
     * Add new cash accont
     * @param {CashAccount} account
     */
    create(attributes) {
      let allowedKeys = ["name", "type", "active", "openingBalance"];
      attributes = filterKeys(attributes, allowedKeys);
      attributes.balance = 0;
      attributes.openingBalance = attributes.openingBalance || 0;
      let createdAccount = null;
      return db.transaction(trx => {
        return trx
          .into(TABLE)
          .insert(attributes)
          .then(([id]) => {
            return trx
              .from(TABLE)
              .where({ id })
              .select()
              .first();
          })
          .then(account => {
            createdAccount = account;
            if(account.openingBalance > 0){
              return getTransactionStore(trx).createOpeningBalanceTransaction(
                account.id,
                attributes.openingBalance
              );
            }
            return account;
          })
          .then(() => {
            return createdAccount;
          });
      });
    },

    /**
     *
     * @param {Object} attributes
     */
    update(id, attributes) {
      let allowedKeys = ["name", "type", "active", "balance"];
      attributes = filterKeys(attributes, allowedKeys);
      return db
        .from(TABLE)
        .where({id})
        .update(attributes)
        .then(count => {
          if(count === 0){
            return null;
          }
          return db
            .from(TABLE)
            .where({ id })
            .select()
            .first();
        });
    },

    /**
     * Get all accounts
     */
    getAll() {
      return db.from(TABLE).select();
    },

    /**
     *
     * @param {*} accountId
     */
    getById(accountId) {
      return db
        .from(TABLE)
        .where({ id: accountId })
        .select()
        .first();
    },

    /**
     *
     * @param {*} accontId
     */
    delete(accountId) {
      return db
        .from(TABLE)
        .where({ id: accountId })
        .delete()
        .then(count => {
          return count > 0;
        });
    }
  };
  return dataStore;
};
