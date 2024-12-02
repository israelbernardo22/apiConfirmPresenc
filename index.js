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

app.get("/convidados", (req, res) => {
  try {
    client.query("SELECT * FROM convidados", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err);
      }
      res.json(result.rows);
      console.log("Chamou get convidados");
    });
  } catch (error) {
    console.log(error);
  }
});

app.delete('/convidados/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await client.query('DELETE FROM convidados WHERE id = $1', [id]);
      res.send('Convidado deletado com sucesso.');
  } catch (error) {
      console.error('Erro ao deletar convidado:', error);
      res.status(500).send('Erro ao deletar convidado.');
  }
});

app.post('/confirmar', async (req, res) => {
  const { nome, quantAdultos, quantCriancas } = req.body;

  console.log('Dados recebidos:', nome, quantAdultos, quantCriancas);

  if (!nome || quantAdultos == null || quantCriancas == null) {
      return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
      await client.query(
          'INSERT INTO convidados (nome, quantAdultos, quantCriancas) VALUES ($1, $2, $3)',
          [nome, quantAdultos, quantCriancas]
      );
      res.send('Confirmação registrada com sucesso!');
  } catch (error) {
      console.error('Erro ao salvar os dados:', error);
      res.status(500).send('Erro ao salvar os dados.');
  }
});

module.exports = app;
