const expect = require("chai").expect;
const getAccountStore = require("../data/account");
const knexConfig = require("../knexfile");
const knex = require('knex');

describe("#cashAccountDataStore", function() {
  let db = knex(knexConfig.test);
  const TABLE = "account";
  let store = getAccountStore(db);

  let bankAccount = { name: "Bank Account", type: "Bank Account", active: 1 };
  let cashAccount = { name: "Cash Account", type: "Cash Account", active: 1 };

  beforeEach("Clear all records", function(done) {
    db.from(TABLE).delete()
    .then(() => done());
  });

  describe("#create", function() {
    it("should create and return a new account", function(done) {
      store
        .create(bankAccount)
        .then(account => {
          expect(account).to.not.equal(null);
          expect(account).to.deep.include(bankAccount);
          expect(account).to.have.property("id");
          expect(account.isCredit).to.equal(0);
          done();
        })
        .catch(done);
    });
  });

  describe("#getById", function() {
    it("should return an account by its id", function(done) {
      let insertedAccount;
      store
        .create(bankAccount)
        .then(account => {
          insertedAccount = account;
          return store.getById(account.id);
        })
        .then(account => {
          expect(account).to.not.equal(null);
          expect(account).to.deep.equal(insertedAccount);
          done();
        })
        .catch(done);
    });
  });

  describe("#getAlll", function() {
    it("should return all accounts in the database", function(done) {
      Promise.all([store.create(bankAccount), store.create(cashAccount)])
        .then(() => {
          return store.getAll();
        })
        .then(accounts => {
          expect(accounts)
            .to.be.an("array")
            .with.lengthOf(2);
          done();
        })
        .catch(done);
    });
  });

  describe("#update", function() {
    it("should update and return an existing account", function(done) {
      let updatedAccount;
      store
        .create(bankAccount)
        .then(account => {
          let name = "Some Value";
          let type = "Equity Account";
          account.name = name;
          account.type = type;
          account.active = 0;
          updatedAccount = account;
          return store.update(account.id, account);
        })
        .then(account => {
          expect(account).to.deep.equal(updatedAccount);
          done();
        })
        .catch(done);
    });
  });

  describe("#delete", function() {
    it("should delete an account and return true", function(done) {
      store
        .create(bankAccount)
        .then(account => {
          return store.delete(account.id);
        })
        .then(ok => {
          expect(ok).to.be.a("boolean");
          expect(ok).to.equal(true);
          return store.getAll();
        })
        .then(accounts => {
          expect(accounts).to.have.lengthOf(0);
          done();
        })
        .catch(done);
    });
  });
});
