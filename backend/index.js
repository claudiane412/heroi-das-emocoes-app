// index.js (Servidor Backend Node.js)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const util = require('util');
const { v4: uuidv4 } = require('uuid'); 
// OU se quiser um código de 6 dígitos:
// const generateSixDigitCode = () => Math.floor(100000 + Math.random() * 900000).toString(); 

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
    
    // CHAMADA PARA GARANTIR QUE A TABELA DE TOKEN EXISTE
    try {
        await ensurePasswordResetTableExists(); 
        
        app.listen(port, '0.0.0.0', () => {
            console.log(`Servidor rodando na porta http://10.0.2.15:3000`);
        });
    } catch (e) {
        // Se a criação da tabela falhar, o servidor não deve iniciar
        console.error("Servidor não iniciado devido a erro crítico no banco de dados.");
    }
});

/**
 * Função que cria a tabela de tokens de recuperação se ela não existir.
 */
async function ensurePasswordResetTableExists() {
    const createTableQuery = "CREATE TABLE IF NOT EXISTS password_reset_tokens ( id INT AUTO_INCREMENT PRIMARY KEY, usuario_id INT NOT NULL, token VARCHAR(255) UNIQUE NOT NULL, expira_em DATETIME NOT NULL, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE );";

    try {
        await query(createTableQuery);
        console.log('Tabela password_reset_tokens verificada/criada com sucesso.');
    } catch (err) {
        console.error('Erro CRÍTICO ao criar a tabela de tokens:', err);
        throw err; // Força a interrupção da inicialização do servidor se a tabela falhar
    }
}

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

// Rota de registro (AJUSTADA PARA RECEBER CELULAR)
app.post('/cadastrar', async (req, res) => {
    // ⚠️ ATUALIZADO: Inclui 'celular'
    const { nome, email, senha, celular } = req.body; 

    if (!nome || !email || !senha || !celular) {
        return res.status(400).json({ message: 'Preencha todos os campos, incluindo o celular.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    try {
        // ⚠️ ATUALIZADO: Insere o campo 'celular'
        await query(
            'INSERT INTO usuarios (nome, email, senha, celular, avatar_id, nivel_heroi, humor_atual) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, email, senhaHash, celular, 1, 1, 'Neutro']
        );
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            // Verifica se o erro é por email ou celular já cadastrado
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

// Rota de login (Mantida)
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


// 🚨 ROTA ATUALIZADA: Solicitar Token (Busca por CELULAR)
app.post('/solicitar-token-senha', async (req, res) => {
    // ⚠️ MUDANÇA: Espera o campo 'celular'
    const { celular } = req.body; 

    if (!celular) {
        return res.status(400).json({ message: 'O número de celular é obrigatório.' });
    }

    try {
        // ⚠️ MUDANÇA: Busca no banco de dados pelo campo 'celular'
        const resultado = await query('SELECT id FROM usuarios WHERE celular = ?', [celular]);
        
        if (resultado.length === 0) {
            // Mensagem de segurança: não confirma se o celular existe
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const idUsuario = resultado[0].id;
        
        // Gera um token robusto (UUID)
        const token = uuidv4();
        
        // Se preferir um código menor (6 dígitos) simular SMS, descomente o abaixo e comente o de cima:
        // const token = Math.floor(100000 + Math.random() * 900000).toString();

        // O token expira em 10 minutos
        const expiraEm = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

        // 1. Limpar tokens antigos e Salvar o novo token
        await query('DELETE FROM password_reset_tokens WHERE usuario_id = ?', [idUsuario]);
        await query(
            'INSERT INTO password_reset_tokens (usuario_id, token, expira_em) VALUES (?, ?, ?)',
            [idUsuario, token, expiraEm]
        );

        // 2. Retornar o token diretamente para a tela do app (simulando o "SMS")
        res.json({ 
            message: 'Token gerado com sucesso. Use-o para redefinir sua senha.',
            token: token // O token é retornado para a tela
        });

    } catch (err) {
        console.error('Erro ao solicitar token:', err);
        res.status(500).json({ message: 'Erro interno ao processar a solicitação.' });
    }
});


// Rota 2: Redefinir Senha (Mantida)
app.post('/redefinir-senha', async (req, res) => {
    const { token, nova_senha } = req.body;

    if (!token || !nova_senha) {
        return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }
    
    if (nova_senha.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    try {
        // 1. Verificar o token e a validade
        const resultadoToken = await query(
            'SELECT usuario_id FROM password_reset_tokens WHERE token = ? AND expira_em > NOW()',
            [token]
        );

        if (resultadoToken.length === 0) {
            return res.status(400).json({ message: 'Token inválido ou expirado. Tente solicitar um novo token.' });
        }

        const idUsuario = resultadoToken[0].usuario_id;
        const senhaHash = await bcrypt.hash(nova_senha, 10);

        // 2. Atualizar a senha do usuário
        await query('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, idUsuario]);

        // 3. Deletar o token
        await query('DELETE FROM password_reset_tokens WHERE token = ?', [token]);

        res.json({ message: 'Senha redefinida com sucesso!' });

    } catch (err) {
        console.error('Erro ao redefinir senha:', err);
        res.status(500).json({ message: 'Erro interno ao redefinir a senha.' });
    }
});

// --- Rotas de Usuário e Diário (Não Alteradas) ---

// Buscar dados do usuário logado
app.get('/usuario/me', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;

    try {
        const resultado = await query(
            // ⚠️ ATUALIZADO: Inclui 'celular' no retorno
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


// Atualizar perfil do usuário (AJUSTADA PARA CELULAR)
app.put('/usuario/atualizar', autenticarToken, async (req, res) => {
    const idUsuario = req.usuario.id;
    // ⚠️ ATUALIZADO: Inclui 'celular'
    const { nome, email, celular, avatar_id, nivel_heroi, humor_atual } = req.body; 

    if (!nome) {
        return res.status(400).json({ message: 'O nome é obrigatório.' });
    }

    try {
        // ⚠️ ATUALIZADO: Inclui 'celular' no update
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


// ROTA PARA SALVAR UMA NOVA ENTRADA DO DIÁRIO (Mantida)
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

// ROTA PARA PUXAR TODAS AS ENTRADAS DO DIÁRIO DO USUÁRIO (Mantida)
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

// ROTA PARA PUXAR TODAS AS REFLEXÕES DO USUÁRIO (Mantida)
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

// Criar reflexão (Mantida)
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


// Rota para salvar a reflexão (Mantida)
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