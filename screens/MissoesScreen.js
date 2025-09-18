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
import Svg, { Rect, Circle } from 'react-native-svg';

// --- Constantes e explicações das fases (mantidas do seu código) ---
const CONQUISTAS_FASES = {
  labirinto: "Dominei o Labirinto da Calma!",
  folha: "Respirei Fundo e Encontrei a Paz!",
  floresta: "Venci a Floresta da Ansiedade!",
};

const EXPLICACOES_FASES = {
  labirinto: `Fase 1 - Labirinto da Floresta:
Representa a ansiedade e o medo.
Use paciência e foco para avançar pelo labirinto,
encontrando a saída e enfrentando o desafio final!`,
  folha: `Fase 2 - Folha da Calma:
Aqui você pratica a respiração guiada para regular suas emoções,
aprendendo a focar no momento presente e acalmar a mente.`,
  floresta: `Fase 3 - Floresta da Ansiedade:
Caminhe pela floresta enquanto recebe mensagens motivacionais
para enfrentar a ansiedade e fortalecer sua resiliência.`,
};

// Dados dos personagens para a Fase 1
const personagens = [
  { nome: 'Alegria', emoji: '😊', cor: '#FFD700', monstro: 'Tristeza' },
  { nome: 'Coragem', emoji: '💪', cor: '#E76F51', monstro: 'Medo' },
  { nome: 'Paz', emoji: '🕊️', cor: '#2A9D8F', monstro: 'Preocupação' },
  { nome: 'Calma', emoji: '😌', cor: '#F4A261', monstro: 'Raiva' },
];

// --- NOVO CÓDIGO DO LABIRINTO (substitui a sua Fase 1) ---
const { width } = Dimensions.get('window');

// Configurações do Labirinto
const MAZE_WIDTH = 15;
const MAZE_HEIGHT = 15;
const TILE_SIZE = Math.floor((width - 40) / MAZE_WIDTH);

const exit = { x: MAZE_WIDTH - 1, y: MAZE_HEIGHT - 1 };

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

// Obstáculos e Habilidades
const OBSTACULOS = {
  armadilha: 2, // Representa uma armadilha
  nevoa: 3, // Representa névoa
  portao: 4, // Representa o portão da procrastinação
};

const HABILIDADES = {
  persistencia: 5, // Habilidade de persistência
};

function NovoLabirinto({ onComplete }) {
  const [maze, setMaze] = useState([]);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [personagem, setPersonagem] = useState(null);
  const [gameState, setGameState] = useState('escolhaPersonagem');
  const [gameMessage, setGameMessage] = useState('');
  const [hitsToDefeatMonster, setHitsToDefeatMonster] = useState(3);
  const [habilidades, setHabilidades] = useState({});
  const [obstaculosVencidos, setObstaculosVencidos] = useState([]);

  useEffect(() => {
    if (gameState === 'maze') {
      Alert.alert("Explicação da Missão", EXPLICACOES_FASES.labirinto);
      setGameMessage(`Você é ${personagem.nome}. Encontre a saída para enfrentar o monstro da ${personagem.monstro}.`);
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

    // Adicionar obstáculos
    const armadilhaPos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
    newMaze[armadilhaPos.y][armadilhaPos.x] = OBSTACULOS.armadilha;

    const nevoaPos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
    newMaze[nevoaPos.y][nevoaPos.x] = OBSTACULOS.nevoa;

    const portaoPos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
    newMaze[portaoPos.y][portaoPos.x] = OBSTACULOS.portao;

    // Adicionar habilidade
    const habilidadePos = freeCells.splice(Math.floor(Math.random() * freeCells.length), 1)[0];
    newMaze[habilidadePos.y][habilidadePos.x] = HABILIDADES.persistencia;

    setMaze(newMaze);
  };

  const chooseCharacter = (p) => {
    setPersonagem(p);
    setGameState('maze');
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

      if (cellValue === OBSTACULOS.armadilha) {
        setGameMessage('Ops! Você pisou em uma Armadilha de Medo. Fique firme e tente se mover novamente!');
        // Não move, o jogador precisa tentar de novo
        if (!obstaculosVencidos.includes('Armadilha de Medo')) {
          setObstaculosVencidos([...obstaculosVencidos, 'Armadilha de Medo']);
        }
        return;
      }

      if (cellValue === OBSTACULOS.nevoa) {
        setGameMessage('Uma Névoa de Dúvida te impede de enxergar. Fique parado, a névoa vai se dissipar no próximo turno!');
        // Não move por um turno
        if (!obstaculosVencidos.includes('Névoa de Dúvida')) {
          setObstaculosVencidos([...obstaculosVencidos, 'Névoa de Dúvida']);
        }
        return;
      }
      
      if (cellValue === OBSTACULOS.portao) {
        if (habilidades.persistencia) {
          setGameMessage('Você usou sua habilidade de Persistência e atravessou o Portão da Procrastinação!');
          if (!obstaculosVencidos.includes('Portão da Procrastinação')) {
            setObstaculosVencidos([...obstaculosVencidos, 'Portão da Procrastinação']);
          }
        } else {
          setGameMessage('O Portão da Procrastinação está bloqueado! Encontre a habilidade de Persistência para abri-lo.');
          return;
        }
      }

      if (cellValue === HABILIDADES.persistencia) {
        setHabilidades({ ...habilidades, persistencia: true });
        Alert.alert('Habilidade Desbloqueada!', 'Você encontrou a Habilidade da Persistência! Agora você pode atravessar o Portão da Procrastinação.');
        setGameMessage('Você se sente mais persistente. Continue explorando o labirinto!');
      }

      setPlayer({ x: newX, y: newY });
      checkWin(newX, newY);
    }
  };

  const checkWin = (x, y) => {
    if (x === exit.x && y === exit.y) {
      setGameState('battle');
      setGameMessage(`Você encontrou a saída! Agora enfrente o monstro da ${personagem.monstro}.`);
    }
  };

  const attackMonster = () => {
    if (gameState !== 'battle') return;

    const newHits = hitsToDefeatMonster - 1;
    setHitsToDefeatMonster(newHits);

    if (newHits > 0) {
      setGameMessage(`Você atacou! Faltam ${newHits} acertos para derrotar o monstro da ${personagem.monstro}.`);
    } else {
      setGameState('win');
      const obstaculosStr = obstaculosVencidos.length > 0
        ? `Você superou os seguintes obstáculos: ${obstaculosVencidos.join(', ')}.`
        : 'Você não encontrou nenhum obstáculo no caminho.';
      setGameMessage(`Vitória! Você, a ${personagem.nome}, derrotou o monstro da ${personagem.monstro} e escapou do labirinto! ${obstaculosStr}`);
      Alert.alert('Conquista!', CONQUISTAS_FASES.labirinto);
      onComplete();
    }
  };

  const renderMaze = () => {
    return maze.map((row, y) =>
      row.map((cell, x) => {
        let fillColor = '#2c2c54'; // Cor padrão do caminho
        if (cell === 1) {
          fillColor = '#553c9a'; // Parede
        } else if (cell === OBSTACULOS.armadilha) {
          fillColor = '#FF6347'; // Armadilha
        } else if (cell === OBSTACULOS.nevoa) {
          fillColor = '#B0C4DE'; // Névoa
        } else if (cell === OBSTACULOS.portao) {
          fillColor = '#FF8C00'; // Portão
        } else if (cell === HABILIDADES.persistencia) {
          fillColor = '#00CED1'; // Habilidade
        }
        return (
          <Rect
            key={`${x}-${y}`}
            x={x * TILE_SIZE}
            y={y * TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill={fillColor}
          />
        );
      })
    );
  };

  if (gameState === 'escolhaPersonagem') {
    return (
      <View style={styles.escolhaContainer}>
        <Text style={styles.titulo}>Escolha seu Herói</Text>
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
              <Text style={styles.monstroText}>Vs. {p.monstro}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.containerLabirinto}>
      <Text style={styles.gameInfo}>{gameMessage}</Text>
      <View style={styles.mazeContainer}>
        <Svg width={MAZE_WIDTH * TILE_SIZE} height={MAZE_HEIGHT * TILE_SIZE}>
          {renderMaze()}
          <Circle
            cx={exit.x * TILE_SIZE + TILE_SIZE / 2}
            cy={exit.y * TILE_SIZE + TILE_SIZE / 2}
            r={TILE_SIZE / 2.5}
            fill="#00a86b"
          />
          <Circle
            cx={player.x * TILE_SIZE + TILE_SIZE / 2}
            cy={player.y * TILE_SIZE + TILE_SIZE / 2}
            r={TILE_SIZE / 2.5}
            fill={personagem?.cor || '#f7d716'}
          />
        </Svg>
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

      {gameState === 'battle' && (
        <TouchableOpacity style={styles.battleButton} onPress={attackMonster}>
          <Text style={styles.buttonText}>Atacar Monstro da {personagem.monstro}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- FASE 2 e 3 (mantidas do seu código) ---

function FolhaDaCalma({ onComplete }) {
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

// --- Componente principal de Missões ---

export default function Missoes() {
  const [faseAtual, setFaseAtual] = useState(null);

  const iniciarFase = (fase) => {
    setFaseAtual(fase);
  };

  const resetFase = () => {
    setFaseAtual(null);
  };

  let conteudoFase = null;
  if (faseAtual === 'labirinto') {
    conteudoFase = <NovoLabirinto onComplete={resetFase} />;
  } else if (faseAtual === 'folha') {
    conteudoFase = <FolhaDaCalma onComplete={resetFase} />;
  } else if (faseAtual === 'floresta') {
    conteudoFase = <FlorestaDaAnsiedade onComplete={resetFase} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.containerPrincipal}>
      <Text style={styles.tituloPrincipal}>Missões do Herói das Emoções</Text>
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

const styles = StyleSheet.create({
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
    backgroundColor: '#E0F7FA',
    width: '100%',
  },
  gameInfo: {
    color: '#073642',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  mazeContainer: {
    borderWidth: 2,
    borderColor: '#553c9a',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
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
    backgroundColor: '#a45a8b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  battleButton: {
    backgroundColor: '#a45a8b',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  // Estilos para a tela de escolha de personagem
  escolhaContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#073642',
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
  // Fim dos Estilos da Fase 1
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