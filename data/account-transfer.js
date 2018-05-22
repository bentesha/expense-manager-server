const filterKeys = require("./utils/filterKeys");
const getTransactionStore = require("./transaction");

const TABLE = "account_transfer";
const TRANS_TYPE = "Account Transfer";

module.exports = function getAccountTransferStore(db) {
  let dataStore = {
    create(attributes) {
      let allowedKeys = [
        "date",
        "fromAccountId",
        "toAccountId",
        "amount",
        "comments"
      ];
      attributes.comments = attributes.comments || "";
      attributes = filterKeys(attributes, allowedKeys);
      return db.transaction(trx => {
        let transStore = getTransactionStore(trx);
        let creditTrans = transStore.create({
          date: attributes.date,
          amountCredit: attributes.amount,
          amountDebit: 0,
          accountId: attributes.fromAccountId,
          type: TRANS_TYPE
        });
        let debitTrans = transStore.create({
          date: attributes.date,
          amountDebit: attributes.amount,
          amountCredit: 0,
          accountId: attributes.toAccountId,
          type: TRANS_TYPE
        });
        return Promise.all([creditTrans, debitTrans]).then(
          ([creditTrans, debitTrans]) => {
            attributes.creditTransId = creditTrans.id;
            attributes.debitTransId = debitTrans.id;
            return trx
              .from(TABLE)
              .insert(attributes)
              .then(([id]) => {
                return getAccountTransferStore(trx).getById(id);
              });
          }
        );
      });
    },

    getById(transferId) {
      return db
        .from(TABLE)
        .where({ id: transferId })
        .select()
        .first();
    },

    getAll() {
      return db.from(TABLE).where({ isCanceled: 0 });
      select();
    },

    cancel(transferId) {
      let transStore;
      let dataStore;
      //Wrap DB changes in transaction
      //so that we can rollback if anything happens
      db
        .transaction(trx => {
          transStore = getTransactionStore(trx);
          dataStore = getAccountTransferStore(trx);
          return dataStore.getById(transferId);
        })
        .then(transfer => {
          if (!transfer) {
            return null;
          }
          return Promise.all([
            transStore.cancel(tansfer.creditTransactionId), //Cancel both credit
            transStore.cancel(transfer.debitTrans) //and debit transactions associated with this transfer
          ]);
        })
        .then(() => {
          return dataStore.update(transferId, { isCanceled: true });
        });
    }
  };
  return dataStore;
};
