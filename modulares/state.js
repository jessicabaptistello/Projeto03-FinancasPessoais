import { loadTransactions, saveTransactions } from "./storage.js";

let transactions = loadTransactions();

export function getTransactions() {
  return transactions;
}

function makeId() {
  return String(Date.now()) + "-" + String(Math.floor(Math.random() * 100000));
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
  saveTransactions(transactions);
}

export function removeTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions(transactions);
}

export function clearAllTransactions() {
  transactions = [];
  saveTransactions(transactions);
}


export function getTotals() {
  const balance = transactions.reduce((acc, t) => {
    if (t.tipo === "receita") return acc + t.valor;
    if (t.tipo === "despesa") return acc - t.valor;
    return acc;
  }, 0);

  const income = transactions
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);

  const expense = transactions
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);

  const savings = transactions
    .filter((t) => t.tipo === "poupanca")
    .reduce((acc, t) => acc + t.valor, 0);

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

  const escapeCSV = (v) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  };

  const lines = [
    header.join(","),
    ...transactions.map((t) =>
      [t.id, t.descricao, t.valor, t.tipo, t.categoria, t.data]
        .map(escapeCSV)
        .join(",")
    ),
  ];

  return lines.join("\n");
}
