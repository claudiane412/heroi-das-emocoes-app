// index.js (Servidor Backend Node.js - FLUXO DIRETO E INSEGURO)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const util = require('util');
// Nodemailer e lógica de tokens removidos deste fluxo.

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------
// Conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // sua senha do MySQL
    database: 'heroi_emocoes',
});

// Promisify para usar async/await
const query = util.promisify(connection.query).bind(connection);

connection.connect(async (err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        throw err;
    }
    console.log('Conectado ao MySQL');
    
    // Nenhuma tabela de token é necessária para este fluxo
    app.listen(port, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta http://10.0.2.15:3000`);
    });
});


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

// Rota de registro (Inalterada)
app.post('/cadastrar', async (req, res) => {
    const { nome, email, senha, celular } = req.body; 

    if (!nome || !email || !senha || !celular) {
        return res.status(400).json({ message: 'Preencha todos os campos, incluindo o celular.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    try {
        await query(
            'INSERT INTO usuarios (nome, email, senha, celular, avatar_id, nivel_heroi, humor_atual) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, email, senhaHash, celular, 1, 1, 'Neutro']
        );
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            let message = 'Erro ao registrar. ';
            if (err.sqlMessage.includes('email')) {
                message += 'Email já cadastrado.';
            } else if (err.sqlMessage.includes('celular')) {
                message += 'Celular já cadastrado.';
            } else {
                message += 'Email ou celular já cadastrado.';
            }
            return res.status(409).json({ message });
        }
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});

// Rota de login (Inalterada)
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


// 🎯 ROTA PRINCIPAL 1/2 DO FLUXO DIRETO: VALIDAÇÃO DE E-MAIL
// Endpoint: POST /validar-email-para-redefinicao
app.post('/EsqueceuSenha', async (req, res) => {
    const { email } = req.body; 

    if (!email) {
        return res.status(400).json({ message: 'O endereço de e-mail é obrigatório.' });
    }

    try {
        // 1. Busca no banco de dados pelo campo 'email'
        const resultado = await query('SELECT id FROM usuarios WHERE email = ?', [email]);
        
        if (resultado.length === 0) {
            // Retorna erro se o usuário não for encontrado
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado. Verifique o e-mail digitado.' 
            }); 
        }

        const idUsuario = resultado[0].id;
        
        // 2. Retorna o ID do usuário para o frontend prosseguir
        res.json({ 
            success: true,
            message: 'E-mail validado. Prossiga para definir a nova senha.',
            usuario_id: idUsuario // <-- ID DO USUÁRIO RETORNADO
        });

    } catch (err) {
        console.error('Erro ao validar e-mail:', err);
        res.status(500).json({ message: 'Erro interno ao processar a solicitação.' });
    }
});


// 🎯 ROTA PRINCIPAL 2/2 DO FLUXO DIRETO: REDEFINIR SENHA USANDO O ID DO USUÁRIO
// Endpoint: POST /redefinir-senha-direta
app.post('/RedefinirSenha', async (req, res) => {
    const { usuario_id, nova_senha } = req.body; 

    if (!usuario_id || !nova_senha) {
        return res.status(400).json({ message: 'ID do usuário e nova senha são obrigatórios.' });
    }
    
    if (nova_senha.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    try {
        const senhaHash = await bcrypt.hash(nova_senha, 10);

        // Atualizar a senha do usuário
        const resultado = await query('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, usuario_id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado ou senha não alterada.' });
        }

        res.json({ message: 'Senha redefinida com sucesso!' });

    } catch (err) {
        console.error('Erro ao redefinir senha:', err);
        res.status(500).json({ message: 'Erro interno ao redefinir a senha.' });
    }
});


// --- Rotas de Usuário e Diário (Mantidas) ---

// Buscar dados do usuário logado
app.get('/usuario/me', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;

    try {
        const resultado = await query(
            'SELECT nome, email, celular, avatar_id, nivel_heroi, humor_atual FROM usuarios WHERE id = ?',
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
    const { nome, email, celular, avatar_id, nivel_heroi, humor_atual } = req.body; 

    if (!nome) {
        return res.status(400).json({ message: 'O nome é obrigatório.' });
    }

    try {
        await query(
            'UPDATE usuarios SET nome = ?, email = ?, celular = ?, avatar_id = ?, nivel_heroi = ?, humor_atual = ? WHERE id = ?',
            [nome, email, celular, avatar_id, nivel_heroi, humor_atual, idUsuario]
        );
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
             let message = 'Erro ao atualizar. ';
             if (err.sqlMessage.includes('email')) {
                 message += 'Este e-mail já está em uso.';
             } else if (err.sqlMessage.includes('celular')) {
                 message += 'Este celular já está em uso.';
             } else {
                 message += 'Dados já em uso.';
             }
             return res.status(409).json({ message });
        }
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
});


// ROTA PARA SALVAR UMA NOVA ENTRADA DO DIÁRIO
app.post('/diario', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;
    const { titulo, mensagem, humor } = req.body;
    
    if (!titulo || !mensagem || !humor) {
        return res.status(400).json({ message: 'Dados incompletos para a entrada do diário.' });
    }

    try {
        const resultado = await query(
            'INSERT INTO entradas_diario (usuario_id, data, titulo, mensagem, humor) VALUES (?, NOW(), ?, ?, ?)',
            [idUsuario, titulo, mensagem, humor]
        );
        res.status(201).json({ id: resultado.insertId, message: 'Entrada do diário salva com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao salvar a entrada do diário.' });
    }
});

// ROTA PARA PUXAR TODAS AS ENTRADAS DO DIÁRIO DO USUÁRIO
app.get('/diario', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;
    try {
        const entradas = await query(
            'SELECT id, data, titulo, mensagem, humor FROM entradas_diario WHERE usuario_id = ? ORDER BY data DESC',
            [idUsuario]
        );
        res.status(200).json(entradas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar as entradas do diário.' });
    }
});

// ROTA PARA PUXAR TODAS AS REFLEXÕES DO USUÁRIO
app.get('/minhas_reflexoes', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;
    try {
        const reflexoes = await query(
            'SELECT id, usuario_id, humor, gratidao, desconforto, solucao, DATE_FORMAT(data, "%Y-%m-%d") as data_formatada FROM reflexoes WHERE usuario_id = ? ORDER BY data DESC',
            [idUsuario]
        );
        res.status(200).json(reflexoes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar as reflexões.' });
    }
});

// Criar reflexão
app.post('/reflexoes', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;
    const { gratidao, desconforto, solucao, humor } = req.body;

    if (!gratidao || !humor) {
        return res.status(400).json({ message: 'Gratidão e humor são obrigatórios.' });
    }

    try {
        await query(
            'INSERT INTO reflexoes (usuario_id, gratidao, desconforto, solucao, humor, data) VALUES (?, ?, ?, ?, ?, NOW())',
            [idUsuario, gratidao, desconforto || '', solucao || '', humor]
        );
        res.status(201).json({ message: 'Reflexão registrada com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao salvar reflexão' });
    }
});


// Rota para salvar a reflexão
app.post('/salvar_reflexao', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;
    const { gratidao, desconforto, solucao, humor } = req.body;

    if (!gratidao && !desconforto && !humor) {
        return res.status(400).json({ message: 'Pelo menos um dos campos de reflexão (gratidao, desconforto, humor) deve ser preenchido.' });
    }

    try {
        await query(
            'INSERT INTO reflexoes (usuario_id, data, gratidao, desconforto, solucao, humor) VALUES (?, NOW(), ?, ?, ?, ?)',
            [idUsuario, gratidao, desconforto || null, solucao || null, humor || null]
        );
        res.status(201).json({ message: 'Reflexão salva com sucesso!' });
    } catch (err) {
        console.error('Erro ao salvar reflexão:', err);
        res.status(500).json({ message: 'Erro interno do servidor ao salvar reflexão.' });
    }
});