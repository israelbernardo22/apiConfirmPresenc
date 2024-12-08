const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const app = express();
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Configuração da conexão com o ElephantSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Usando a variável DATABASE_URL
    ssl: {
        rejectUnauthorized: false, // Necessário para conexões com bancos como o ElephantSQL
    },
});

// Rota para salvar os dados do formulário no banco de dados
app.post('/confirmar', async (req, res) => {
    const { nome, quantAdultos, quantCriancas } = req.body;

    res.send('Rota /confirmar funcionando!');

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
    res.send('Rota /convidados funcionando!');
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


// Inicializar o servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

