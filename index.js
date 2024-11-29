const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
  if (err) {
    return console.error("Não foi possível conectar ao banco.", err);
  }
  client.query("SELECT NOW()", function (err, result) {
    if (err) {
      return console.error("Erro ao executar a query.", err);
    }
    console.log(result.rows[0]);
  });
});

app.get("/", (req, res) => {
  console.log("Response ok.");
  res.send("Ok – Servidor disponível.");
});
app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);

app.get("/motos", (req, res) => {
  try {
    client.query("SELECT * FROM Motos", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err);
      }
      res.json(result.rows);
      console.log("Chamou get motos");
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/motos/:id", (req, res) => {
  try {
    client.query(
      `SELECT consumo FROM Motos WHERE id = ${req.params.id}`,
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de SELECT", err);
        }
        res.json(result.rows);
        console.log("Chamou get motos/modelo");
      }
    );
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
