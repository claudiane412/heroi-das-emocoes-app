import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Easing,
  Switch,
  TextInput,
  Dimensions,
} from 'react-native';

// --- Constantes e explicações das fases (mantidas) ---
const CONQUISTAS_FASES = {
  labirinto: "Dominei o Labirinto da Calma!",
  folha: "Respirei Fundo e Encontrei a Paz!",
  floresta: "Venci a Floresta da Ansiedade!",
};

const EXPLICACOES_FASES = {
  labirinto: `Fase 1 - Labirinto da Calma:
Representa o desafio de regular as emoções.
Use a paciência e as habilidades emocionais que encontrar
para avançar e enfrentar o monstro da sua emoção oposta!`,
  folha: `Fase 2 - Folha da Calma:
Aqui você pratica a respiração guiada para regular suas emoções,
aprendendo a focar no momento presente e acalmar a mente.`,
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

// --- NOVO OBJETO: Explicações dos Monstros ---
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

// --- NOVO OBJETO: Relação entre Habilidades Adquiridas e Monstros ---
// Habilidades adicionais que ajudam a lutar ou funcionam como um 'coringa'
const HABILIDADES_COMBATE = {
    persistencia: 'Ajudar a atravessar obstáculos/tentar novamente.',
    empatia: 'Pode ser usada contra a Raiva para entender o outro lado.',
    autoCuidado: 'Recuperar energia após um erro na batalha (dano leve).',
    gratidao: 'Pode ser usada contra a Tristeza (focar no positivo).',
};

// --- NOVO CÓDIGO DO LABIRINTO (Com Habilidades) ---
const { width } = Dimensions.get('window');

// Configurações do Labirinto (mantidas)
const MAZE_WIDTH = 15;
const MAZE_HEIGHT = 15;
const TILE_SIZE = Math.floor((width - 60) / MAZE_WIDTH); 
const exit = { x: MAZE_WIDTH - 1, y: MAZE_HEIGHT - 1 };

const generateMaze = () => {
  // ... (função mantida)
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

// Obstáculos e Habilidades (Recompensas Emocionais) - (mantidos)
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

// Emojis/Ícones para visualização no labirinto (mantidos)
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

function NovoLabirinto({ onComplete, registrarConquista, registrarHabilidade }) {
  const [maze, setMaze] = useState([]);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [personagem, setPersonagem] = useState(null);
  const [gameState, setGameState] = useState('escolhaPersonagem');
  const [gameMessage, setGameMessage] = useState('');
  
  // HP do personagem (Novo Estado)
  const [playerHP, setPlayerHP] = useState(100); 

  // Habilidades Emocionais Adquiridas no Labirinto (mantidas)
  const [habilidadesAdquiridas, setHabilidadesAdquiridas] = useState({});
  const todasHabilidades = personagem ? { [personagem.habilidadeInicial]: true, ...habilidadesAdquiridas } : habilidadesAdquiridas;
  
  const [obstaculosVencidos, setObstaculosVencidos] = useState([]);

  useEffect(() => {
    if (gameState === 'maze' && personagem) {
      Alert.alert("Explicação da Missão", EXPLICACOES_FASES.labirinto);
      setGameMessage(`Você é ${personagem.nome} (Habilidade Inicial: ${personagem.habilidadeInicial}). Encontre a saída para enfrentar o monstro da ${personagem.monstro}.`);
      generateMazeWithItems();
    }
  }, [gameState, personagem]);

  const generateMazeWithItems = () => {
    // ... (função mantida)
    const newMaze = generateMaze();
    const freeCells = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (newMaze[y][x] === 0 && !(x === 0 && y === 0) && !(x === exit.x && y === exit.y)) {
          freeCells.push({ x, y });
        }
      }
    }

    // Adicionar obstáculos
    if (freeCells.length > 0) {
        const armadilhaPos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
        newMaze[armadilhaPos.y][armadilhaPos.x] = OBSTACULOS.armadilha;
    }

    if (freeCells.length > 0) {
        const nevoaPos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
        newMaze[nevoaPos.y][nevoaPos.x] = OBSTACULOS.nevoa;
    }
    
    if (freeCells.length > 0) {
        const portaoPos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
        newMaze[portaoPos.y][portaoPos.x] = OBSTACULOS.portao;
    }

    // Adicionar 4 habilidades/recompensas
    const habilidadeKeys = Object.keys(HABILIDADES_RECOMPENSA);
    habilidadeKeys.forEach(key => {
        const habilidadeValue = HABILIDADES_RECOMPENSA[key];
        if (freeCells.length > 0) {
            const pos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
            newMaze[pos.y][pos.x] = habilidadeValue;
        }
    });

    setMaze(newMaze);
  };

  const chooseCharacter = (p) => {
    setPersonagem(p);
    setPlayerHP(100); // Resetar HP ao escolher
    Alert.alert(`Herói Escolhido!`, `Você escolheu a ${p.nome}. Sua habilidade inicial é ${p.habilidadeInicial}!`);
    registrarHabilidade(p.habilidadeInicial); // Garantir que a inicial está registrada
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
        return; // É uma parede
      }

      // --- Lógica de Obstáculos e Habilidades (mantida) ---
      const temHabilidadeAcao = todasHabilidades.Otimismo || todasHabilidades.Autoconfiança || todasHabilidades.Persistencia;

      if (cellValue === OBSTACULOS.armadilha) {
        setGameMessage('Ops! Armadilha de Fracasso! Use sua Coragem/Otimismo para superar e tentar de novo.');
        if (!obstaculosVencidos.includes('Armadilha de Fracasso')) {
          setObstaculosVencidos([...obstaculosVencidos, 'Armadilha de Fracasso']);
        }
        return;
      }

      if (cellValue === OBSTACULOS.nevoa) {
        setGameMessage('Uma Névoa de Dúvida te impede de enxergar. Fique parado e use sua Serenidade/Paciência para clarear a mente!');
        if (!obstaculosVencidos.includes('Névoa de Dúvida')) {
          setObstaculosVencidos([...obstaculosVencidos, 'Névoa de Dúvida']);
        }
        return;
      }
      
      if (cellValue === OBSTACULOS.portao) {
        if (temHabilidadeAcao) {
          setGameMessage(`Você usou sua ${temHabilidadeAcao ? 'Persistência/Ação' : 'Habilidade Inicial'} e atravessou o Portão da Procrastinação!`);
          if (!obstaculosVencidos.includes('Portão da Procrastinação')) {
            setObstaculosVencidos([...obstaculosVencidos, 'Portão da Procrastinação']);
          }
        } else {
          setGameMessage('O Portão da Procrastinação está bloqueado! Encontre a habilidade de Persistência ou use uma Habilidade de Ação (Coragem/Alegria) para abri-lo.');
          return;
        }
      }

      // Lógica de Recompensa (Habilidades Emocionais)
      const habilidadeNome = getHabilidadeNameByValue(cellValue);
      if (habilidadeNome && !habilidadesAdquiridas[habilidadeNome]) {
        setHabilidadesAdquiridas(prev => ({ ...prev, [habilidadeNome]: true }));
        registrarHabilidade(habilidadeNome);
        Alert.alert('Habilidade Desbloqueada!', `Você encontrou a Habilidade da **${habilidadeNome.toUpperCase()}**! Ela será útil na sua jornada.`);
        setGameMessage(`Você se sente mais ${habilidadeNome}. Continue explorando o labirinto!`);
      }

      setPlayer({ x: newX, y: newY });
      checkWin(newX, newY);
    }
  };

  const checkWin = (x, y) => {
    if (x === exit.x && y === exit.y) {
      setGameState('battle');
      setGameMessage(`Você encontrou a saída! Agora, use suas Habilidades Emocionais para vencer o monstro da ${personagem.monstro}!`);
    }
  };

  // --- NOVA FUNÇÃO DE BATALHA ---
  const useHabilidade = (habilidadeNome) => {
    if (gameState !== 'battle') return;

    const monstro = personagem.monstro;
    const habilidadeVencedora = EXPLICACAO_MONSTROS[monstro].habilidadeVencedora;
    
    // Lista de habilidades que são 'coringas' e podem causar dano (ou se curar)
    const habilidadesCoringa = {
        'autoCuidado': 10, // Cura
        'persistencia': 5, // Dano leve
        'empatia': 5, // Dano leve
        'gratidao': 5, // Dano leve
    };

    if (habilidadeNome === habilidadeVencedora) {
      // VENCEDOR! Habilidade correta derrota o monstro em 1 hit.
      setGameMessage(`Sua habilidade **${habilidadeNome}** é a resposta certa! Você derrota o monstro da ${monstro}!`);
      setGameState('win');
    } else {
      // PERDEDOR / Habilidade Incorreta: Causa dano, a menos que seja AutoCuidado
      let dano = 15;
      let cura = 0;

      if (habilidadeNome === 'autoCuidado') {
        cura = habilidadesCoringa.autoCuidado;
        setPlayerHP(prev => Math.min(100, prev + cura)); // Cura (máx 100)
        setGameMessage(`Você usou **AutoCuidado**! Isso te acalmou (+${cura} HP), mas não atingiu o monstro. Tente outra habilidade.`);
      } else if (habilidadeNome in habilidadesCoringa) {
        dano = dano / 2; // Coringas causam menos dano por serem uma 'ação'
        setPlayerHP(prev => prev - dano);
        setGameMessage(`Você usou ${habilidadeNome}, mas não foi o golpe final! O monstro revida (-${dano} HP).`);
      } else {
        setPlayerHP(prev => prev - dano);
        setGameMessage(`Habilidade incorreta! O monstro da ${monstro} te atinge (-${dano} HP). Escolha sabiamente!`);
      }

      if (playerHP - dano <= 0) {
        Alert.alert("DERROTA!", `O monstro da ${monstro} te dominou. Tente o Labirinto novamente para fortalecer suas habilidades!`);
        onComplete(); // Volta para o menu de missões
      }
    }
  };
  
  // --- Renderização do Menu de Batalha (Novo) ---
  const renderBattleScreen = () => {
    const monstro = personagem.monstro;
    const { descricao } = EXPLICACAO_MONSTROS[monstro];
    const todasAsHabilidades = Object.keys(todasHabilidades);

    return (
        <View style={styles.battleContainer}>
            <Text style={styles.battleTitle}>Batalha Final: {monstro}</Text>
            <Text style={styles.battleHP}>HP: {playerHP}</Text>
            <Text style={styles.battleMessage}>{gameMessage}</Text>
            
            <Text style={styles.battleHabilidadeTitle}>Selecione sua Habilidade Emocional:</Text>
            
            <View style={styles.habilidadesRow}>
                {todasAsHabilidades.map(h => (
                    <TouchableOpacity
                        key={h}
                        style={styles.habilidadeBtn}
                        onPress={() => useHabilidade(h)}
                    >
                        <Text style={styles.habilidadeBtnText}>{h}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            <Text style={styles.monstroDica}>
                **Dica do Monstro:** O monstro da {monstro} é a emoção oposta à sua. A habilidade de **{personagem.habilidadeInicial}** é a chave!
            </Text>
        </View>
    );
  };
  
  // --- Renderização da Tela de Vitória (Novo) ---
  const renderWinScreen = () => {
    const monstro = personagem.monstro;
    const habilidadesStr = Object.keys(todasHabilidades).join(', ');
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
  
  // O renderMaze (mantido)
  const renderMaze = () => {
    return maze.map((row, y) =>
      row.map((cell, x) => {
        let backgroundColor = '#1a202c'; // Cor do caminho, similar ao fundo escuro das suas imagens
        let borderColor = '#34495e'; // Cor da borda do caminho
        let content = null;
        let contentColor = '#ecf0f1'; // Cor padrão do texto/emoji
        let borderWidth = 1;
        
        const isPlayer = player.x === x && player.y === y;
        const isExit = exit.x === x && exit.y === y;

        if (cell === 1) { // Parede
          backgroundColor = '#2c3e50'; // Cor da parede, mais escura
          borderColor = '#34495e';
        } else { // Caminho
            if (isExit) {
                backgroundColor = '#27ae60'; // Cor da saída
                content = '🏆'; // Troféu ou estrela
                contentColor = '#fff';
            } else if (cell === OBSTACULOS.armadilha) {
                backgroundColor = '#e74c3c'; // Vermelho para armadilha
                content = OBSTACULO_TO_EMOJI.armadilha;
                borderColor = '#c0392b';
            } else if (cell === OBSTACULOS.nevoa) {
                backgroundColor = '#3498db'; // Azul para névoa
                content = OBSTACULO_TO_EMOJI.nevoa;
                borderColor = '#2980b9';
            } else if (cell === OBSTACULOS.portao) {
                backgroundColor = '#f39c12'; // Laranja para portão
                content = OBSTACULO_TO_EMOJI.portao;
                borderColor = '#e67e22';
            } else if (cell >= 5 && cell <= 8) { // Habilidades
                const habilidadeName = getHabilidadeNameByValue(cell);
                backgroundColor = todasHabilidades[habilidadeName] ? '#2ecc71' : HABILIDADE_TO_COLOR[cell]; // Verde se coletada
                content = todasHabilidades[habilidadeName] ? '✅' : HABILIDADE_TO_EMOJI[habilidadeName];
                borderColor = '#f1c40f'; // Bordas douradas para habilidades
                borderWidth = 2; // Borda mais grossa para destacar
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
              <Text style={{ fontSize: TILE_SIZE * 0.6, color: contentColor }}>{content}</Text>
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
                 // Centralizar o jogador dentro da célula
                 left: (TILE_SIZE - (TILE_SIZE * 0.7)) / 2,
                 top: (TILE_SIZE - (TILE_SIZE * 0.7)) / 2,
               }}>
                 <Text style={{ fontSize: TILE_SIZE * 0.4, color: '#fff' }}>{personagem?.emoji || '🚶'}</Text>
               </View>
            )}
          </View>
        );
      })
    );
  };
    // ... restante do render NovoLabirinto ...
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
    
    // NOVO: Exibir tela de vitória
    if (gameState === 'win') {
        return renderWinScreen();
    }
    
    // NOVO: Exibir tela de batalha
    if (gameState === 'battle') {
        return (
            <View style={styles.containerLabirinto}>
                {renderBattleScreen()}
            </View>
        );
    }

    // Estado principal do labirinto (maze)
    return (
      <View style={styles.containerLabirinto}>
        <View style={styles.statsBar}>
             <Text style={styles.hpText}>HP: {playerHP}</Text>
             <Text style={styles.hpText}>Monstro: {personagem?.monstro}</Text>
        </View>
        <Text style={styles.gameInfo}>{gameMessage}</Text>
        
        <View style={styles.habilidadesDisplay}>
            <Text style={styles.habilidadesTitulo}>Habilidades Atuais:</Text>
            <View style={styles.habilidadesRow}>
                {Object.keys(todasHabilidades).length > 0 ? (
                    Object.keys(todasHabilidades).map(h => (
                        <View key={h} style={styles.habilidadePill}>
                            <Text style={styles.habilidadePillText}>{h}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: '#ecf0f1' }}>Nenhuma habilidade ainda. Explore!</Text>
                )}
            </View>
        </View>
        
        <View style={[styles.mazeContainer, { width: MAZE_WIDTH * TILE_SIZE, height: MAZE_HEIGHT * TILE_SIZE }]}>
          {renderMaze()}
        </View>

        {gameState === 'maze' && (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.button} onPress={() => movePlayer(0, -1)}>
              <Text style={styles.buttonText}>Cima</Text>
            </TouchableOpacity>
            <View style={styles.row}>
              <TouchableOpacity style={styles.button} onPress={() => movePlayer(-1, 0)}>
                <Text style={styles.buttonText}>Esquerda</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => movePlayer(0, 1)}>
                <Text style={styles.buttonText}>Baixo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => movePlayer(1, 0)}>
                <Text style={styles.buttonText}>Direita</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
}

// O componente principal Missoes (mantido)
export default function Missoes() {
    const [faseAtual, setFaseAtual] = useState(null);
    const [conquistas, setConquistas] = useState({});
    const [habilidades, setHabilidades] = useState({});

    const registrarConquista = (conquista) => {
        setConquistas(prev => ({ ...prev, [conquista]: true }));
        Alert.alert("🎉 CONQUISTA REGISTRADA!", `Você desbloqueou: ${conquista}`);
    };

    const registrarHabilidade = (habilidade) => {
        if (!habilidades[habilidade]) {
            setHabilidades(prev => ({ ...prev, [habilidade]: true }));
            Alert.alert("🌟 HABILIDADE DESBLOQUEADA!", `Você adquiriu: ${habilidade}`);
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
      conteudoFase = <FolhaDaCalma onComplete={resetFase} />;
    } else if (faseAtual === 'floresta') {
      conteudoFase = <FlorestaDaAnsiedade onComplete={resetFase} />;
    }

    const renderConquistasHabilidades = () => (
        <View style={styles.registroContainer}>
            <Text style={styles.registroTitulo}>🏆 Seu Progresso</Text>
            
            <Text style={styles.registroSubTitulo}>Conquistas de Fase:</Text>
            <View style={styles.habilidadesRow}>
                {Object.keys(conquistas).length > 0 ? (
                    Object.keys(conquistas).map(c => (
                        <View key={c} style={styles.habilidadePill}>
                            <Text style={styles.habilidadePillText}>{c}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: '#555' }}>Nenhuma conquista ainda.</Text>
                )}
            </View>

            <Text style={styles.registroSubTitulo}>Habilidades Emocionais:</Text>
            <View style={styles.habilidadesRow}>
                {Object.keys(habilidades).length > 0 ? (
                    Object.keys(habilidades).map(h => (
                        <View key={h} style={styles.habilidadePill}>
                            <Text style={styles.habilidadePillText}>{h}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: '#555' }}>Nenhuma habilidade emocional registrada.</Text>
                )}
            </View>
        </View>
    );

    return (
      <ScrollView contentContainerStyle={styles.containerPrincipal}>
        <Text style={styles.tituloPrincipal}>Missões do Herói das Emoções</Text>
        
        {renderConquistasHabilidades()}
        
        {!faseAtual && (
          <View style={styles.menuFases}>
            <TouchableOpacity style={styles.botaoFase} onPress={() => iniciarFase('labirinto')}>
              <Text style={styles.botaoTexto}>Fase 1: Labirinto da Floresta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoFase} onPress={() => iniciarFase('folha')}>
              <Text style={styles.botaoTexto}>Fase 2: Folha da Calma</Text>
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

// --- FASE 2 e 3 (mantidas) ---
function FolhaDaCalma({ onComplete }) {
  // ... (código da Fase 2 mantido)
  const [fase, setFase] = useState('inspira');
  const [tempo, setTempo] = useState(4);
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [msgPersonalizada, setMsgPersonalizada] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Alert.alert("Explicação da Missão", EXPLICACOES_FASES.folha);
  }, []);

  useEffect(() => {
    if (fase === 'fim') {
      Alert.alert('Conquista!', CONQUISTAS_FASES.folha);
      onComplete();
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.delay(tempo * 1000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start(() => {
      if (fase === 'inspira') {
        setFase('segura');
        setTempo(7);
      } else if (fase === 'segura') {
        setFase('expira');
        setTempo(8);
      } else if (fase === 'expira') {
        setFase('fim');
      }
    });
  }, [fase]);

  const textoFase = {
    inspira: 'Inspire profundamente pelo nariz (4s)',
    segura: 'Segure o ar (7s)',
    expira: 'Expire lentamente pela boca (8s)',
    fim: 'Respiração completa!',
  };

  const containerStyle = temaEscuro ? styles.containerEscuro : styles.container;

  return (
    <View style={containerStyle}>
      <Text style={styles.descricao}>Folha da Calma - Respiração Guiada</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ marginRight: 8 }}>Tema Escuro</Text>
        <Switch value={temaEscuro} onValueChange={setTemaEscuro} />
      </View>
      <Text style={[styles.titulo, { fontSize: 26, marginVertical: 10, opacity: fadeAnim }]}>
        {textoFase[fase]}
      </Text>
      {fase !== 'fim' && (
        <Animated.Text
          style={{
            fontSize: 72,
            color: temaEscuro ? '#90CAF9' : '#3A6EBF',
            fontWeight: 'bold',
            opacity: fadeAnim,
          }}
        >
          {tempo}
        </Animated.Text>
      )}
      <View style={{ marginTop: 20, width: '90%' }}>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>
          Mensagem motivacional personalizada:
        </Text>
        <TextInput
          style={[styles.inputTexto, temaEscuro && styles.inputTextoEscuro]}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={temaEscuro ? '#bbb' : '#666'}
          value={msgPersonalizada}
          onChangeText={setMsgPersonalizada}
        />
        {msgPersonalizada !== '' && (
          <Text style={[styles.mensagemMotivacional, temaEscuro && { color: '#BBDEFB' }]}>
            💬 {msgPersonalizada}
          </Text>
        )}
      </View>
    </View>
  );
}

function FlorestaDaAnsiedade({ onComplete }) {
  // ... (código da Fase 3 mantido)
  const frases = [
    'Você é mais forte do que pensa.',
    'Respire fundo, está tudo bem.',
    'Essa emoção vai passar.',
    'Você está no controle agora.',
    'Continue firme na sua jornada!',
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
          {cenarios[posicao].map((item, i) => (
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
        <Text style={styles.botaoTexto}>Próxima Mensagem</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  // ... (estilos principais mantidos)
  containerPrincipal: {
    flexGrow: 1,
    padding: 12,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tituloPrincipal: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 18,
    color: '#00796B',
  },
  menuFases: {
    width: '100%',
    marginBottom: 12,
  },
  botaoFase: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 16,
    marginVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  botaoVoltar: {
    backgroundColor: '#FF7043',
    paddingVertical: 14,
    marginVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  container: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  containerEscuro: {
    backgroundColor: '#263238',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  descricao: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#073642',
  },
  // Estilos da Fase 1 (Novo Labirinto)
  containerLabirinto: {
    alignItems: 'center',
    backgroundColor: '#1a202c', // Fundo escuro para o labirinto
    width: '100%',
    padding: 10, // Padding para a borda do labirinto
    borderRadius: 8,
  },
  gameInfo: {
    color: '#ecf0f1', // Texto claro
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  mazeContainer: {
    position: 'relative', 
    overflow: 'hidden', 
    backgroundColor: '#34495e', 
    borderRadius: 5,
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#5d8aa8', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  // Estilos para a tela de escolha de personagem (mantidos)
  escolhaContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E0F7FA', 
    borderRadius: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#00796B',
  },
  personagemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  personagemBtn: {
    borderRadius: 12,
    padding: 15,
    margin: 8,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emoji: {
    fontSize: 48,
  },
  nomePersonagem: {
    marginTop: 8,
    fontWeight: '700',
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
  },
  monstroText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  habilidadeInicialText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 6,
  },
  subTitulo: {
    fontSize: 18,
    marginBottom: 15,
    color: '#00796B',
    textAlign: 'center',
  },
  // Estilos do Display de Habilidades (no labirinto)
  habilidadesDisplay: {
    width: '100%',
    padding: 10,
    backgroundColor: '#34495e', // Fundo escuro para combinar com o labirinto
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#7f8c8d',
  },
  habilidadesTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ecf0f1', // Texto claro
    marginBottom: 5,
  },
  habilidadesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  habilidadePill: {
    backgroundColor: '#2ecc71', // Verde de sucesso
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  habilidadePillText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  registroContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#4DB6AC',
  },
  registroTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00796B',
  },
  registroSubTitulo: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#073642',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: '#34495e',
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  hpText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 18,
  },
  // --- Estilos de Batalha (Novos) ---
  battleContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  battleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 10,
  },
  battleHP: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 15,
  },
  battleMessage: {
    fontSize: 16,
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 25,
  },
  battleHabilidadeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1c40f',
    marginBottom: 10,
  },
  habilidadeBtn: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    margin: 5,
  },
  habilidadeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  monstroDica: {
    marginTop: 20,
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // --- Estilos de Vitória (Novos) ---
  winContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F5E9', // Fundo de sucesso (verde claro)
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#2ecc71',
    marginTop: 20,
  },
  winTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 15,
    textAlign: 'center',
  },
  winMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#95A5A6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  finalizarBtn: {
    backgroundColor: '#00796B',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  finalizarBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // ... (estilos da Fase 2 e 3 mantidos)
  inputTexto: {
    borderWidth: 1,
    borderColor: '#0288D1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    color: '#073642',
    backgroundColor: '#E1F5FE',
  },
  inputTextoEscuro: {
    backgroundColor: '#455A64',
    borderColor: '#90CAF9',
    color: '#BBDEFB',
  },
  mensagemMotivacional: {
    marginTop: 8,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#0D47A1',
  },
  florestaContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
  },
  cenarioLinhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  personagemContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cenario: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  cenarioEmoji: {
    fontSize: 32,
    marginHorizontal: 6,
  },
  fraseFloresta: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#33691E',
    marginBottom: 18,
    textAlign: 'center',
  },
  botaoFloresta: {
    backgroundColor: '#558B2F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});