const express = require("express");
const jsonapi = require("jsonapi-serializer");

const TABLE = "cash_account";

let serializer = new jsonapi.Serializer("cash_accounts", {
  attributes: ["name", "type", "active", "balance", "openingBalance"],
  keyForAttribute: 'camel-case'
});

let deserializer = new jsonapi.Deserializer({
  keyForAttribute: 'camelCase'
});

const errorHandler = function(response, error) {
  console.log(error);
  reponse.sendStatus(500);
};

module.exports = express
  .Router()
  .get("/", ({ app }, response) => {
    app.db
      .from(TABLE)
      .select()
      .then(accounts => {
        response.send(serializer.serialize(accounts));
      })
      .catch(errorHandler.bind(this, response));
  })
  .get("/:id", ({ app, params }, response) => {
    app.db
      .from(TABLE)
      .where({ id: params.id })
      .select()
      .first()
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
        return app.db
          .into(TABLE)
          .insert({ name, type, active, openingBalance });
        then(([id]) => {
          if (openingBalance > 0) {
            //TODO set account opening balance
          }
          return app.db
            .from(TABLE)
            .where({ id })
            .select()
            .then(account => {
              response.json(serializer.serialize(account));
            });
        });
      })
      .catch(errorHandler.bind(this, response));
  })
  .patch("/:id", ({ body, app, params }, response) => {
    deserializer.deserialize(body).then(data => {
      let { name, type, active } = data;
      return app.db
        .from(TABLE)
        .where({ id: params.id })
        .update({ name, type, active })
        .then(count => {
          if (count !== 1) {
            response.sendStatus(404);
          } else {
            return app.db
              .from(TABLE)
              .where({ id: params.id })
              .select()
              .first()
              .then(account => {
                response.json(serializer.serialize(account));
              });
          }
        });
    })
    .catch(errorHandler.bind(this, response));
  })
  .delete("/:id", ({app, params}, response) => {
    app.db
      .from(TABLE)
      .where({ id: params.id })
      .delete()
      .then(count => {
        if (count !== 1) {
          response.sendStatus(404); //Not found
        } else {
          response.sendStatus(200);
        }
      })
      .catch(errorHandler.bind(this, response));
  });
