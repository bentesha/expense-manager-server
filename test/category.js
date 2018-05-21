const expect = require("chai").expect;
const getCategoryStore = require("../data/category");
const knex = require("knex");
const knexConfig = require('../knexfile');

describe("#categoryStore", function() {
  let db = knex(knexConfig.test);
  store = getCategoryStore(db);

  beforeEach("Clear all records", function(done) {
    db.from('category').delete()
    .then(() => done());
  });

  describe('#create', function(){
    it('should create and return catogory', function(done) {
      let attributes = {
        name: 'Some Name',
        type: 'Income',
        active: 1
      };
      store.create(attributes)
      .then(category => {
        expect(category).to.deep.include(attributes);
        expect(category).to.have.property('id');
        done();
      })
      .catch(done);
    });
  });

  describe('#getById', function(){
    it('it should retrive a record by id', function(done){
      let testData = {
        name: 'Name',
        type: 'Income',
        active: 1
      };
  
      let inserted;
  
      store.create(testData).then(category => {
        inserted = category;
        return store.getById(category.id);
      }).then(category => {
        expect(category).to.not.equal(null);
        expect(category).to.deep.equal(inserted);
        done();
      })
      .catch(done);
    });
  });

  describe('#update', function(){
    it('it should update category attributes', function(done) {
      let testData = {
        name: 'Name',
        type: 'Income',
        active: 1
      };
  
      store.create(testData).then(category => {
        testData.name = 'Other value';
        testData.type = 'Expense';
        testData.active = 0;
        return store.update(category.id, testData);
      }).then(category => {
        expect(category).to.deep.include(testData);
        done()
      })
      .catch(done);
    });
  });

  describe('#getAll', function(done){
    
    it('should return all categories', function(done){
      let data = {
        name: 'Name',
        type: 'Income',
        active: 1
      };
      Promise.all([store.create(data), store.create(data)])
      .then(() => {
        return store.getAll();
      })
      .then(categories => {
        expect(categories).to.be.an('array').with.lengthOf(2);
        done();
      })
      .catch(done);
    });
  });

  describe('#delete', function(){
    it('it should delete a category and return true', function(done){
      let testData = {
        name: 'Name',
        type: 'Income',
        active: 1
      };
      store.create(testData)
      .then(category => {
        return store.delete(category.id);
      })
      .then(ok => {
        expect(ok).to.equal(true);
        return store.getAll();
      })
      .then(categories => {
        expect(categories).to.be.an('array').of.lengthOf(0);
        done();
      })
      .catch(done);
    });
  });

});
