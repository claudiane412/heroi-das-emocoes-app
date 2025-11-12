import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function RespiracaoScreen() {
  const [passo, setPasso] = useState("Pronto para começar?");

  function iniciarRespiracao() {
    setPasso("Inspire...");
    setTimeout(() => setPasso("Segure..."), 4000);
    setTimeout(() => setPasso("Expire..."), 8000);
    setTimeout(() => setPasso("Repita ou pressione novamente"), 12000);
  }

  return (
    <View>
      <Text>{passo}</Text>
      <Button title="Iniciar Respiração" onPress={iniciarRespiracao} />
    </View>
  );
}
