const API_BASE = 'http://:10.0.2.2:3000/api'; // altere para seu IP real se testar no celular

export async function login(email, senha) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  return res.json();
}

export async function cadastrar(nome, email, senha) {
  const res = await fetch(`${API_BASE}/cadastrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha }),
  });
  return res.json();
}

export async function buscarRegistros(usuarioId) {
  const res = await fetch(`${API_BASE}/diario/${usuarioId}`);
  return res.json();
}

export async function salvarRegistro(registro) {
  const res = await fetch(`${API_BASE}/diario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registro),
  });
  return res.json();
}
