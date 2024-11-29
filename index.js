const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

// Configuração de conexão com o ElephantSQL
const conString = "postgres://cbytzror:F8S4hjULM7PlNl0T1HreFZiX-ESAWNyx@kesavan.db.elephantsql.com/cbytzror"; // Atualize com sua URL
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Necessário para ElephantSQL e Vercel
  });
  

client.connect((err) => {
  if (err) {
    console.error("Não foi possível conectar ao banco.", err);
    return;
  }
  client.query("SELECT NOW()", (err, result) => {
    if (err) {
      console.error("Erro ao executar a query.", err);
      return;
    }
    console.log("Conexão estabelecida:", result.rows[0]);
  });
});

// Rota raiz para verificar disponibilidade
app.get("/", (req, res) => {
  console.log("Servidor disponível.");
  res.send("Ok – Servidor disponível.");
});

// Rota POST para adicionar um convidado
app.post("/convidados", (req, res) => {
  const { nome, adultos, criancas } = req.body;
  const query = "INSERT INTO convidados (nome, adultos, criancas) VALUES ($1, $2, $3)";
  
  client.query(query, [nome, adultos, criancas], (err) => {
    if (err) {
      console.error("Erro ao adicionar convidado:", err);
      res.status(400).json({ error: "Erro ao adicionar convidado" });
    } else {
      res.json({ mensagem: `Convidado ${nome} adicionado com sucesso` });
    }
  });
});

// Rota GET para listar todos os convidados e exibir os totais
app.get("/convidados", (req, res) => {
  const query = "SELECT * FROM convidados";
  const totalQuery = "SELECT SUM(adultos) AS total_adultos, SUM(criancas) AS total_criancas FROM convidados";

  client.query(query, (err, result) => {
    if (err) {
      console.error("Erro ao listar convidados:", err);
      res.status(500).json({ error: "Erro ao listar convidados" });
    } else {
      client.query(totalQuery, (err, totals) => {
        if (err) {
          console.error("Erro ao calcular totais:", err);
          res.status(500).json({ error: "Erro ao calcular totais" });
        } else {
          res.json({
            convidados: result.rows,
            total_adultos: totals.rows[0].total_adultos || 0,
            total_criancas: totals.rows[0].total_criancas || 0,
          });
        }
      });
    }
  });
});

// Rota DELETE para remover um convidado pelo nome
app.delete("/convidados", (req, res) => {
  const { nome } = req.query;
  const query = "DELETE FROM convidados WHERE nome = $1";

  client.query(query, [nome], (err) => {
    if (err) {
      console.error("Erro ao remover convidado:", err);
      res.status(500).json({ error: `Erro ao remover convidado ${nome}` });
    } else {
      res.json({ mensagem: `Convidado ${nome} removido com sucesso` });
    }
  });
});

// Inicializa o servidor na porta 3000 ou uma definida no ambiente
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor funcionando na porta ${PORT}`));

module.exports = app;