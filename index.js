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

// Rota para salvar os dados do formulário no banco de dados
app.post('/confirmar', async (req, res) => {
  const { nome, quantAdultos, quantCriancas } = req.body;

  console.log('Dados recebidos:', nome, quantAdultos, quantCriancas);

  if (!nome || quantAdultos == null || quantCriancas == null) {
      return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
      await pool.query(
          'INSERT INTO convidados (nome, quantAdultos, quantCriancas) VALUES ($1, $2, $3)',
          [nome, quantAdultos, quantCriancas]
      );
      res.send('Confirmação registrada com sucesso!');
  } catch (error) {
      console.error('Erro ao salvar os dados:', error);
      res.status(500).send('Erro ao salvar os dados.');
  }
});

app.get('/convidados', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM convidados');
      res.json(result.rows);
  } catch (error) {
      console.error('Erro ao buscar convidados:', error);
      res.status(500).send('Erro ao buscar convidados.');
  }
});

app.delete('/convidados/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await pool.query('DELETE FROM convidados WHERE id = $1', [id]);
      res.send('Convidado deletado com sucesso.');
  } catch (error) {
      console.error('Erro ao deletar convidado:', error);
      res.status(500).send('Erro ao deletar convidado.');
  }
});

module.exports = app;

const port = process.env.PORT || 3000;  // Use a porta atribuída ou 3000 como fallback

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

