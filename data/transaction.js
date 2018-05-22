
const getAccountStore = require("./account");
const filterKeys = require("./utils/filterKeys");

const TABLE = "transaction";

module.exports = function (db) {
  let accountStore = require("./account")(db);
  let dataStore = {
    /**
     *
     * @param {*} transaction
     */
    create(attributes) {
      let allowedKeys = [
        "date",
        "type",
        "accountId",
        "amountCredit",
        "amountDebit"
      ];
      attributes = filterKeys(attributes, allowedKeys);
      attributes.isCanceled = false;

      return db
        .into(TABLE)
        .insert(attributes)
        .then(([id]) => {
          let transaction = db
            .from(TABLE)
            .where({ id })
            .select()
            .first();

          let result = dataStore.updateAccountBalance(attributes.accountId);
          return Promise.all([transaction, result]);
        })
        .then(([transaction]) => {
          return transaction;
        });
    },

    cancel(transactionId) {
      dataStore.get(transactionId).then(transaction => {
        if (!transaction) {
          return false;
        }
        db
          .from(TABLE)
          .update({ isCanceled: true })
          .where({ id: transactionId })
          .then(count => {
            if (count === 0) {
              return false;
            }
            return accountStore
              .updateAccountBalance(transaction.accountId)
              .then(() => {
                return true;
              });
          });
      });
    },

    /**
     *
     * @param {*} transactionId
     */
    getById(transactionId) {
      return db
        .from(TABLE)
        .where({ id: transactionId })
        .select()
        .first();
    },

    /**
     *
     * @param {*} includeCanceled
     */
    getAll(includeCanceled = false) {
      let query = db.from(TABLE);
      if (!includeCanceled) {
        query.where({ isCanceled: 0 });
      }
      return query.select();
    },

    /**
     *
     * @param {*} accountId
     */
    updateAccountBalance(accountId) {
      return db
        .from(TABLE)
        .where({ accountId, isCanceled: 0 })
        .sum(db.raw("amountCredit - amountDebit"))
        .first()
        .then(result => {
          let balance = result[Object.keys(result)[0]] || 0;
          return Promise.all([
            Promise.resolve(balance),
            accountStore.getById(accountId)
          ]);
        })
        .then(([balance, account]) => {
          balance = account.isCredit ? balance : -balance;
          return accountStore.update(account.id, { balance });
        });
    }
  };

  return dataStore;
};