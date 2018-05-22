const getTransferStore = require("../data/account-transfer");
const getAccountStore = require("../data/account");
const knex = require("knex");
const knexConfig = require("../knexfile");
const { expect } = require("chai");

const TABLE = "account_transfer";

describe("#accountTransferStore", function() {
  let db = knex(knexConfig.test);
  let accountStore = getAccountStore(db);
  let transferStore = getTransferStore(db);

  let bankAccount = {
    name: "Bank Account",
    type: "Bank Account"
  };

  let cashAccount = {
    name: "Petty Cash",
    type: "Cash Account"
  };

  before("Delete all account transfers", function(done) {
    db
      .from(TABLE)
      .delete()
      .then(() => done())
      .catch(done);
  });

  before("Prepare test data", function(done) {
    let promiseBank = accountStore.create(bankAccount);
    let promiseCash = accountStore.create(cashAccount);
    Promise.all([promiseBank, promiseCash])
      .then(([bank, cash]) => {
        bankAccount = bank;
        cashAccount = cash;
        done();
      })
      .catch(done);
  });

  describe("#create", function() {
    let testTransfer;
    it("should transfer amount from one account to another, and return the transfer", function(done) {
      testTransfer = {
        date: Date.now(),
        fromAccountId: bankAccount.id,
        toAccountId: cashAccount.id,
        amount: 10000,
        comments: "Some random comments"
      };
      transferStore.create(testTransfer).then(transfer => {
        expect(transfer).to.deep.include(testTransfer);
        expect(transfer).to.have.property('id');
        Promise.all([
          accountStore.getById(transfer.fromAccountId),
          accountStore.getById(transfer.toAccountId)
        ])
        .then(([fromAccount, toAccount]) => {
          expect(fromAccount.balance).to.equal(-10000);
          expect(toAccount.balance).to.equal(10000);
          done();
        })
        .catch(done);
      });
    });
  });
});
