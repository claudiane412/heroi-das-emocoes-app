// index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const util = require('util');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // sua senha do MySQL
    database: 'heroi_emocoes',
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao MySQL');
});

// Promisify para usar async/await
const query = util.promisify(connection.query).bind(connection);

// Middleware para autenticar token JWT
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta_padrao', (err, usuario) => {
        if (err) return res.sendStatus(403);
        req.usuario = usuario;
        next();
    });
}

// Rota de registro
app.post('/cadastrar', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Preencha todos os campos' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    try {
        await query(
            'INSERT INTO usuarios (nome, email, senha, avatar_id, nivel_heroi, humor_atual) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, senhaHash, 1, 1, 'Neutro']
        );
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email já cadastrado' });
        }
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});

// Rota de login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const resultado = await query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (resultado.length === 0) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        const usuario = resultado[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET || 'chave_secreta_padrao', { expiresIn: '1d' });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao realizar login' });
    }
});

// Buscar dados do usuário logado
/*app.get('/usuario/me', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;

    try {
        const resultado = await query(
            'SELECT nome, email, avatar_id, nivel_heroi, humor_atual FROM usuarios WHERE id = ?',
            [idUsuario]
        );

        if (resultado.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json(resultado[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar dados do perfil' });
    }
});
*/

// Buscar dados do usuário logado
app.get('/usuario/me', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;

    try {
        const resultado = await query(
            'SELECT nome, email, avatar_id, nivel_heroi, humor_atual FROM usuarios WHERE id = ?',
            [idUsuario]
        );

        if (resultado.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json(resultado[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar dados do perfil' });
    }
});



// Atualizar perfil do usuário
app.put('/usuario/atualizar', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;
    const { nome, avatar_id, nivel_heroi, humor_atual } = req.body;

    try {
        await query(
            'UPDATE usuarios SET nome = ?, avatar_id = ?, nivel_heroi = ?, humor_atual = ? WHERE id = ?',
            [nome, avatar_id, nivel_heroi, humor_atual, idUsuario]
        );
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
});

// Criar entrada de diário
// Esta rota espera "titulo" e "mensagem" para a tabela "entradas_diario"
app.post('/diario', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;
    const { titulo, mensagem, humor } = req.body;

    if (!titulo || !mensagem || !humor) {
        return res.status(400).json({ message: 'Preencha todos os campos do diário' });
    }

    try {
        await query(
            'INSERT INTO entradas_diario (usuario_id, titulo, mensagem, humor, data) VALUES (?, ?, ?, ?, NOW())',
            [idUsuario, titulo, mensagem, humor,data]
        );
        res.status(201).json({ message: 'Entrada do diário criada com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao criar entrada do diário' });
    }
});

// Listar entradas do diário
app.get('/diario', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;

    try {
        const resultado = await query(
            'SELECT * FROM entradas_diario WHERE usuario_id = ? ORDER BY data DESC',
            [idUsuario]
        );
        res.json(resultado);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar entradas do diário' });
    }
});

// Criar reflexão
// Esta rota espera "gratidao" e "desconforto" para a tabela "reflexao"
app.post('/reflexoes', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;
    const { gratidao, desconforto, solucao, humor } = req.body;

    if (!gratidao || !humor) {
        return res.status(400).json({ message: 'Gratidão e humor são obrigatórios.' });
    }

    try {
        await query(
            'INSERT INTO reflexao (usuario_id, gratidao, desconforto, solucao, humor, data) VALUES (?, ?, ?, ?, ?, NOW())',
            [idUsuario, gratidao, desconforto || '', solucao || '', humor]
        );
        res.status(201).json({ message: 'Reflexão registrada com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao salvar reflexão' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta http://10.0.2.15:3000`);
});
