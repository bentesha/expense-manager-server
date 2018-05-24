module.exports = function getExpenseStore(db) {
  let getTransactionStore = require("./transaction");
  const filterKeys = require("./utils/filterKeys");
  const assert = require("assert");

  const TABLE_PARENT = "expense_document";
  const TABLE_DETAIL = "expense_document_item";

  let dataStore = {
    create(attributes) {
      let allowedKeys = ["date", "description", "accountId", "items"];
      attributes = filterKeys(attributes, allowedKeys);
      let items = attributes.items;
      delete attributes["items"];
      return db.transaction(trx => {
        let transStore = getTransactionStore(trx);
        return trx
          .into(TABLE_PARENT)
          .insert(attributes)
          .then(([documentId]) => {
            let promises = items.map(item => {
              item.documentId = documentId;
              return trx.into(TABLE_DETAIL).insert(item);
            });
            return Promise.all(promises).then(() => {
              return getExpenseStore(trx).getById(documentId);
            });
          });
      });
    },

    getById(documentId) {
      assert(
        parseInt(documentId),
        "documentId must be a valid positive integer"
      );
      return Promise.all([
        db
          .from(TABLE_PARENT)
          .where({ id: documentId })
          .select()
          .first(),
        db
          .from(TABLE_DETAIL)
          .where({ documentId })
          .select()
      ]).then(([document, items]) => {
        return !document ? null : Object.assign(document, { items });
      });
    },

    getAll() {
      return db
        .from(TABLE_PARENT)
        .select()
        .then(documents => {
          return Promise.all(
            documents.map(doc => {
              return db
                .from(TABLE_DETAIL)
                .where({ documentId: doc.id })
                .select()
                .then(items => {
                  return Object.assign(doc, { items });
                });
            })
          );
        });
    },

    post(documentId) {
      return db.transaction(trx => {
        return trx
          .from(TABLE_PARENT)
          .where({ id: documentId })
          .select()
          .first()
          .then(doc => {
            if (!doc || !doc.isDraft) {
              return false;
            }
            return trx
              .from(TABLE_DETAIL)
              .where({ documentId })
              .select()
              .then(items => {
                let transStore = getTransactionStore(trx);
                let promises = items.map(item => {
                  return Promise.all([
                    transStore.create({
                      date: doc.date,
                      type: "Expense",
                      amountCredit: item.amount,
                      accountId: doc.accountId,
                      amountDebit: 0
                    }),
                    transStore.create({
                      date: doc.date,
                      type: "Expense",
                      amountCredit: 0,
                      accountId: item.accountId,
                      amountDebit: item.amount
                    })
                  ]).then(([creditTrans, debitTrans]) => {
                    return trx.from(TABLE_DETAIL)
                    .where({id:item.id})
                    .update({
                      creditTransId: creditTrans.id,
                      debitTransId: debitTrans.id
                    });
                  });
                });
                return Promise.all(promises)
                  .then(() => {
                    //Mark document as posted
                    return trx
                      .from(TABLE_PARENT)
                      .where({ id: documentId })
                      .update({ isDraft: 0 });
                  })
                  .then(() => getExpenseStore(trx).getById(documentId));
              });
          });
      });
    },

    cancel(documentId) {
      return db
        .from(TABLE_PARENT)
        .where({ id: documentId })
        .select()
        .first()
        .then(doc => {
          if (!doc || doc.isDraft || doc.isCanceled) {
            return false;
          }
          return db
            .from(TABLE_DETAIL)
            .where({ documentId })
            .select()
            .then(items => {
              return db.transaction(trx => {
                let transStore = getTransactionStore(trx);
                let promises = items.map(item =>
                  Promise.all([
                    transStore.cancel(item.creditTransId),
                    transStore.cancel(item.debitTransId)
                  ])
                );
                return Promise.all(promises).then(results => {
                  return trx
                    .from(TABLE_PARENT)
                    .where({ id: documentId })
                    .update({ isCanceled: 1 })
                    .then(() => getExpenseStore(trx).getById(documentId));
                });
              });
            });
        });
    },

    delete(documentId) {
      assert(
        parseInt(documentId),
        "documentId must be a positive integer value"
      );
      return db.transaction(trx => {
        return trx
          .from(TABLE_PARENT)
          .where({ id: documentId })
          .select()
          .first()
          .then(doc => {
            if (!doc.isDraft) {
              return false;
            }
            return trx
              .from(TABLE_PARENT)
              .where({ id: documentId })
              .delete()
              .then(count => {
                if (count === 0) {
                  return false;
                }
                return trx
                  .from(TABLE_DETAIL)
                  .where({ documentId })
                  .delete()
                  .then(() => true);
              });
          });
      });
    }
  };
  return dataStore;
};
