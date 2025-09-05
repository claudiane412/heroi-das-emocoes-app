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
} from 'react-native';

// Constantes
const GRID_SIZE = 7;
const CELL_SIZE = 50;

// Personagens com frases e posição inicial
const personagens = [
  { 
    nome: 'Sábio', 
    emoji: '🧙‍♀️',
    frases: [
      'A sabedoria vem com paciência e calma.',
      'Cada passo revela um novo aprendizado.',
      'Confie no seu conhecimento interior.',
      'A mente serena é a maior força do sábio.',
      'Sábio é quem controla sua própria ansiedade.'
    ],
    startPos: { x: 6, y: 6 },
  },
  { 
    nome: 'Aventureiro', 
    emoji: '🦸‍♂️',
    frases: [
      'Coragem é avançar mesmo com desafios.',
      'Um herói nunca desiste, só descansa.',
      'A aventura é mais doce com serenidade.',
      'Desbrave seus medos com o coração tranquilo.',
      'O maior tesouro é a paz interior.'
    ],
    startPos: { x: 0, y: 6 },
  },
  { 
    nome: 'Elfo', 
    emoji: '🧝‍♂️',
    frases: [
      'A natureza ensina: flua com o tempo.',
      'Silencie a mente para ouvir seu coração.',
      'Cada folha caída traz uma nova esperança.',
      'A calma é o caminho para a magia interior.',
      'Elfos são mestres em harmonia e paz.'
    ],
    startPos: { x: 0, y: 1 },
  },
  { 
    nome: 'Explorador', 
    emoji: '😎',
    frases: [
      'Explore seu mundo interior com leveza.',
      'Descobertas nascem da paciência.',
      'A tranquilidade guia o melhor explorador.',
      'Cada passo é uma nova história.',
      'Aventurar-se é aprender a respirar fundo.'
    ],
    startPos: { x: 6, y: 0 },
  },
];

// Obstáculos no labirinto
const OBSTACULOS = [
  {x:1,y:0}, {x:3,y:0}, {x:5,y:0}, {x:7,y:0}, {x:8,y:0},
  {x:0,y:1}, {x:2,y:1}, {x:4,y:1}, {x:6,y:1}, {x:9,y:1},
  {x:1,y:2}, {x:3,y:2}, {x:5,y:2}, {x:7,y:2},
  {x:0,y:3}, {x:2,y:3}, {x:4,y:3}, {x:6,y:3}, {x:8,y:3},
  {x:1,y:4}, {x:3,y:4}, {x:5,y:4}, {x:7,y:4}, {x:9,y:4},
  {x:0,y:5}, {x:2,y:5}, {x:4,y:5}, {x:6,y:5}, {x:8,y:5},
  {x:1,y:6}, {x:3,y:6}, {x:5,y:6}, {x:7,y:6},
  {x:0,y:7}, {x:2,y:7}, {x:4,y:7}, {x:6,y:7}, {x:9,y:7},
  {x:1,y:8}, {x:3,y:8}, {x:5,y:8}, {x:7,y:8}, {x:8,y:8},
  {x:0,y:9}, {x:2,y:9}, {x:4,y:9}, {x:6,y:9}, {x:8,y:9},
];


// Recompensas no labirinto
const RECOMPENSAS = [
    { x: 2, y: 2, tipo: 'Calma' },
  { x: 7, y: 3, tipo: 'Foco' },
  { x: 4, y: 6, tipo: 'Respiração' },
  { x: 8, y: 8, tipo: 'Paciência' },
];
// Funções auxiliares
function ehObstaculo(x, y) {
  return OBSTACULOS.some(obs => obs.x === x && obs.y === y);
}

function ehRecompensa(x, y) {
  return RECOMPENSAS.find(r => r.x === x && r.y === y);
}

//const CONQUISTAS_FASES = {
//  labirinto: "Dominei o Labirinto da Calma!",



// Explicações emocionais por fase
const EXPLICACOES_FASES = {
  labirinto: `Fase 1 - Labirinto da Floresta:
Representa a ansiedade e o medo.
Você deve usar paciência, foco e calma para avançar pelo labirinto,
coletando habilidades para controlar sua ansiedade.`,
  folha: `Fase 2 - Folha da Calma:
Aqui você pratica a respiração guiada para regular suas emoções,
aprendendo a focar no momento presente e acalmar a mente.`,
  floresta: `Fase 3 - Floresta da Ansiedade:
Caminhe pela floresta enquanto recebe mensagens motivacionais
para enfrentar a ansiedade e fortalecer sua resiliência.`,
};

// Conquistas emocionais
const CONQUISTAS_FASES = {
  labirinto: "Dominei o Labirinto da Calma!",
  folha: "Respirei Fundo e Encontrei a Paz!",
  floresta: "Venci a Floresta da Ansiedade!",
};

// --- Fase 1: Labirinto da Floresta ---

function Labirinto({ onComplete }) {
  const [personagem, setPersonagem] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [fraseAtual, setFraseAtual] = useState('');
  const [recompensasColetadas, setRecompensasColetadas] = useState([]);
  const [faseIniciada, setFaseIniciada] = useState(false);

  const goal = { x: 3, y: 6 };

  useEffect(() => {
    if (personagem) {
      setPos(personagem.startPos);
      setFraseAtual(fraseAleatoria(personagem));
      setRecompensasColetadas([]);
      // Explicação da fase
      Alert.alert("Explicação da Missão", EXPLICACOES_FASES.labirinto);
      setFaseIniciada(true);
    }
  }, [personagem]);

  function fraseAleatoria(p) {
    if (!p) return '';
    const frases = p.frases;
    const index = Math.floor(Math.random() * frases.length);
    return frases[index];
  }

  function mover(dx, dy) {
    const nx = pos.x + dx;
    const ny = pos.y + dy;

    if (
      nx >= 0 && nx < GRID_SIZE &&
      ny >= 0 && ny < GRID_SIZE &&
      !ehObstaculo(nx, ny)
    ) {
      setPos({ x: nx, y: ny });
      setFraseAtual(fraseAleatoria(personagem));

      // Checa recompensa
      const recompensa = ehRecompensa(nx, ny);
      if (recompensa && !recompensasColetadas.some(r => r.x === nx && r.y === ny)) {
        Alert.alert('Você encontrou uma recompensa!', `Habilidade: ${recompensa.tipo}`);
        setRecompensasColetadas(prev => [...prev, recompensa]);
        // Aqui você pode adicionar integração com backend para salvar progresso
      }

      // Checa se chegou ao objetivo
      if (nx === goal.x && ny === goal.y) {
        Alert.alert('Parabéns!', `${CONQUISTAS_FASES.labirinto}`);
        onComplete();
      }
    }
  }

  if (!personagem) {
    return (
      <View style={styles.escolhaContainer}>
        <Text style={styles.titulo}>Escolha seu Herói</Text>
        <View style={styles.personagemGrid}>
          {personagens.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={styles.personagemBtn}
              onPress={() => setPersonagem(p)}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{p.emoji}</Text>
              <Text style={styles.nomePersonagem}>{p.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  const rows = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const cells = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      let bgColor = '#A0C4FF'; // caminho livre
      let borderColor = '#6699CC';
      let cellContent = null;

      if (x === pos.x && y === pos.y) {
        bgColor = '#FFBE0B'; // personagem
        borderColor = '#FFA500';
        cellContent = <Text style={styles.personagemEmoji}>{personagem.emoji}</Text>;
      } else if (x === goal.x && y === goal.y) {
        bgColor = '#8AC926'; // saída
        borderColor = '#6B8E23';
      } else if (ehObstaculo(x, y)) {
        bgColor = '#FF595E'; // obstáculos
        borderColor = '#D7263D';
      } else {
        const recompensa = ehRecompensa(x, y);
        if (recompensa && !recompensasColetadas.some(r => r.x === x && r.y === y)) {
          bgColor = '#FFD166'; // recompensa
          borderColor = '#F4A261';
          cellContent = <Text style={{ fontSize: 22 }}>✨</Text>;
        }
      }

      cells.push(
        <View key={`${x}-${y}`} style={[styles.celula, { backgroundColor: bgColor, borderColor }]}>
          {cellContent}
        </View>
      );
    }
    rows.push(
      <View key={y} style={styles.linha}>
        {cells}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.descricao}>
        Leve {personagem.nome} até a saída verde, evitando obstáculos vermelhos.
      </Text>
      <Text style={styles.descricao}>
        Colete as habilidades ✨ espalhadas pelo caminho para desbloquear poderes.
      </Text>
      <View style={styles.grade}>{rows}</View>

      {fraseAtual !== '' && (
        <View style={styles.fraseContainer}>
          <Text style={styles.fraseTexto}>{fraseAtual}</Text>
        </View>
      )}

      <View style={styles.botoesContainer}>
        <TouchableOpacity style={styles.botao} onPress={() => mover(0, -1)}>
          <Text style={styles.botaoTexto}>⬆️</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity style={styles.botao} onPress={() => mover(-1, 0)}>
            <Text style={styles.botaoTexto}>⬅️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao} onPress={() => mover(1, 0)}>
            <Text style={styles.botaoTexto}>➡️</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.botao, { marginTop: 12 }]} onPress={() => mover(0, 1)}>
          <Text style={styles.botaoTexto}>⬇️</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: '600', color: '#264653' }}>
          Habilidades coletadas: {recompensasColetadas.map(r => r.tipo).join(', ') || 'Nenhuma'}
        </Text>
      </View>
    </View>
  );
}

// --- Fase 2: Folha da Calma (respiração guiada) ---

function FolhaDaCalma({ onComplete }) {
  const [fase, setFase] = useState('inspira');
  const [tempo, setTempo] = useState(4);
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [msgPersonalizada, setMsgPersonalizada] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Alerta explicativo só ao iniciar a fase
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

// --- Fase 3: Floresta da Ansiedade ---

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
    conteudoFase = <Labirinto onComplete={resetFase} />;
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
          <TouchableOpacity
            style={styles.botaoFase}
            onPress={() => iniciarFase('labirinto')}
          >
            <Text style={styles.botaoTexto}>Fase 1: Labirinto da Floresta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoFase}
            onPress={() => iniciarFase('folha')}
          >
            <Text style={styles.botaoTexto}>Fase 2: Folha da Calma</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoFase}
            onPress={() => iniciarFase('floresta')}
          >
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

  escolhaContainer: {
    width: '100%',
    alignItems: 'center',
  },

  personagemGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    width: '100%',
  },

  personagemBtn: {
    backgroundColor: '#90CAF9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    margin: 8,
    width: 120,
    alignItems: 'center',
  },

  emoji: {
    fontSize: 48,
  },

  nomePersonagem: {
    marginTop: 8,
    fontWeight: '700',
    fontSize: 18,
    color: '#073642',
  },

  grade: {
    borderWidth: 2,
    borderColor: '#6699CC',
    marginBottom: 12,
  },

  linha: {
    flexDirection: 'row',
  },

  celula: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  personagemEmoji: {
    fontSize: 30,
  },

  fraseContainer: {
    backgroundColor: '#B2DFDB',
    padding: 10,
    borderRadius: 12,
    marginVertical: 12,
    maxWidth: '90%',
  },

  fraseTexto: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#004D40',
  },

  botoesContainer: {
    marginTop: 10,
    alignItems: 'center',
  },

  botao: {
    backgroundColor: '#0288D1',
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    width: 50,
    alignItems: 'center',
  },

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

  // Floresta
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
