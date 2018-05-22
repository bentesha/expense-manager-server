const express = require("express");
const jsonapi = require("jsonapi-serializer");
const getAccountStore = require("../data/account");

const TABLE = "cash_account";

let serializer = new jsonapi.Serializer("cash_accounts", {
  attributes: ["name", "type", "active", "balance", "openingBalance"],
  keyForAttribute: "camel-case"
});

let deserializer = new jsonapi.Deserializer({
  keyForAttribute: "camelCase"
});

const errorHandler = function(response, error) {
  console.log(error);
  reponse.sendStatus(500);
};

module.exports = express
  .Router()
  .get("/", ({ app }, response) => {
    getAccountStore(app.db)
      .getAll()
      .then(accounts => {
        response.send(serializer.serialize(accounts));
      })
      .catch(errorHandler.bind(this, response));
  })
  .get("/:id", ({ app, params }, response) => {
    getAccountStore(app.db)
      .getById(params.id)
      .then(account => {
        if (!account) {
          response.sendStatus(404); //Not found
        } else {
          response.send(serializer.serialize(account));
        }
      })
      .catch(errorHandler.bind(this, response));
  })
  .post("/", ({ body, app }, response) => {
    deserializer
      .deserialize(body)
      .then(data => {
        let { name, type, active, openingBalance } = data;
        return getAccountStore(app.db).create({
          name,
          type,
          active,
          openingBalance
        });
        then(([id]) => {
          if (openingBalance > 0) {
            //TODO set account opening balance
          }
          return getAccountStore(app.db)
            .getById(id)
            .then(account => {
              response.json(serializer.serialize(account));
            });
        });
      })
      .catch(errorHandler.bind(this, response));
  })
  .patch("/:id", ({ body, app, params }, response) => {
    deserializer
      .deserialize(body)
      .then(data => {
        let { name, type, active } = data;
        return getAccountStore(app.db)
          .update(params.id, { name, type, active })
          .then(count => {
            if (count !== 1) {
              response.sendStatus(404);
            } else {
              return getAccountStore(app.db)
                .getById(params.id)
                .then(account => {
                  response.json(serializer.serialize(account));
                });
            }
          });
      })
      .catch(errorHandler.bind(this, response));
  })
  .delete("/:id", ({ app, params }, response) => {
    getAccountStore(app.db)
      .delete(params.id)
      .then(count => {
        if (count !== 1) {
          response.sendStatus(404); //Not found
        } else {
          response.sendStatus(200);
        }
      })
      .catch(errorHandler.bind(this, response));
  });
