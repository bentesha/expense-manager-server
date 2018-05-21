const express = require("express");
const Serializer = require("jsonapi-serializer").Serializer;
const Deserializer = require("jsonapi-serializer").Deserializer;
const getCategoryStore = require('../data/category');

let serializer = new Serializer("categories", {
  attributes: ["name", "type", "active"]
});

let deserializer = new Deserializer();

const TABLE = "category";

const router = express
  .Router()
  .get("/", ({ app }, response) => {
    getCategoryStore(app.db)
      .getAll()
      .then(categories => {
        let result = serializer.serialize(categories);
        response.json(result);
      });
  })
  .get("/:id", ({ app, params }, response) => {
    getCategoryStore
      .getById(params.id)
      .then(category => {
        if (!category) {
          response.sendStatus(404); //Not found
        }
        response.json(serializer.serialize(category));
      });
  })
  .post("/", ({ body, app }, response) => {
    deserializer
      .deserialize(body)
      .then(data => {
        let { name, type, active } = data;
        return getCategoryStore(app.db).create({ name, type, active });
      })
      .then(category => {
        response.json(serializer.serialize(category));
      })
      .catch(error => {
        throw error;
      });
  })
  .patch("/:id", ({ app, body, params }, response) => {
    deserializer.deserialize(body).then(payload => {
      let { name, type, active } = payload;
      getCategoryStore(app.db)
        .update(params.id, { name, type, active })
        .then(category => {
          if (!category) {
            response.sendStatus(404); //Not found
          } else {
            return category;
          }
        })
        .then(category => {
          response.json(serializer.serialize(category));
        })
        .catch(error => {
          console.log(error);
          throw error;
        });
    });
  })
  .delete("/:id", ({ app, params }, response) => {
    getCategoryStore(app.db)
      .delete(params.id)
      .then(ok => {
        if(!ok){
          response.sendStatus(404);
        } else {
          response.sendStatus(200);
        }
      });
  });

module.exports = router;
