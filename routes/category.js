const express = require("express");
const Serializer = require("jsonapi-serializer").Serializer;
const Deserializer = require("jsonapi-serializer").Deserializer;

let serializer = new Serializer("categories", {
  attributes: ["name", "type", "active"]
});

let deserializer = new Deserializer();

const TABLE = "category";

const router = express
  .Router()
  .get("/", ({ app }, response) => {
    app.db
      .select()
      .from(TABLE)
      .then(categories => {
        let result = serializer.serialize(categories);
        response.json(result);
      });
  })
  .get("/:id", ({ app, params }, response) => {
    app.db
      .select()
      .from(TABLE)
      .where({ id: params.id })
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
      .then(payload => {
        let { name, type, active } = payload;
        return app.db.insert({ name, type, active }).into(TABLE);
      })
      .then(([id]) => {
        return app.db
          .from(TABLE)
          .select()
          .where({ id })
          .first();
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
      app.db
        .from(TABLE)
        .where({ id: params.id })
        .update({ name, type, active })
        .then(count => {
          if (count !== 1) {
            response.sendStatus(404); //Not found
          } else {
            return app.db
              .from(TABLE)
              .select()
              .where({ id: params.id })
              .first();
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
    app.db
      .from(TABLE)
      .where({ id: params.id })
      .delete()
      .then(count => {
        if(count !== 1){
          response.sendStatus(404);
        } else {
          response.sendStatus(200);
        }
      });
  });

module.exports = router;
