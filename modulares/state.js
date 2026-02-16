import { loadTransactions, saveTransactions } from "./storage.js";

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


export function updateTransaction(id, updatedFields) {
  transactions = transactions.map((t) => {
    if (t.id !== id) return t;
    return { ...t, ...updatedFields };
  });
  persist();
}

export function getTotals() {
  const totals = transactions.reduce(
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

  return totals;
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
