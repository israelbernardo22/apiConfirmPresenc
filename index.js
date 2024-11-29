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
const client = new Client(conString);

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

// Rota para obter a lista de convidados
app.get('/convidados', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "public"."convidados" LIMIT 100');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar convidados:', error);
        res.status(500).send('Erro ao buscar convidados.');
    }
});

// Rota para deletar um convidado pelo ID
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

// Inicializar o servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
