const expect = require("chai").expect;
const getTransactionStore = require("../data/transaction");
const getCategoryStore = require("../data/category");
const getAccountStore = require("../data/account");
const knexConfig = require("../knexfile");
const knex = require("knex");

const TABLE = 'transaction';

describe("#transactionStore", function() {
  let db = knex(knexConfig.test);
  let accountStore = getAccountStore(db);
  let transactionStore = getTransactionStore(db);
  let categoryStore = getCategoryStore(db);

  let testAccount = {
    name: "Current Account",
    type: "Bank Account",
    active: 1
  };

  let testIncomeCategory = {
    name: 'Sales',
    type: 'Income',
    active: 1
  };

  let testTransaction = {
    date: Date.now(),
    type: 'Income',
    amountCredit: 0,
    amountDebit: 1000
  }

  before("Delete all transactions", function(done) {
    db.from(TABLE).delete()
    .then(() => done())
    .catch(done);
  });

  before("Prepare test data", function(done) {

    accountStore.create(testAccount).then(account => {
      testAccount = account;
      testTransaction.accountId = testAccount.id;
      done();
    })
    .catch(done);
  });

  describe('#create', function(){
    it('should create and return new transaction', function(done){
      testTransaction.accountId = testAccount.id;
      transactionStore.create(testTransaction)
      .then(transaction => {
        expect(transaction).to.not.equal(null);
        expect(transaction).to.deep.include(testTransaction);
        return accountStore.getById(testAccount.id)
      })
      .then(account => {
        expect(account.balance).to.equal(testTransaction.amountDebit);
        done()
      })
      .catch(done);
    })
  })
});
