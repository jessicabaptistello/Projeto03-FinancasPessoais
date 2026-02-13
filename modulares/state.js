

import { loadTransactions, saveTransactions } from "./storage.js";

let transactions = loadTransactions();

export function getTransactions() {
  return [...transactions]; 
}

function makeId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function persist() {
  saveTransactions(transactions);
}

export function addTransaction({ descricao, valor, tipo, data, categoria }) {
  const transaction = {
    id: makeId(),
    descricao,
    valor,
    tipo,
    data,
    categoria,
  };

  transactions = [transaction, ...transactions];
  persist();
}

export function removeTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  persist();
}

export function clearAllTransactions() {
  transactions = [];
  persist();
}

export function getTotals() {
  let balance = 0;
  let income = 0;
  let expense = 0;
  let savings = 0;

  for (const t of transactions) {
    if (t.tipo === "receita") {
      income += t.valor;
      balance += t.valor;
    } else if (t.tipo === "despesa") {
      expense += t.valor;
      balance -= t.valor;
    } else if (t.tipo === "poupanca") {
      savings += t.valor;
    }
  }

  return { balance, income, expense, savings };
}

export function exportTransactionsJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    total: transactions.length,
    transactions,
  };
  return JSON.stringify(data, null, 2);
}

export function exportTransactionsCSV() {
  const header = ["id", "descricao", "valor", "tipo", "categoria", "data"];

  function escapeCSV(value) {
    const s = String(value ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  }

  const lines = [header.join(",")];

  for (const t of transactions) {
    const row = [t.id, t.descricao, t.valor, t.tipo, t.categoria, t.data]
      .map(escapeCSV)
      .join(",");
    lines.push(row);
  }

  return lines.join("\n");
}

