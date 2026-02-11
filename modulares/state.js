/*
OBJETIVO:
Centralizar o controle das transações em memória.

PENSAMENTO:

1) Carregar as transações salvas quando o sistema iniciar.
2) Criar função para:
   - Retornar lista atual.
   - Adicionar nova transação.
   - (Opcional) remover transação.
3) Sempre que alterar o estado:
   - Atualizar o localStorage.

REFLEXÃO:
- Por que não manipular o localStorage diretamente no UI?
- O que significa separar responsabilidade?

DESAFIO:
Como garantir que o array nunca fique fora de sincronia?
*/


import { loadTransactions, saveTransactions } from "./storage.js";

let transactions = loadTransactions();

export function getTransactions() {
  return transactions;
}

export function addTransaction({ descricao, valor, tipo, data, categoria }) {
  const transaction = {
    id: crypto.randomUUID(),
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
    const signed = t.tipo === "despesa" ? -t.valor : t.valor;
    return acc + signed;
  }, 0);

  const income = transactions
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);

  const expense = transactions
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);

  return { balance, income, expense };
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
