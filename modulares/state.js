import { loadTransactions, saveTransactions } from "./storage.js";
import { RULES } from "./rules.js";

let transactions = loadTransactions();

export function getTransactions() {
  return [...transactions];
}

function persist() {
  saveTransactions(transactions);
}

function makeId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function normalizeNumberTo2Decimals(value) {
  const n = Number(value);
  if (!n || Number.isNaN(n)) return 0;
  return Number(n.toFixed(2));
}

function sanitizeTransaction(t) {
  const descricao = String(t.descricao ?? "").trim().slice(0, RULES.DESCRICAO_MAX);

  let valor = normalizeNumberTo2Decimals(t.valor);

  if (valor < 0) valor = 0;
  if (valor > RULES.VALOR_MAX) valor = RULES.VALOR_MAX;

  return {
    id: t.id ?? makeId(),
    descricao,
    valor,
    tipo: t.tipo ?? "receita",
    categoria: String(t.categoria ?? "Outros").trim(),
    data: String(t.data ?? "").trim(),
  };
}

export function addTransaction({ descricao, valor, tipo, data, categoria }) {
  const transaction = sanitizeTransaction({
    id: makeId(),
    descricao,
    valor,
    tipo,
    data,
    categoria,
  });

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

export function updateTransaction(id, updatedFields) {
  transactions = transactions.map((t) => {
    if (t.id !== id) return t;
    return sanitizeTransaction({ ...t, ...updatedFields });
  });
  persist();
}

export function getTotals() {
  return transactions.reduce(
    (acc, t) => {
      if (t.tipo === "receita") {
        acc.income += t.valor;
        acc.balance += t.valor;
      } else if (t.tipo === "despesa") {
        acc.expense += t.valor;
        acc.balance -= t.valor;
      } else if (t.tipo === "poupanca") {
        acc.savings += t.valor;
      }
      return acc;
    },
    { balance: 0, income: 0, expense: 0, savings: 0 }
  );
}

export function exportTransactionsJSON() {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      total: transactions.length,
      transactions,
    },
    null,
    2
  );
}

export function exportTransactionsCSV() {
  const header = ["id", "descricao", "valor", "tipo", "categoria", "data"];

  function escapeCSV(v) {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  }

  const lines = [header.join(",")];

  for (const t of transactions) {
    lines.push([t.id, t.descricao, t.valor, t.tipo, t.categoria, t.data].map(escapeCSV).join(","));
  }

  return lines.join("\n");
}
