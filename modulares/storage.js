/*
  storage.js
  OBJETIVO: guardar e recuperar transações no localStorage.
  NOTA: localStorage guarda apenas strings → usamos JSON.
*/

const KEY = "transactions_v1";

export function loadTransactions() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    const data = JSON.parse(raw);
    // Garantia extra: só aceitamos array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // Se o JSON estiver inválido/corrompido, não quebra a app
    return [];
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(KEY, JSON.stringify(transactions));
}
