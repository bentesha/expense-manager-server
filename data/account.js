module.exports = function getAccountStore(db) {

  const filterKeys = require("./utils/filterKeys");
  const accountBalanceType = require("./utils/accountBalanceType");
  const getTransferStore = require("./account-transfer");

  const TABLE = "account";

  let dataStore = {
    /**
     * Add new cash accont
     * @param {Account} account
     */
    create(attributes) {
      let allowedKeys = ["name", "type", "active", "openingBalance"];
      attributes = filterKeys(attributes, allowedKeys);
      attributes.balance = 0;
      attributes.openingBalance = attributes.openingBalance || 0;
      attributes.isCredit = accountBalanceType(attributes.type) === "credit";
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
            if (account.openingBalance > 0) {
              //Get equity account
              return getAccountStore(trx)
                .getByType("Equity")
                .then(accounts => {
                  if (accounts.length > 0) {
                    return accounts[0];
                  } else {
                    return getAccountStore(trx).create({
                      name: "Equity",
                      type: "Equity"
                    });
                  }
                })
                .then(equityAccount => {
                  return getTransferStore(trx).create({
                    date: Date.now(),
                    fromAccountId: equityAccount.id,
                    toAccountId: account.id,
                    amount: account.openingBalance,
                    comments: "Opening Balance"
                  });
                })
                .then(({toAccountId: id}) => {
                  return getAccountStore(trx).getById(id);
                });
            }
            return account;
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
        .where({ id })
        .update(attributes)
        .then(count => {
          if (count === 0) {
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

    getByType(accountType) {
      return db
        .from(TABLE)
        .where({ type: accountType })
        .select();
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
