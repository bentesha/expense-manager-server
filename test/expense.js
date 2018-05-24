const { expect } = require("chai");
const getExpenseStore = require("../data/expense");
const knex = require("knex");
const knexConfig = require("../knexfile");

const TABLE_PARENT = "expense_document";
const TABLE_DETAIL = "expense_document_item";

describe("#expenseStore", function() {
  let db = knex(knexConfig.test);
  store = getExpenseStore(db);
  let accountStore = require("../data/account")(db);
  let helpers = require('./helpers/db')(db)

  let bankAccount, expense1, expense2, dummyDoc;

  before("Prepare test data", function(done) {
    bankAccount = { name: "Bank Account", type: "Bank Account" };
    expense1 = { name: "Expense 1", type: "Expense" };
    expense2 = { name: "Expense 2", type: "Expense" };

    Promise.all([
      accountStore.create(bankAccount),
      accountStore.create(expense1),
      accountStore.create(expense2)
    ])
      .then(accounts => {
        bankAccount = accounts[0];
        expense1 = accounts[1];
        expense2 = accounts[2];
        done();
      })
      .then(() => {
        dummyDoc = {
          date: Date.now(),
          description: "Some doc description",
          accountId: bankAccount.id,
          items: [
            {
              accountId: expense1.id,
              description: "Some description",
              amount: 4000
            },
            {
              accountId: expense2.id,
              description: "Another description",
              amount: 3000
            }
          ]
        };
      })
      .catch(done);
  });

  beforeEach("Clear all expenses before each test", function(done) {
    Promise.all([
      db.from(TABLE_DETAIL).delete(),
      db.from(TABLE_PARENT).delete()
    ])
      .then(() => done())
      .catch(done);
  });

  describe("#create", function() {
    it("should create and return expense document", function(done) {
      let docCopy = Object.assign({}, dummyDoc);
      store
        .create(docCopy)
        .then(doc => {
          expect(doc).to.be.ok;
          //Delete id, creditTransId, debitTransId properties from each of
          //'items' array element so that expect().to.deep.include() assertion works
          doc.items = doc.items.map(item => {
            delete item.id;
            delete item.creditTransId;
            delete item.debitTransId;
            return item;
          });
          expect(doc).to.deep.include(docCopy);
          done();
        })
        .catch(done);
    });
  });

  describe("#getById", function() {
    it("should retrieve a document of a specified id", function(done) {
      store
        .create(dummyDoc)
        .then(doc => {
          return store.getById(doc.id).then(doc2 => {
            expect(doc).to.deep.equal(doc2);
            done();
          });
        })
        .catch(done);
    });
  });

  describe("#getAll", function() {
    it("should retrieve all records", function(done) {
      const ITEMS = 5;
      Promise.all(
        Array(ITEMS)
          .fill()
          .map(() => store.create(dummyDoc))
      )
        .then(docs => {
          return store.getAll().then(docs1 => {
            expect(docs1)
              .to.be.an("array")
              .with.lengthOf(docs.length);
            done();
          });
        })
        .catch(done);
    });
  });

  describe("#post", function() {
    let initialBalance, total;
    before("Get initial bank balance", function(done) {
      total = dummyDoc.items.reduce((total, item) => total + item.amount, 0);
      accountStore
        .getById(bankAccount.id)
        .then(account => {
          initialBalance = account.balance;
          done();
        })
        .catch(done);
    });
    it("should post a draft document", async function() {
      let doc = await store.create(dummyDoc);
      doc = await store.post(doc.id);
      expect(await helpers.isAccountingBalanced()).to.be.ok;
      expect(doc.isDraft).to.equal(0);
      doc.items.forEach(item => {
        expect(item.creditTransId).to.not.be.null;
        expect(item.DebitTransId).to.not.be.null;
      });
      let account = await accountStore.getById(doc.accountId);
      expect(account.balance).to.equal(initialBalance - total);
      expect(await helpers.isAccountingBalanced()).to.be.ok;
    });
  });

  describe("#cancel", function() {
    it("should void a posted document", async function() {
      let account = await accountStore.create({
        name: "Bank",
        type: "Bank Account"
      });
      let testData = dummyDoc;
      testData.accountId = account.id;
      let doc = await store.create(testData);
      await store.post(doc.id);
      expect(await helpers.isAccountingBalanced()).to.be.ok;
      doc = await store.cancel2(doc.id);
      expect(doc.isCanceled).to.be.ok;
      expect(await helpers.isAccountingBalanced()).to.equal(true);
      account = await accountStore.getById(doc.accountId);
      expect(account.balance).to.equal(0);
    });
  });

  describe("#delete", function() {
    it("should delete a draft document", async function() {
      let doc = await store.create(dummyDoc);
      let result = await store.delete(doc.id);
      expect(result).to.equal(true);
      doc = await store.getById(doc.id);
      expect(doc).to.equal(null);
    });

    it("should return false if deleting a posted document", async function() {
      let doc = await store.create(dummyDoc);
      doc = await store.post(doc.id);
      let result = await store.delete(doc.id);
      expect(result).to.equal(false);
      doc = await store.getById(doc.id);
      expect(doc).to.be.an("object");
    });
  });
});
