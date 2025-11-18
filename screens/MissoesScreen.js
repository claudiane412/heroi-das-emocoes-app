import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';

// --- CONFIGURAÇÃO DE DIMENSÕES RESPONSIVAS ---
const { width } = Dimensions.get('window');
const MAZE_WIDTH = 15;
const MAZE_HEIGHT = 15;
const TILE_SIZE = Math.floor((width - 40) / MAZE_WIDTH); 
const exit = { x: MAZE_WIDTH - 1, y: MAZE_HEIGHT - 1 };

// --- CONSTANTES E DADOS GLOBAIS DO JOGO ---
const CONQUISTAS_FASES = {
  labirinto: "Dominei o Labirinto da Calma!",
  folha: "Diálogo Emocional Concluído!", 
  floresta: "Venci a Floresta da Ansiedade!",
};

const EXPLICACOES_FASES = {
  labirinto: `Fase 1 - Labirinto da Calma:
Representa o desafio de regular as emoções.
Use a paciência e as habilidades emocionais que encontrar
para avançar e enfrentar o monstro da sua emoção oposta!`,
  folha: `Fase 2 - Diálogo Emocional (Amigo Digital):
Você escolhe um amigo digital para um diálogo guiado sobre suas emoções e seu dia.
O personagem oferece conselhos práticos e, no final, gera um relatório emocional.`,
  floresta: `Fase 3 - Floresta da Ansiedade:
Caminhe pela floresta enquanto recebe mensagens motivacionais
para enfrentar a ansiedade e fortalecer sua resiliência.`,
};

// Dados dos personagens para a Fase 1 (HERÓIS)
const personagens = [
  { nome: 'Alegria', emoji: '😊', cor: '#FFD700', monstro: 'Tristeza', habilidadeInicial: 'Otimismo' },
  { nome: 'Coragem', emoji: '💪', cor: '#E76F51', monstro: 'Medo', habilidadeInicial: 'Autoconfiança' },
  { nome: 'Paz', emoji: '🕊️', cor: '#2A9D8F', monstro: 'Preocupação', habilidadeInicial: 'Serenidade' },
  { nome: 'Calma', emoji: '😌', cor: '#F4A261', monstro: 'Raiva', habilidadeInicial: 'Paciência' },
];

const EXPLICACAO_MONSTROS = {
  Tristeza: {
    descricao: "A Tristeza drena sua energia, mas pode ser vencida pela **Alegria** e a capacidade de ver o lado bom das coisas (**Otimismo**).",
    habilidadeVencedora: 'Otimismo',
  },
  Medo: {
    descricao: "O Medo te paralisa, mas pode ser combatido com **Coragem** e a crença em si mesmo (**Autoconfiança**).",
    habilidadeVencedora: 'Autoconfiança',
  },
  Preocupação: {
    descricao: "A Preocupação rouba seu momento presente. A **Paz** e o foco na tranquilidade (**Serenidade**) a dissolvem.",
    habilidadeVencedora: 'Serenidade',
  },
  Raiva: {
    descricao: "A Raiva te faz agir por impulso. A **Calma** e o controle dos ânimos (**Paciência**) a acalmam.",
    habilidadeVencedora: 'Paciência',
  },
};

const HABILIDADES_COMBATE = {
  persistencia: 'Ajudar a atravessar obstáculos/tentar novamente.',
  empatia: 'Pode ser usada contra a Raiva para entender o outro lado.',
  autoCuidado: 'Recuperar energia após um erro na batalha (dano leve).',
  gratidao: 'Pode ser usada contra a Tristeza (focar no positivo).',
};

const OBSTACULOS = {
  armadilha: 2, // Representa o Fracasso
  nevoa: 3, // Representa a Dúvida
  portao: 4, // Representa a Procrastinação
};

const HABILIDADES_RECOMPENSA = {
  persistencia: 5,
  empatia: 6,
  autoCuidado: 7,
  gratidao: 8,
};

const HABILIDADE_TO_COLOR = {
  [HABILIDADES_RECOMPENSA.persistencia]: '#8BC34A',
  [HABILIDADES_RECOMPENSA.empatia]: '#673AB7',
  [HABILIDADES_RECOMPENSA.autoCuidado]: '#FFC107',
  [HABILIDADES_RECOMPENSA.gratidao]: '#00BCD4',
};

const HABILIDADE_TO_EMOJI = {
  persistencia: '🌟',
  empatia: '🤝',
  autoCuidado: '💖',
  gratidao: '🙏',
};

const OBSTACULO_TO_EMOJI = {
  armadilha: '💔',
  nevoa: '❓',
  portao: '⏳',
};

// --- DADOS PARA A FASE 2: AMIGO DIGITAL (FLUXO DINÂMICO) ---
const PERSONAGENS_DIGITAIS = [
    { id: 1, nome: 'Luna', emoji: '🌸', cor: '#FF69B4', genero: 'feminino' }, 
    { id: 2, nome: 'Leo', emoji: '🦁', cor: '#4682B4', genero: 'masculino' }, 
    { id: 3, nome: 'Nina', emoji: '🌟', cor: '#9370DB', genero: 'feminino' }, 
    { id: 4, nome: 'Kai', emoji: '🌿', cor: '#3CB371', genero: 'masculino' },  
];

const RECURSOS_OFICIAIS = {
    titulo: "Atenção Urgente",
    mensagem: "Sua segurança é a prioridade. Se você estiver em risco imediato ou tiver pensamentos de autolesão, busque ajuda profissional. Abaixo, você encontra recursos de apoio:",
    recursos: [
        { nome: "CVV (Centro de Valorização da Vida)", numero: "Ligue 188 (Atendimento 24h)", url: "https://www.cvv.org.br/" },
        { nome: "SAMU (Emergência Médica)", numero: "Ligue 192", url: null },
        { nome: "CAPS (Centro de Atenção Psicossocial)", numero: "Procure o mais próximo", url: null },
    ],
    // Chave para identificar no histórico quando este recurso foi ativado
    chave_alerta: 'risco_grave', 
};


const DIALOGO_FLOW = {
    // Estado 0: Inicial (Pergunta como está)
    '0': {
        pergunta: "Olá! Que bom te ver. Como você está se sentindo agora?",
        opcoes: [
            { texto: "Ótimo, com muita energia! 😁", emocao: "alegria", next: '1A' },
            { texto: "Um pouco cansado(a), mas bem. 😴", emocao: "cansaço", next: '1B' },
            { texto: "Ansioso(a) ou preocupado(a). 😟", emocao: "ansiedade", next: '1C' },
            { texto: "Irritado(a) ou frustrado(a). 😡", emocao: "raiva", next: '1C' },
            { texto: "Desesperançoso(a) ou muito triste. 😔", emocao: "desesperanca_inicial", next: '1D_DESESPERANCA' }, 
        ]
    },
    
    // ESTADOS POSITIVOS (Alegria)
    '1A': {
        pergunta: "Houve algo específico que causou essa alegria? Uma conquista, um momento de paz ou gratidão?",
        advice: (nome) => `${nome} diz: Que maravilha! Sentir essa energia é essencial. A solução prática é ancorar esse sentimento.`,
        opcoes: [
            { texto: "Foi uma conquista (trabalho/estudo). 🏆", emocao: "conquista", next: '2A_FOCO' },
            { texto: "Apenas um bom dia, sem motivo específico. ☀️", emocao: "otimismo", next: '2A_FOCO' },
        ]
    },
    '2A_FOCO': {
        advice: (nome) => `${nome} diz: Fantástico. Para manter essa vibe, a sugestão é: **faça algo simples que te dê mais energia**.`,
        pergunta: "O que você fará nos próximos 30 minutos para celebrar esse sentimento e mantê-lo?",
        opcoes: [
            { texto: "Vou ouvir minha música favorita. 🎶", emocao: "acao_musica", next: '3_ENCERRAMENTO', continueNext: '4A_CONTINUAR_ALEGRIA' }, // <--- Grava a rota de Continuação
            { texto: "Vou ajudar alguém que precisa (Empatia). 🤝", emocao: "acao_ajuda", next: '3_ENCERRAMENTO', continueNext: '4A_CONTINUAR_ALEGRIA' }, // <--- Grava a rota de Continuação
        ]
    },


    // ESTADOS NEUTROS/SOBRECARGA (Cansaço)
    '1B': {
        advice: (nome) => `${nome} diz: Entendo. O cansaço pode ser um sinal de que você precisa de uma pausa. A solução prática é mapear a origem.`,
        pergunta: "Essa sensação está mais ligada a falta de sono/descanso ou a um acúmulo de preocupações/tarefas?",
        opcoes: [
            { texto: "Falta de sono/descanso (Físico). 🛌", emocao: "sono", next: '2B_SOLUCAO' },
            { texto: "Acúmulo de preocupações/tarefas (Mental). 🤯", emocao: "sobrecarga", next: '2C_SOBRECARGA' },
        ]
    },
    '2C_SOBRECARGA': {
        advice: (nome) => `${nome} diz: Isso é sobrecarga! A solução imediata é a **quebra**. Pegue um papel e anote tudo. Depois, escolha a tarefa mais fácil para começar.`,
        pergunta: "Você vai tentar dividir suas tarefas em passos menores (Persistência)?",
        opcoes: [
            { texto: "Sim, vou fazer uma lista agora! 💪", emocao: "resolucao_positiva", next: '3_ENCERRAMENTO', continueNext: '4B_CONTINUAR_CANSACO' }, // <--- Grava a rota de Continuação
            { texto: "Ainda me sinto paralisado.😔", emocao: "resolucao_negativa", next: '3B_PAUSA' },
        ]
    },


    // ESTADOS NEGATIVOS (Ansiedade/Raiva)
    '1C': {
        advice: (nome) => `${nome} diz: Calma. A primeira coisa a fazer é respirar fundo e ancorar. A ansiedade e a raiva nos tiram do presente.`,
        pergunta: "Qual é a principal coisa que está tirando sua **Serenidade** hoje?",
        opcoes: [
            { texto: "Um conflito ou discussão com alguém. 😠", emocao: "conflito", next: '2C_CONFLITO' },
            { texto: "Um desafio ou evento que está por vir (Futuro). 🗓️", emocao: "desafio_futuro", next: '2C_DESAFIO' },
            { texto: "É um sentimento geral, não sei bem. 🤷", emocao: "sentimento_geral", next: '2B_SOLUCAO' },
        ]
    },
    '2C_CONFLITO': {
        advice: (nome) => `${nome} diz: Conflitos exigem **Empatia**. A solução prática é focar no que você *pode* controlar. Você pode pedir desculpas (se for o caso) ou apenas dar um tempo para esfriar a cabeça.`,
        pergunta: "Qual é a ação mais pacífica que você pode tomar em relação a este conflito (mesmo que seja apenas esperar)?",
        opcoes: [
            { texto: "Vou dar um tempo e respirar. 🌬️", emocao: "acao_pausa", next: '3_ENCERRAMENTO', continueNext: '4C_CONTINUAR_NEGATIVO' }, // <--- Grava a rota de Continuação
            { texto: "Vou tentar entender o lado do outro. 🤝", emocao: "acao_empatia", next: '3_ENCERRAMENTO', continueNext: '4C_CONTINUAR_NEGATIVO' }, // <--- Grava a rota de Continuação
        ]
    },
    '2C_DESAFIO': {
        advice: (nome) => `${nome} diz: A ansiedade pelo futuro só existe no presente. A solução é prática: transforme a preocupação em um **plano de 1 passo**.`,
        pergunta: "Qual é o primeiro e menor passo que você pode dar agora para se preparar para este desafio?",
        opcoes: [
            { texto: "Vou pesquisar/me informar (Conhecimento). 📚", emocao: "acao_conhecimento", next: '3_ENCERRAMENTO', continueNext: '4C_CONTINUAR_NEGATIVO' }, // <--- Grava a rota de Continuação
            { texto: "Vou me preparar mentalmente (Visualização). ✨", emocao: "acao_mental", next: '3_ENCERRAMENTO', continueNext: '4C_CONTINUAR_NEGATIVO' }, // <--- Grava a rota de Continuação
        ]
    },


    // ESTADO DE CUIDADO (Comum para Neutros e Negativos leves)
    '2B_SOLUCAO': {
        advice: (nome) => `${nome} diz: Nessas horas, o **autocuidado** é a prioridade! A solução é: você precisa de uma dose de **Paciência** consigo mesmo.`,
        pergunta: "Você consegue se comprometer com um momento de autocuidado hoje (15 minutos para algo que te acalme)?",
        opcoes: [
            { texto: "Sim, é a minha prioridade. ✅", emocao: "autocuidado_ok", next: '3_ENCERRAMENTO', continueNext: '4C_CONTINUAR_NEGATIVO' }, // <--- Grava a rota de Continuação
            { texto: "Vou tentar, mas preciso focar em tarefas. 😓", emocao: "autocuidado_nao", next: '3B_PAUSA' },
        ]
    },
    '3B_PAUSA': {
        advice: (nome) => `${nome} diz: O que resiste, persiste. A solução é simples: **pare**. Não fazer nada por 5 minutos é fazer algo pelo seu bem-estar.`,
        pergunta: "Você vai se dar 5 minutos de pausa **agora** (respirar, beber água)?",
        opcoes: [
            { texto: "Sim, 5 minutos de pausa. ☕", emocao: "pausa_imediata", next: '3_ENCERRAMENTO', continueNext: '4B_CONTINUAR_CANSACO' }, // <--- Grava a rota de Continuação
            { texto: "Vou tentar em breve. ⏳", emocao: "pausa_depois", next: '3_ENCERRAMENTO', continueNext: '4B_CONTINUAR_CANSACO' }, // <--- Grava a rota de Continuação
        ]
    },


    // ESTADOS GRAVES E DESESPERANÇA (FLUXO DE SEGURANÇA)
    '1D_DESESPERANCA': { // Checagem de gravidade
        advice: (nome) => `${nome} diz: Sinto muito que você esteja se sentindo assim. É importante não passar por isso sozinho(a). A prioridade agora é sua **segurança**.`,
        pergunta: "Essa tristeza ou desesperança é passageira ou você sente que está em uma situação de risco ou sem saída?",
        opcoes: [
            { texto: "Me sinto em um risco ou sem saída. (Grave)", emocao: RECURSOS_OFICIAIS.chave_alerta, next: '2D_RECURSOS' }, 
            { texto: "É uma tristeza profunda, mas estou seguro(a). (Profundo)", emocao: "tristeza_profunda", next: '2D_PROFUNDO' },
        ]
    },
    '2D_RECURSOS': { // Rota de recursos (não loop)
        advice: (nome) => `${nome} diz: Entendo a gravidade da sua situação. Sua saúde e vida são o mais importante. Por favor, prometa que procurará imediatamente um dos recursos de apoio que vou te mostrar no resumo final.`,
        pergunta: "Você consegue se comprometer a focar em sua respiração por 1 minuto **agora**?",
        opcoes: [
            { texto: "Sim, farei isso agora. 🙏", emocao: "compromisso_seguranca", next: '3_ENCERRAMENTO', continueNext: '4D_CONTINUAR_DESESPERANCA' }, // <--- Grava a rota de Continuação
            { texto: "Não sei se consigo. 😥", emocao: "sem_compromisso_seguranca", next: '3_ENCERRAMENTO', continueNext: '4D_CONTINUAR_DESESPERANCA' }, // <--- Grava a rota de Continuação
        ]
    },
    '2D_PROFUNDO': { // Rota de tristeza profunda (mas seguro)
        advice: (nome) => `${nome} diz: Essa tristeza merece ser ouvida. A solução prática é forçar um pequeno **ganho de energia**. Qual é a última coisa que você sentiu um prazer MÍNIMO em fazer?`,
        pergunta: "Você consegue identificar um 'ganho' de energia que possa replicar hoje (ex: banho quente, 5 minutos no sol)?",
        opcoes: [
            { texto: "Sim, consigo fazer algo pequeno. 🌅", emocao: "ganho_energia_ok", next: '3_ENCERRAMENTO', continueNext: '4D_CONTINUAR_DESESPERANCA' }, // <--- Grava a rota de Continuação
            { texto: "Não, sinto que não tenho energia para nada. 🖤", emocao: "ganho_energia_nao", next: '3B_PAUSA' }, // Volta para pausa
        ]
    },


    // --- NOVOS ESTADOS DE APROFUNDAMENTO (CONTINUAÇÃO DINÂMICA) ---

    // 4A: Aprofundamento da Alegria/Energia
    '4A_CONTINUAR_ALEGRIA': {
        advice: (nome) => `${nome} diz: Que bom que podemos manter o foco no positivo. O que você acha de compartilhar essa energia com alguém?`,
        pergunta: "O que você fará hoje para garantir que a energia positiva de hoje se estenda até amanhã?",
        opcoes: [
            { texto: "Vou planejar um momento relaxante para a noite.", emocao: "planejamento_descanso", next: '3_ENCERRAMENTO', continueNext: '4A_CONTINUAR_ALEGRIA' },
            { texto: "Vou motivar um amigo que está precisando.", emocao: "compartilhar_alegria", next: '3_ENCERRAMENTO', continueNext: '4A_CONTINUAR_ALEGRIA' },
            { texto: "Voltar para o menu principal.", emocao: "voltar_menu", next: '0' },
        ]
    },

    // 4B: Aprofundamento do Cansaço/Sobrecarga
    '4B_CONTINUAR_CANSACO': {
        advice: (nome) => `${nome} diz: Vamos cavar mais fundo na raiz desse cansaço. Lembre-se, o descanso não é um prêmio, é uma necessidade.`,
        pergunta: "O que seria o **próximo pequeno passo prático** para aliviar sua carga (Ex: pedir ajuda, cancelar um compromisso)?",
        opcoes: [
            { texto: "Pedir ajuda para uma tarefa que me estressa.", emocao: "acao_pedir_ajuda", next: '3_ENCERRAMENTO', continueNext: '4B_CONTINUAR_CANSACO' },
            { texto: "Definir um limite (dizer não) a um novo pedido.", emocao: "acao_limite", next: '3_ENCERRAMENTO', continueNext: '4B_CONTINUAR_CANSACO' },
            { texto: "Voltar para o menu principal.", emocao: "voltar_menu", next: '0' },
        ]
    },

    // 4C: Aprofundamento da Ansiedade/Raiva/Negativo
    '4C_CONTINUAR_NEGATIVO': {
        advice: (nome) => `${nome} diz: Entendido. O negativo precisa de um plano de ataque específico. Qual emoção está mais forte **agora** (Ansiedade ou Raiva)?`,
        pergunta: "Qual é a sua estratégia de **regulação emocional** para o restante do dia (Ex: diário, exercício, meditação)?",
        opcoes: [
            { texto: "Vou focar em um exercício físico breve.", emocao: "reg_exercicio", next: '3_ENCERRAMENTO', continueNext: '4C_CONTINUAR_NEGATIVO' },
            { texto: "Vou escrever sobre o que sinto (Diário).", emocao: "reg_diario", next: '3_ENCERRAMENTO', continueNext: '4C_CONTINUAR_NEGATIVO' },
            { texto: "Voltar para o menu principal.", emocao: "voltar_menu", next: '0' },
        ]
    },

    // 4D: Aprofundamento da Desesperança (Reforço e Ação)
    '4D_CONTINUAR_DESESPERANCA': {
        advice: (nome) => `${nome} diz: Sua **Coragem** em continuar conversando é admirável. Precisamos focar no presente e em ações que quebrem o ciclo.`,
        pergunta: "Qual é a **única** coisa física que você pode fazer **agora** para mudar o foco (Ex: mover os pés, cheirar algo forte, mudar de cômodo)?",
        opcoes: [
            { texto: "Mudar de cômodo e ver a luz do sol.", emocao: "acao_ambiente", next: '3_ENCERRAMENTO', continueNext: '4D_CONTINUAR_DESESPERANCA' },
            { texto: "Fazer uma lista de 3 pessoas que posso ligar.", emocao: "acao_conexao", next: '3_ENCERRAMENTO', continueNext: '4D_CONTINUAR_DESESPERANCA' },
            { texto: "Voltar para o menu principal (Mas com cuidado).", emocao: "voltar_menu", next: '0' },
        ]
    },


    // ESTADO DE ENCERRAMENTO (Comum)
    '3_ENCERRAMENTO': {
        advice: (nome) => `${nome} diz: Meus parabéns por essa reflexão. Sua honestidade é a sua maior força e um ato de **Coragem**.`,
        pergunta: "Você gostaria de finalizar a reflexão e ver seu resumo emocional, ou quer conversar mais sobre o seu dia?",
        opcoes: [
            { texto: "Finalizar Reflexão e Ver Resumo", emocao: "terminar", next: 'FINALIZAR' },
            { texto: "Conversar Mais (Aprofundar)", emocao: "continuar_dinamico", next: 'CONTINUE_DYNAMIC' }, 
        ]
    },
};

const gerarRelatorio = (historico, nomePersonagem) => {
    const emocoes = historico.map(h => h.emocao);
    const positivos = emocoes.filter(e => ['alegria', 'otimismo', 'resolucao_positiva', 'acao_musica', 'acao_ajuda'].includes(e)).length;
    const negativos = emocoes.filter(e => ['ansiedade', 'raiva', 'sobrecarga', 'conflito', 'desafio_futuro'].includes(e)).length;
    const grave = emocoes.includes(RECURSOS_OFICIAIS.chave_alerta);
    
    let titulo = "Relatório Emocional de Foco e Calma";
    let resumo = "";
    let recomendacao = "";

    if (grave) {
        titulo = "Relatório de Alerta e Segurança";
        resumo = "A conversa tocou em temas de **risco/desesperança**. Sua **Coragem** em verbalizar isso é o primeiro passo para a mudança. Sua segurança é a prioridade máxima.";
        recomendacao = `Recomendação de ${nomePersonagem}: O plano de ação imediato é **buscar ajuda profissional**. Use os recursos de apoio listados abaixo para garantir sua segurança e bem-estar.`;
    } else if (positivos > negativos) {
        resumo = "A conversa revelou um estado emocional predominantemente **positivo** e de **alta energia**. Você demonstrou otimismo e gratidão.";
        recomendacao = `Recomendação de ${nomePersonagem}: Continue registrando esses sentimentos. Fortaleça o seu **Otimismo** e a **Alegria** com as ações práticas definidas.`;
    } else if (negativos > positivos) {
        resumo = "O diálogo focou em emoções como **ansiedade** e **sobrecarga**. Isso indica que você está enfrentando grandes desafios, mas demonstrou **Persistência** ao buscar soluções.";
        recomendacao = `Recomendação de ${nomePersonagem}: Priorize o **Autocuidado** e a quebra de grandes problemas em pequenos passos (Ação). Lembre-se da **Paciência** para se reerguer.`;
    } else {
        resumo = "O diálogo foi equilibrado, alternando entre cansaço e resolução. Isso demonstra que você está buscando ativamente o **equilíbrio emocional** e tem a **Serenidade** necessária.";
        recomendacao = `Recomendação de ${nomePersonagem}: Continue a prática da respiração e do foco no presente. Isso aprimora sua **Serenidade** para enfrentar a preocupação.`;
    }

    return { titulo, resumo, recomendacao, grave };
};

// --- FUNÇÕES AUXILIARES DO LABIRINTO (MANTIDAS) ---
const generateMaze = () => {
  const maze = Array.from({ length: MAZE_HEIGHT }, () => Array(MAZE_WIDTH).fill(1));
  const stack = [];

  const carvePath = (x, y) => {
    maze[y][x] = 0;
    stack.push({ x, y });

    const directions = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < MAZE_WIDTH && ny >= 0 && ny < MAZE_HEIGHT && maze[ny][nx] === 1) {
        maze[y + dy / 2][x + dx / 2] = 0;
        carvePath(nx, ny);
      }
    }
  };

  carvePath(0, 0);
  maze[exit.y][exit.x] = 0; 
  return maze;
};

// --- FUNÇÃO PARA ABRIR LINK (Simulação) ---
const openUrl = (url) => {
    if (url) {
        // Na vida real, você usaria o Linking.openURL(url)
        Alert.alert("Link Simulado", `Tentativa de abrir: ${url}`);
        // Se estiver em um ambiente real: Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o link."));
    } else {
        Alert.alert("Recurso Local", "Este recurso é local (ex: CAPS), procure a unidade mais próxima em seu bairro/cidade.");
    }
};


// --- COMPONENTE FASE 1: LABIRINTO DA CALMA ---
function NovoLabirinto({ onComplete, registrarConquista, registrarHabilidade }) {
  const [maze, setMaze] = useState([]);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [personagem, setPersonagem] = useState(null);
  const [gameState, setGameState] = useState('escolhaPersonagem');
  const [gameMessage, setGameMessage] = useState('');
  const [playerHP, setPlayerHP] = useState(100);

  const [habilidadesAdquiridas, setHabilidadesAdquiridas] = useState({});
  const todasHabilidades = personagem ? { [personagem.habilidadeInicial.toLowerCase()]: true, ...habilidadesAdquiridas } : habilidadesAdquiridas;
  const [obstaculosVencidos, setObstaculosVencidos] = useState([]);

  useEffect(() => {
    if (gameState === 'maze' && personagem) {
      Alert.alert(`Missão de ${personagem.nome}`, EXPLICACOES_FASES.labirinto);
      setGameMessage(`Você é ${personagem.nome} (Habilidade Inicial: ${personagem.habilidadeInicial}). Encontre a saída para enfrentar o monstro da ${personagem.monstro}.`);
      generateMazeWithItems();
    }
  }, [gameState, personagem]);

  const generateMazeWithItems = () => {
    const newMaze = generateMaze();
    const freeCells = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (newMaze[y][x] === 0 && !(x === 0 && y === 0) && !(x === exit.x && y === exit.y)) {
          freeCells.push({ x, y });
        }
      }
    }

    if (freeCells.length >= 7) { 
        const armadilhaPos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
        newMaze[armadilhaPos.y][armadilhaPos.x] = OBSTACULOS.armadilha;
        
        const nevoaPos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
        newMaze[nevoaPos.y][nevoaPos.x] = OBSTACULOS.nevoa;
        
        const portaoPos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
        newMaze[portaoPos.y][portaoPos.x] = OBSTACULOS.portao;

        const habilidadeKeys = Object.keys(HABILIDADES_RECOMPENSA);
        habilidadeKeys.forEach(key => {
            const habilidadeValue = HABILIDADES_RECOMPENSA[key];
            if (freeCells.length > 0) {
                const pos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
                newMaze[pos.y][pos.x] = habilidadeValue;
            }
        });
    }

    setMaze(newMaze);
  };

  const chooseCharacter = (p) => {
    setPersonagem(p);
    setPlayerHP(100);
    setHabilidadesAdquiridas({});
    setObstaculosVencidos([]);
    setPlayer({ x: 0, y: 0 });
    Alert.alert(`Herói Escolhido!`, `Você escolheu a ${p.nome}. Sua habilidade inicial é ${p.habilidadeInicial}!`);
    registrarHabilidade(p.habilidadeInicial.toLowerCase()); 
    setGameState('maze');
  };

  const getHabilidadeNameByValue = (value) => {
    return Object.keys(HABILIDADES_RECOMPENSA).find(key => HABILIDADES_RECOMPENSA[key] === value);
  };
  
  const movePlayer = (dx, dy) => {
    if (gameState !== 'maze') return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX >= 0 && newX < MAZE_WIDTH && newY >= 0 && newY < MAZE_HEIGHT) {
      const cellValue = maze[newY][newX];
      
      if (cellValue === 1) {
        setGameMessage('É uma parede. Tente outro caminho.');
        return; 
      }
      
      const hasActionAbility = todasHabilidades.persistencia || todasHabilidades.otimismo || todasHabilidades.autoconfiança;
      const hasCalmAbility = todasHabilidades.serenidade || todasHabilidades.paciencia;
      
      let messageOvercome = null;
      let damageTaken = 0;

      // --- 1. Lógica de Obstáculos e Habilidades (Vitória/Dano) ---
      
      if (cellValue === OBSTACULOS.armadilha) {
        const obstaculoNome = 'Fracasso (Armadilha)';
        if (hasActionAbility) {
            const habilidade = todasHabilidades.persistencia ? 'Persistência' : todasHabilidades.otimismo ? 'Otimismo' : 'Autoconfiança';
            messageOvercome = `🏆 Você superou o **${obstaculoNome}**! Usou **${habilidade.toUpperCase()}** para se levantar e continuar.`;
        } else {
            damageTaken = 15;
            messageOvercome = `🚨 Você foi atingido pela Armadilha do ${obstaculoNome}! Perdeu 15 HP. Não ter a Habilidade de Ação/Persistência fez você hesitar, mas sua **força de vontade** o empurrou para frente!`;
        }
        if (!obstaculosVencidos.includes(obstaculoNome)) setObstaculosVencidos([...obstaculosVencidos, obstaculoNome]);

      } else if (cellValue === OBSTACULOS.nevoa) {
        const obstaculoNome = 'Dúvida (Névoa)';
        if (hasCalmAbility) {
            const habilidade = todasHabilidades.serenidade ? 'Serenidade' : 'Paciência';
            messageOvercome = `🏆 Você superou a **${obstaculoNome}**! Usou **${habilidade.toUpperCase()}** para limpar a mente e seguir em frente com clareza.`;
        } else {
            damageTaken = 10;
            messageOvercome = `⚠️ Você hesitou na Névoa da ${obstaculoNome}! Perdeu 10 HP. Sem a Habilidade de Calma, você se sente sobrecarregado, mas a **necessidade de avançar** te fez passar.`;
        }
        if (!obstaculosVencidos.includes(obstaculoNome)) setObstaculosVencidos([...obstaculosVencidos, obstaculoNome]);

      } else if (cellValue === OBSTACULOS.portao) {
        const obstaculoNome = 'Procrastinação (Portão)';
        if (hasActionAbility) {
            const habilidade = todasHabilidades.persistencia ? 'Persistência' : todasHabilidades.otimismo ? 'Otimismo' : 'Autoconfiança';
            messageOvercome = `🏆 Você superou a **${obstaculoNome}**! Usou **${habilidade.toUpperCase()}** e agiu imediatamente para atravessar o portão.`;
        } else {
            damageTaken = 5;
            messageOvercome = `🚪 Você parou no Portão da ${obstaculoNome}! Perdeu 5 HP. Sem a Habilidade de Ação, você demorou, mas conseguiu **se forçar a seguir**!`;
        }
        if (!obstaculosVencidos.includes(obstaculoNome)) setObstaculosVencidos([...obstaculosVencidos, obstaculoNome]);
      }

      // 2. Aplicar Dano (se houver) e Atualizar Mensagem
      if (damageTaken > 0) {
        setPlayerHP(prev => {
          const newHP = Math.max(0, prev - damageTaken);
          if (newHP <= 0) {
            Alert.alert("DERROTA!", `Seu HP chegou a zero! O labirinto te consumiu. Tente novamente!`);
            setGameState('escolhaPersonagem'); 
          }
          return newHP;
        });
      }
      if (messageOvercome) {
          if (damageTaken === 0) {
              Alert.alert("Vitória Emocional!", messageOvercome);
          } else {
              Alert.alert("Avanço com Dano!", messageOvercome);
          }
          setGameMessage(messageOvercome.replace(/\*\*|🏆|🚨|⚠️|🚪/g, '').trim());
      }
      
      // --- 3. Lógica de Recompensa (Habilidades Emocionais) ---
      
      const habilidadeNome = getHabilidadeNameByValue(cellValue);
      if (habilidadeNome && !todasHabilidades[habilidadeNome.toLowerCase()]) {
        setHabilidadesAdquiridas(prev => ({ ...prev, [habilidadeNome.toLowerCase()]: true }));
        registrarHabilidade(habilidadeNome.toLowerCase());
        Alert.alert('Habilidade Desbloqueada!', `Você encontrou a Habilidade da **${habilidadeNome.toUpperCase()}**! Ela será útil na sua jornada.`);
        setGameMessage(`Você se sente mais ${habilidadeNome}. Continue explorando o labirinto!`);
      }

      // 4. Movimento Final
      setPlayer({ x: newX, y: newY });
      checkWin(newX, newY);
    }
  };


  const checkWin = (x, y) => {
    if (x === exit.x && y === exit.y) {
      setGameState('battle');
      setGameMessage(`Você encontrou a saída! Prepare-se, Herói(ína)! Use suas Habilidades Emocionais para vencer o monstro da ${personagem.monstro}!`);
    }
  };

  // --- FUNÇÃO DE BATALHA (Luta com Monstro Emocional) ---
  const useHabilidade = (habilidadeNome) => {
    if (gameState !== 'battle') return;

    const monstro = personagem.monstro;
    const habilidadeVencedora = EXPLICACAO_MONSTROS[monstro].habilidadeVencedora.toLowerCase();

    let novoHP = playerHP;

    if (habilidadeNome === habilidadeVencedora) {
      setGameMessage(`💥 GOLPE DE MISERICÓRDIA! Sua habilidade **${habilidadeNome.toUpperCase()}** é a resposta certa! Você derrota o monstro da ${monstro}!`);
      setGameState('win');
      return;
    } else {
      let dano = 0;
      let cura = 0;
      let mensagem = '';

      if (habilidadeNome === 'autocuidado') {
        cura = 25; 
        novoHP = Math.min(100, novoHP + cura);
        mensagem = `Você usou **AutoCuidado** e recuperou ${cura} HP! Se acalmou, mas o monstro não foi afetado. Escolha uma habilidade de ataque!`;
      } else if (habilidadeNome in HABILIDADES_COMBATE) {
        dano = 15; 
        novoHP = novoHP - dano;
        mensagem = `Você usou ${habilidadeNome}, mas o monstro revida! Você perde ${dano} HP. Ele ainda está forte.`;
      } else {
        dano = 30; 
        novoHP = novoHP - dano;
        mensagem = `Habilidade incorreta! O monstro da ${monstro} te atinge com força e você perde ${dano} HP. Pense na emoção oposta!`;
      }

      setPlayerHP(novoHP);
      setGameMessage(mensagem);

      if (novoHP <= 0) {
        Alert.alert("DERROTA!", `O monstro da ${monstro} te dominou! Tente o Labirinto novamente para fortalecer suas habilidades!`);
        setGameState('escolhaPersonagem');
      }
    }
  };

  // --- RENDERIZAÇÃO ESPECÍFICAS ---
    const renderBattleScreen = () => {
        const monstro = personagem.monstro;
        const todasAsHabilidadesLista = Object.keys(todasHabilidades);

        return (
            <View style={styles.battleContainer}>
                <Text style={styles.battleTitle}>Batalha Final: {monstro} 😈</Text>

                <View style={styles.hpBarContainer}>
                    <View style={[styles.hpBar, { width: `${Math.max(0, playerHP)}%` }]} />
                    <Text style={styles.battleHPText}>HP: {playerHP}</Text>
                </View>

                <Text style={styles.battleMessage}>{gameMessage}</Text>

                <Text style={styles.battleHabilidadeTitle}>Selecione sua Habilidade Emocional:</Text>

                <View style={styles.habilidadesBatalhaRow}>
                    {todasAsHabilidadesLista.map(h => (
                        <TouchableOpacity
                            key={h}
                            style={styles.habilidadeBtn}
                            onPress={() => useHabilidade(h)}
                        >
                            <Text style={styles.habilidadeBtnText}>{h.charAt(0).toUpperCase() + h.slice(1)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.monstroDica}>
                    **Dica do Monstro:** O monstro da {monstro} é a emoção oposta à sua. A habilidade de **{personagem.habilidadeInicial}** é a chave!
                </Text>
            </View>
        );
    };

    const renderWinScreen = () => {
        const monstro = personagem.monstro;
        const habilidadesStr = Object.keys(todasHabilidades).map(h => h.charAt(0).toUpperCase() + h.slice(1)).join(', ');
        const { descricao } = EXPLICACAO_MONSTROS[monstro];

        return (
            <View style={styles.winContainer}>
                <Text style={styles.winTitle}>✅ VITÓRIA! O Labirinto foi Dominado!</Text>
                <Text style={styles.winMessage}>Você derrotou o monstro da **{monstro}** usando sua habilidade de **{EXPLICACAO_MONSTROS[monstro].habilidadeVencedora}**.</Text>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Monstro Derrotado:</Text>
                    <Text style={styles.infoText}>{descricao}</Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Habilidades Emocionais Conquistadas:</Text>
                    <Text style={styles.infoText}>{habilidadesStr}</Text>
                </View>
                
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Obstáculos Vencidos com Maestria:</Text>
                    <Text style={styles.infoText}>{obstaculosVencidos.join(', ') || 'Nenhum, mas você avançou com coragem!'}</Text>
                </View>


                <TouchableOpacity
                    style={styles.finalizarBtn}
                    onPress={() => {
                        registrarConquista(CONQUISTAS_FASES.labirinto);
                        onComplete();
                    }}
                >
                    <Text style={styles.finalizarBtnText}>Continuar a Jornada</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderMaze = () => {
        return maze.map((row, y) =>
            row.map((cell, x) => {
                let backgroundColor = '#1a202c'; 
                let borderColor = '#34495e'; 
                let content = null;
                let contentColor = '#ecf0f1'; 
                let borderWidth = 1;
                
                const isPlayer = player.x === x && player.y === y;
                const isExit = exit.x === x && exit.y === y;

                if (cell === 1) { 
                    backgroundColor = '#2c3e50'; 
                    borderColor = '#34495e';
                } else { 
                    if (isExit) {
                        backgroundColor = '#27ae60'; 
                        content = '🏆'; 
                        contentColor = '#fff';
                    } else if (cell === OBSTACULOS.armadilha) {
                        backgroundColor = '#e74c3c'; 
                        content = OBSTACULO_TO_EMOJI.armadilha;
                        borderColor = '#c0392b';
                    } else if (cell === OBSTACULOS.nevoa) {
                        backgroundColor = '#3498db'; 
                        content = OBSTACULO_TO_EMOJI.nevoa;
                        borderColor = '#2980b9';
                    } else if (cell === OBSTACULOS.portao) {
                        backgroundColor = '#f39c12'; 
                        content = OBSTACULO_TO_EMOJI.portao;
                        borderColor = '#e67e22';
                    } else if (cell >= 5 && cell <= 8) { 
                        const habilidadeName = getHabilidadeNameByValue(cell);
                        backgroundColor = todasHabilidades[habilidadeName] ? '#1a202c' : HABILIDADE_TO_COLOR[cell];
                        content = todasHabilidades[habilidadeName] ? '✅' : HABILIDADE_TO_EMOJI[habilidadeName];
                        borderColor = '#f1c40f';
                        borderWidth = 2;
                    }
                }

                return (
                    <View
                        key={`${x}-${y}`}
                        style={{
                            position: 'absolute',
                            left: x * TILE_SIZE,
                            top: y * TILE_SIZE,
                            width: TILE_SIZE,
                            height: TILE_SIZE,
                            backgroundColor: backgroundColor,
                            borderWidth: borderWidth,
                            borderColor: borderColor,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {content && (
                            <Text style={{ fontSize: TILE_SIZE * 0.4, color: contentColor }}>{content}</Text>
                        )}
                        {isPlayer && (
                            <View style={{
                                position: 'absolute',
                                width: TILE_SIZE * 0.7,
                                height: TILE_SIZE * 0.7,
                                borderRadius: TILE_SIZE * 0.35,
                                backgroundColor: personagem?.cor || '#f7d716',
                                justifyContent: 'center',
                                alignItems: 'center',
                                left: (TILE_SIZE - (TILE_SIZE * 0.7)) / 2,
                                top: (TILE_SIZE - (TILE_SIZE * 0.7)) / 2,
                            }}>
                                <Text style={{ fontSize: TILE_SIZE * 0.4, color: '#000' }}>{personagem?.emoji || '🚶'}</Text>
                            </View>
                        )}
                    </View>
                );
            })
        );
    };

    if (gameState === 'escolhaPersonagem') {
      return (
        <View style={styles.escolhaContainer}>
          <Text style={styles.titulo}>Escolha seu Herói</Text>
          <Text style={styles.subTitulo}>Cada herói tem uma Habilidade Inicial para a jornada!</Text>
          <View style={styles.personagemGrid}>
            {personagens.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.personagemBtn, { backgroundColor: p.cor }]}
                onPress={() => chooseCharacter(p)}
                activeOpacity={0.8}
              >
                <Text style={styles.emoji}>{p.emoji}</Text>
                <Text style={styles.nomePersonagem}>{p.nome}</Text>
                <Text style={styles.habilidadeInicialText}>Habilidade: {p.habilidadeInicial}</Text>
                <Text style={styles.monstroText}>Vs. {p.monstro}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (gameState === 'win') {
      return renderWinScreen();
    }

    if (gameState === 'battle') {
      return (
        <View style={styles.containerLabirinto}>
          {renderBattleScreen()}
        </View>
      );
    }

    return (
      <View style={styles.containerLabirinto}>
        <View style={styles.statsBar}>
          <Text style={styles.hpText}>HP: {playerHP}</Text>
          <Text style={styles.hpText}>Monstro: {personagem?.monstro}</Text>
        </View>
        <Text style={styles.gameInfo}>{gameMessage}</Text>

        <View style={styles.habilidadesDisplay}>
          <Text style={styles.habilidadesTitulo}>Habilidades Atuais:</Text>
          <ScrollView horizontal style={styles.habilidadesRow}>
            {Object.keys(todasHabilidades).length > 0 ? (
              Object.keys(todasHabilidades).map(h => (
                <View key={h} style={styles.habilidadePill}>
                  <Text style={styles.habilidadePillText}>{h.charAt(0).toUpperCase() + h.slice(1)}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#ecf0f1' }}>Nenhuma habilidade ainda. Explore!</Text>
            )}
          </ScrollView>
        </View>

        <View style={[styles.mazeContainer, { width: MAZE_WIDTH * TILE_SIZE, height: MAZE_HEIGHT * TILE_SIZE }]}>
          {renderMaze()}
        </View>

        {gameState === 'maze' && (
          <View style={styles.controls}>
              <TouchableOpacity style={styles.buttonUp} onPress={() => movePlayer(0, -1)}>
                <Text style={styles.buttonText}>⬆️ Cima</Text>
              </TouchableOpacity>
              <View style={styles.row}>
                <TouchableOpacity style={styles.buttonLeft} onPress={() => movePlayer(-1, 0)}>
                  <Text style={styles.buttonText}>⬅️ Esquerda</Text>
                </TouchableOpacity>
                <View style={{ width: 100 }}></View>
                <TouchableOpacity style={styles.buttonRight} onPress={() => movePlayer(1, 0)}>
                  <Text style={styles.buttonText}>Direita ➡️</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.buttonDown} onPress={() => movePlayer(0, 1)}>
                <Text style={styles.buttonText}>⬇️ Baixo</Text>
              </TouchableOpacity>
          </View>
        )}
      </View>
    );
}

// --- COMPONENTE FASE 2: DIÁRIO EMOCIONAL (DINÂMICO) ---
function DiarioEmocional({ onComplete, registrarConquista }) {
    const [personagemEscolhido, setPersonagemEscolhido] = useState(null);
    const [fase, setFase] = useState('escolha'); // 'escolha', 'dialogo', 'fim'
    const [dialogoState, setDialogoState] = useState('0'); // Chave do DIALOGO_FLOW
    const [historicoConversa, setHistoricoConversa] = useState([]);
    const [adviceAtual, setAdviceAtual] = useState('');
    const [lastContinueState, setLastContinueState] = useState('0'); // Armazena a próxima rota de aprofundamento
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const dialogo = DIALOGO_FLOW[dialogoState];
    const personagemNome = personagemEscolhido ? personagemEscolhido.nome : '';

    // Efeito para animação da Pergunta/Advice
    useEffect(() => {
        if (fase === 'dialogo') {
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [dialogoState, fase]);

    const escolherPersonagem = (p) => {
        setPersonagemEscolhido(p);
        Alert.alert(`Olá, ${p.nome}!`, `Seu amigo digital, ${p.nome}, está aqui para te ajudar a processar suas emoções.`);
        setFase('dialogo');
        setAdviceAtual(''); 
        setLastContinueState('0'); // Reseta a continuação ao iniciar um novo diálogo
    };

    const responderPergunta = (emocao, nextState, opcao) => {
        // 1. Registra a escolha no histórico
        setHistoricoConversa(prev => [...prev, { state: dialogoState, emocao: emocao }]);
        
        // 2. Lógica de Continuação Dinâmica
        // Se a opção possui 'continueNext', salva para ser usada no encerramento.
        if (opcao && opcao.continueNext) {
            setLastContinueState(opcao.continueNext);
        }

        // 3. Verifica a condição de finalização
        if (nextState === 'FINALIZAR') {
            registrarConquista(CONQUISTAS_FASES.folha);
            setFase('fim');
            return;
        }

        // 4. Lógica para "Conversar Mais (Aprofundar)"
        if (nextState === 'CONTINUE_DYNAMIC') {
            // Se o usuário escolher continuar no 3_ENCERRAMENTO,
            // o diálogo vai para a última rota de aprofundamento salva,
            // ou volta para '0' se não houver rota salva.
            setDialogoState(lastContinueState || '0'); 
            setAdviceAtual(''); // Reseta o advice para a nova pergunta aparecer limpa
            return;
        }

        // 5. Prepara o Advice para o próximo passo
        const nextDialogo = DIALOGO_FLOW[nextState];
        if (nextDialogo && nextDialogo.advice) {
            setAdviceAtual(nextDialogo.advice(personagemNome));
        } else {
            setAdviceAtual('');
        }

        // 6. Avança o diálogo
        setDialogoState(nextState);
    };

    // --- RENDERIZAÇÃO DA ESCOLHA ---
    if (fase === 'escolha') {
        return (
            <View style={styles.escolhaContainerFase2}>
                <Text style={styles.tituloFase2}>Escolha seu Amigo Digital</Text>
                <Text style={styles.subTituloFase2}>Ele(a) te guiará no processamento das suas emoções.</Text>
                <View style={styles.personagemGridFase2}>
                    {PERSONAGENS_DIGITAIS.map((p) => (
                        <TouchableOpacity
                            key={p.id}
                            style={[styles.personagemBtnFase2, { backgroundColor: p.cor }]}
                            onPress={() => escolherPersonagem(p)}
                        >
                            <Text style={styles.emojiFase2}>{p.emoji}</Text>
                            <Text style={styles.nomePersonagemFase2}>{p.nome}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    }
    
    // --- RENDERIZAÇÃO DO DIÁLOGO ---
    if (fase === 'dialogo') {
        
        return (
            <View style={styles.dialogoContainer}>
                <Text style={styles.tituloFase2}>Diálogo com {personagemNome}</Text>
                
                <Animated.View style={[styles.personagemDisplay, { backgroundColor: personagemEscolhido.cor }]}>
                    <Text style={styles.personagemEmojiGrande}>{personagemEscolhido.emoji}</Text>
                    <Text style={styles.personagemNomeDialogo}>{personagemNome}</Text>
                </Animated.View>

                {/* Balão de Advice do Personagem (Reação à resposta anterior) */}
                {adviceAtual ? (
                    <Animated.View style={[styles.balaoPersonagem, { opacity: fadeAnim }]}>
                        <Text style={styles.balaoTextoPersonagem}>{adviceAtual}</Text>
                    </Animated.View>
                ) : null}

                {/* Balão de Pergunta do Personagem */}
                <Animated.View style={[styles.balaoPersonagemPergunta, { opacity: fadeAnim, alignSelf: 'flex-start' }]}>
                    <Text style={styles.balaoTextoPersonagem}>{dialogo.pergunta}</Text>
                </Animated.View>
                
                {/* Opções de Resposta do Usuário */}
                <View style={styles.opcoesContainer}>
                    {dialogo.opcoes.map((opcao, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.opcaoBotao}
                            // Passa a opção inteira como 3º argumento para a Continuação Dinâmica
                            onPress={() => responderPergunta(opcao.emocao, opcao.next, opcao)}
                        >
                            <Text style={styles.opcaoTexto}>{opcao.texto}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.historicoTexto}>Passos na conversa: {historicoConversa.length}</Text>
            </View>
        );
    }

    // --- RENDERIZAÇÃO FINAL ---
    if (fase === 'fim') {
        const relatorioFinal = gerarRelatorio(historicoConversa, personagemNome);
        const mostrarRecursos = relatorioFinal.grave;
        
        return (
            <View style={styles.finalContainer}>
                <Text style={styles.finalTitulo}>Fase 2 Concluída!</Text>
                <Text style={styles.finalPontuacao}>{relatorioFinal.titulo}</Text>
                
                <ScrollView style={styles.relatorioBox}>
                    {/* Alerta de Gravidade / Mensagem de Resumo */}
                    {mostrarRecursos ? (
                        <View style={styles.alertaGrave}>
                             <Text style={styles.alertaGraveTitulo}>{RECURSOS_OFICIAIS.titulo}</Text>
                             <Text style={styles.alertaGraveMensagem}>{RECURSOS_OFICIAIS.mensagem}</Text>
                        </View>
                    ) : null}

                    {/* Resumo e Recomendação */}
                    <Text style={styles.relatorioTexto}>{relatorioFinal.resumo}</Text>
                    <Text style={[styles.relatorioTexto, { fontWeight: 'bold', marginTop: 15 }]}>Sugerido por {personagemNome}:</Text>
                    <Text style={styles.relatorioTexto}>{relatorioFinal.recomendacao}</Text>

                    {/* Recursos Oficiais (se grave) */}
                    {mostrarRecursos && (
                        <View style={styles.recursosContainer}>
                            <Text style={styles.recursosTitulo}>Recursos de Apoio Imediato:</Text>
                            {RECURSOS_OFICIAIS.recursos.map((recurso, index) => (
                                <TouchableOpacity key={index} style={styles.recursoBtn} onPress={() => openUrl(recurso.url)}>
                                    <Text style={styles.recursoBtnNome}>{recurso.nome}</Text>
                                    <Text style={styles.recursoBtnNumero}>{recurso.numero}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                </ScrollView>
                <TouchableOpacity style={styles.finalizarBtnFase2} onPress={onComplete}>
                    <Text style={styles.finalizarBtnTexto}>Continuar Jornada</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

// --- COMPONENTE FASE 3: FLORESTA DA ANSIEDADE ---
function FlorestaDaAnsiedade({ onComplete, registrarConquista }) {
  const frases = [
    'Você é mais forte do que pensa.',
    'Respire fundo, está tudo bem.',
    'Essa emoção vai passar.',
    'Você está no controle agora.',
    'Continue firme na sua jornada!',
    'Lembre-se: Ansiedade é excesso de futuro. Foco no presente!',
    'Pequenos passos constantes vencem a pressa.',
  ];

  const [posicao, setPosicao] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Alert.alert("Explicação da Missão", EXPLICACOES_FASES.floresta);
  }, []);

  const avancar = () => {
    if (posicao < frases.length - 1) {
      Animated.timing(translateX, {
        toValue: -80,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        translateX.setValue(0);
        setPosicao(posicao + 1);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    } else {
      registrarConquista(CONQUISTAS_FASES.floresta);
      Alert.alert('Conquista!', CONQUISTAS_FASES.floresta);
      onComplete();
    }
  };

  const personagemEmoji = '🧙‍♂️';

  const cenarios = [
    ['🌲', '🌿', '🍃', '🌳', '🍂'],
    ['🍃', '🌲', '🍂', '🌿', '🌳'],
    ['🌿', '🍂', '🌲', '🍃', '🌲'],
    ['🌳', '🌿', '🍃', '🌲', '🍂'],
    ['🍂', '🌳', '🌿', '🍂', '🌲'],
  ];

  return (
    <View style={styles.florestaContainer}>
      <Text style={styles.descricao}>Floresta da Ansiedade</Text>
      <View style={styles.cenarioLinhaContainer}>
        <Animated.View
          style={[
            styles.personagemContainer,
            { transform: [{ translateX }] },
          ]}
        >
          <Text style={styles.personagemEmoji}>{personagemEmoji}</Text>
        </Animated.View>
        <View style={styles.cenario}>
          {cenarios[posicao % cenarios.length].map((item, i) => (
            <Text key={i} style={styles.cenarioEmoji}>
              {item}
            </Text>
          ))}
        </View>
      </View>
      <Animated.Text style={[styles.fraseFloresta, { opacity: fadeAnim }]}>
        {frases[posicao]}
      </Animated.Text>
      <TouchableOpacity style={styles.botaoFloresta} onPress={avancar}>
        <Text style={styles.botaoTexto}>Próxima Mensagem ({posicao + 1}/{frases.length})</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- COMPONENTE PRINCIPAL (Controle de Fases) ---
export default function Missoes() {
  const [faseAtual, setFaseAtual] = useState(null);
  const [conquistas, setConquistas] = useState({});
  const [habilidades, setHabilidades] = useState({}); 

  const registrarConquista = (conquista) => {
    setConquistas(prev => ({ ...prev, [conquista]: true }));
    Alert.alert("🎉 CONQUISTA REGISTRADA!", `Você desbloqueou: ${conquista}`);
  };

  const registrarHabilidade = (habilidade) => {
    const key = habilidade.toLowerCase();
    if (!habilidades[key]) {
      setHabilidades(prev => ({ ...prev, [key]: true }));
    }
  };

  const iniciarFase = (fase) => {
    setFaseAtual(fase);
  };

  const resetFase = () => {
    setFaseAtual(null);
  };

  let conteudoFase = null;
  if (faseAtual === 'labirinto') {
    conteudoFase = <NovoLabirinto
      onComplete={resetFase}
      registrarConquista={registrarConquista}
      registrarHabilidade={registrarHabilidade}
    />;
  } else if (faseAtual === 'folha') {
    conteudoFase = <DiarioEmocional 
        onComplete={resetFase} 
        registrarConquista={registrarConquista} 
    />;
  } else if (faseAtual === 'floresta') {
    conteudoFase = <FlorestaDaAnsiedade 
        onComplete={resetFase} 
        registrarConquista={registrarConquista} 
    />;
  }

  const renderConquistasHabilidades = () => (
    <View style={styles.registroContainer}>
      <Text style={styles.registroTitulo}>🏆 Seu Progresso</Text>

      <Text style={styles.registroSubTitulo}>Conquistas de Fase:</Text>
      <ScrollView horizontal style={styles.habilidadesRow}>
        {Object.keys(conquistas).length > 0 ? (
          Object.keys(conquistas).map(c => (
            <View key={c} style={styles.habilidadePill}>
              <Text style={styles.habilidadePillText}>{c}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: '#555' }}>Nenhuma conquista ainda.</Text>
        )}
      </ScrollView>

      <Text style={styles.registroSubTitulo}>Habilidades Emocionais:</Text>
      <ScrollView horizontal style={styles.habilidadesRow}>
        {Object.keys(habilidades).length > 0 ? (
          Object.keys(habilidades).map(h => (
            <View key={h} style={styles.habilidadePill}>
              <Text style={styles.habilidadePillText}>{h.charAt(0).toUpperCase() + h.slice(1)}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: '#555' }}>Nenhuma habilidade emocional registrada.</Text>
        )}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.containerPrincipal}>
      <Text style={styles.tituloPrincipal}>Missões do Herói das Emoções</Text>

      {renderConquistasHabilidades()}

      {!faseAtual && (
        <View style={styles.menuFases}>
          <TouchableOpacity style={styles.botaoFase} onPress={() => iniciarFase('labirinto')}>
            <Text style={styles.botaoTexto}>Fase 1: Labirinto da Calma</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoFase} onPress={() => iniciarFase('folha')}>
            <Text style={styles.botaoTexto}>Fase 2: Diálogo Emocional</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoFase} onPress={() => iniciarFase('floresta')}>
            <Text style={styles.botaoTexto}>Fase 3: Floresta da Ansiedade</Text>
          </TouchableOpacity>
        </View>
      )}
      {conteudoFase && (
        <TouchableOpacity style={styles.botaoVoltar} onPress={resetFase}>
          <Text style={styles.botaoTexto}>Voltar ao Menu de Missões</Text>
        </TouchableOpacity>
      )}
      {conteudoFase}
    </ScrollView>
  );
}

// --- ESTILOS REACT NATIVE COMPLETOS E UNIFICADOS ---
const styles = StyleSheet.create({
    // --- ESTILOS PRINCIPAIS/Gerais ---
    containerPrincipal: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: '#F0F4F8', 
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    tituloPrincipal: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1a202c',
      marginBottom: 20,
    },
    registroContainer: {
      width: '100%',
      padding: 15,
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    registroTitulo: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#34495e',
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingBottom: 5,
    },
    registroSubTitulo: {
      fontSize: 14,
      fontWeight: '600',
      color: '#7f8c8d',
      marginTop: 10,
      marginBottom: 5,
    },
    habilidadesRow: {
      flexDirection: 'row',
      marginBottom: 5,
    },
    habilidadePill: {
      backgroundColor: '#3498db',
      borderRadius: 15,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginRight: 8,
      marginBottom: 8,
    },
    habilidadePillText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    menuFases: {
      width: '100%',
      padding: 10,
      borderRadius: 8,
      backgroundColor: '#ecf0f1',
      marginBottom: 20,
    },
    botaoFase: {
      backgroundColor: '#2ecc71',
      padding: 15,
      borderRadius: 8,
      marginVertical: 5,
      alignItems: 'center',
    },
    botaoTexto: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    botaoVoltar: {
      backgroundColor: '#e74c3c',
      padding: 10,
      borderRadius: 8,
      marginVertical: 10,
      width: '90%',
      alignItems: 'center',
    },
  
    // --- ESTILOS FASE 1: LABIRINTO ---
    escolhaContainer: {
      padding: 15,
      alignItems: 'center',
      width: '100%',
    },
    titulo: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#34495e',
    },
    subTitulo: {
      fontSize: 14,
      color: '#7f8c8d',
      marginBottom: 20,
      textAlign: 'center',
    },
    personagemGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      width: '100%',
    },
    personagemBtn: {
      width: '45%', 
      aspectRatio: 1,
      borderRadius: 10,
      padding: 10,
      marginBottom: 15,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    emoji: {
      fontSize: 30,
      marginBottom: 5,
    },
    nomePersonagem: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
    },
    habilidadeInicialText: {
      fontSize: 12,
      color: '#34495e',
      fontWeight: '500',
    },
    monstroText: {
      fontSize: 12,
      color: '#c0392b',
      marginTop: 3,
      fontWeight: 'bold',
    },
    containerLabirinto: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: '#1a202c', 
      padding: 20,
      width: '100%',
    },
    statsBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      padding: 10,
      backgroundColor: '#34495e',
      borderRadius: 5,
      marginBottom: 10,
    },
    hpText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    gameInfo: {
      color: '#ecf0f1',
      textAlign: 'center',
      marginBottom: 15,
      fontSize: 13,
      minHeight: 30,
    },
    habilidadesDisplay: {
      width: '100%',
      marginBottom: 15,
    },
    habilidadesTitulo: {
      color: '#f1c40f',
      fontWeight: 'bold',
      marginBottom: 5,
    },
    mazeContainer: {
      backgroundColor: '#1a202c',
      position: 'relative', 
      borderWidth: 3,
      borderColor: '#34495e',
      marginBottom: 20,
    },
    controls: {
      alignItems: 'center',
      marginBottom: 10,
      width: '80%',
      maxWidth: 300,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginVertical: 5,
    },
    buttonUp: {
      backgroundColor: '#2980b9',
      padding: 10,
      borderRadius: 5,
      width: '50%',
      alignItems: 'center',
      marginBottom: 5,
    },
    buttonDown: {
      backgroundColor: '#2980b9',
      padding: 10,
      borderRadius: 5,
      width: '50%',
      alignItems: 'center',
      marginTop: 5,
    },
    buttonLeft: {
      backgroundColor: '#2980b9',
      padding: 10,
      borderRadius: 5,
      width: '40%',
      alignItems: 'center',
    },
    buttonRight: {
      backgroundColor: '#2980b9',
      padding: 10,
      borderRadius: 5,
      width: '40%',
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    battleContainer: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#1a202c',
      borderRadius: 10,
      width: '100%',
    },
    battleTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#e74c3c',
      marginBottom: 15,
    },
    hpBarContainer: {
      width: '90%',
      height: 25,
      backgroundColor: '#c0392b',
      borderRadius: 12,
      marginBottom: 15,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    hpBar: {
      height: '100%',
      backgroundColor: '#2ecc71',
    },
    battleHPText: {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
      color: '#fff',
      fontWeight: 'bold',
    },
    battleMessage: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
      minHeight: 50,
      marginBottom: 20,
    },
    battleHabilidadeTitle: {
      color: '#f1c40f',
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 10,
    },
    habilidadesBatalhaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    habilidadeBtn: {
      backgroundColor: '#3498db',
      padding: 10,
      borderRadius: 5,
      margin: 5,
    },
    habilidadeBtnText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    monstroDica: {
      color: '#bdc3c7',
      fontSize: 12,
      marginTop: 15,
      textAlign: 'center',
    },
    winContainer: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#2ecc71',
      borderRadius: 10,
      width: '100%',
    },
    winTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 15,
    },
    winMessage: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    infoBox: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      width: '100%',
    },
    infoTitle: {
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 5,
    },
    infoText: {
      color: '#fff',
      fontSize: 14,
    },
    finalizarBtn: {
      backgroundColor: '#3498db',
      padding: 15,
      borderRadius: 8,
      marginTop: 20,
      width: '90%',
      alignItems: 'center',
    },
    finalizarBtnText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  
    // --- ESTILOS FASE 2: DIÁRIO EMOCIONAL ---
    escolhaContainerFase2: {
        padding: 20,
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#f7f9fc',
        borderRadius: 10,
    },
    tituloFase2: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4682B4',
        marginBottom: 10,
    },
    subTituloFase2: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 20,
        textAlign: 'center',
    },
    personagemGridFase2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '100%',
    },
    personagemBtnFase2: {
        width: '45%', 
        aspectRatio: 1.2,
        borderRadius: 15,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    emojiFase2: {
        fontSize: 40,
        marginBottom: 5,
    },
    nomePersonagemFase2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34495e',
    },
    dialogoContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    personagemDisplay: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        borderWidth: 5,
        borderColor: '#4682B4',
    },
    personagemEmojiGrande: {
        fontSize: 50,
    },
    personagemNomeDialogo: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        color: '#34495e',
    },
    balaoPersonagem: {
        backgroundColor: '#4682B4',
        padding: 15,
        borderRadius: 20,
        borderTopLeftRadius: 0,
        marginBottom: 20,
        maxWidth: '85%',
        alignSelf: 'flex-start',
    },
    balaoPersonagemPergunta: { // Novo estilo para o balão de pergunta
        backgroundColor: '#4682B4', 
        padding: 15,
        borderRadius: 20,
        borderTopLeftRadius: 0,
        marginBottom: 20,
        maxWidth: '85%',
        alignSelf: 'flex-start',
    },
    balaoTextoPersonagem: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    opcoesContainer: {
        width: '100%',
        alignItems: 'center',
    },
    opcaoBotao: {
        backgroundColor: '#ecf0f1',
        padding: 12,
        borderRadius: 10,
        marginVertical: 5,
        width: '90%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bdc3c7',
    },
    opcaoTexto: {
        fontSize: 15,
        color: '#2c3e50',
        fontWeight: '500',
    },
    finalContainer: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderRadius: 10,
    },
    finalTitulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 10,
    },
    finalPontuacao: {
        fontSize: 18,
        color: '#388E3C',
        marginBottom: 15,
    },
    finalizarBtnFase2: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        width: '80%',
        alignItems: 'center',
    },
    finalizarBtnTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    historicoTexto: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 15,
    },
    relatorioBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginVertical: 15,
        width: '100%',
        maxHeight: 400, // Aumentado para caber o alerta de recurso
        borderWidth: 1,
        borderColor: '#B9F6CA',
    },
    relatorioTexto: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
    },
    // --- ESTILOS para RECURSOS OFICIAIS ---
    alertaGrave: {
        backgroundColor: '#FBE8E9',
        borderLeftWidth: 5,
        borderLeftColor: '#E74C3C',
        padding: 15,
        borderRadius: 5,
        marginBottom: 15,
    },
    alertaGraveTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E74C3C',
        marginBottom: 5,
    },
    alertaGraveMensagem: {
        fontSize: 14,
        color: '#333',
    },
    recursosContainer: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    recursosTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    recursoBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ECF0F1',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
    },
    recursoBtnNome: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2980B9',
    },
    recursoBtnNumero: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E74C3C',
    },
  
    // --- ESTILOS FASE 3: FLORESTA ---
    florestaContainer: {
      flex: 1,
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#4CAF50',
      width: '100%',
    },
    descricao: { 
      fontSize: 22,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 20,
    },
    cenarioLinhaContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 100,
      marginBottom: 20,
      overflow: 'hidden',
    },
    personagemContainer: {
      height: 50,
      width: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    personagemEmoji: {
      fontSize: 30,
    },
    cenario: {
      flexDirection: 'row',
      height: '100%',
      alignItems: 'flex-end',
    },
    cenarioEmoji: {
      fontSize: 30,
      marginHorizontal: 5,
    },
    fraseFloresta: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginVertical: 20,
      minHeight: 50,
    },
    botaoFloresta: {
      backgroundColor: '#1B5E20',
      padding: 15,
      borderRadius: 8,
      marginTop: 10,
      width: '80%',
      alignItems: 'center',
    },
  });