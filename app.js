import {
  elements,
  initUI,
  renderTotals,
  renderList,
  setupCategoryButtons,
} from "./modulares/userInterface.js";

import {
  getTransactions,
  clearAllTransactions,
  exportTransactionsJSON,
  exportTransactionsCSV,
} from "./modulares/state.js";

import { submitTransaction } from "./modulares/transactions.js";


function setupCalendarTop() {
  const calendarioEl = document.querySelector(".calendario");
  if (!calendarioEl) return;

  calendarioEl.textContent = `Hoje: ${new Date().toLocaleDateString("pt-PT")}`;
}

function setupLimitValueInput() {
  if (!elements.quantidade) return;

 
  elements.quantidade.addEventListener("keydown", (e) => {
    const blocked = ["e", "E", "+", "-"];
    if (blocked.includes(e.key)) e.preventDefault();
  });

 
  elements.quantidade.addEventListener("input", () => {
    let digits = elements.quantidade.value.replace(/\D/g, "");
    if (digits.length > 7) digits = digits.slice(0, 7);
    elements.quantidade.value = digits;
  });
}


function applyFilters(transactions) {
  const input = document.querySelector(".filtro-texto");
  const select = document.querySelector(".filtro-tipo");

  const texto = (input?.value || "").toLowerCase().trim();
  const tipo = select?.value || "todos";

  return transactions.filter((t) => {
    const desc = (t.descricao || "").toLowerCase();
    const matchTexto = texto === "" || desc.includes(texto);
    const matchTipo = tipo === "todos" || t.tipo === tipo;
    return matchTexto && matchTipo;
  });
}


function refresh() {
  const all = getTransactions();
  const filtered = applyFilters(all);

  renderTotals();
  renderList(filtered, refresh);
}


function downloadFile({ filename, content, mimeType }) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}


function setupButtons() {
  
  elements.buttonAdicionar.addEventListener("click", (e) => {
    e.preventDefault();
    submitTransaction(refresh);
  });

 
  elements.buttonLimpar.addEventListener("click", () => {
    const ok = confirm("Tem certeza que deseja excluir todas as transações?");
    if (!ok) return;

    clearAllTransactions();
    refresh();
  });

 
  const exportBtn = document.querySelector(".exportar");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const transactions = getTransactions();
      if (transactions.length === 0) {
        alert("Não há transações para exportar.");
        return;
      }

      const stamp = new Date()
        .toISOString()
        .replaceAll(":", "-")
        .replaceAll(".", "-");

      downloadFile({
        filename: `minhas-financas-${stamp}.json`,
        content: exportTransactionsJSON(),
        mimeType: "application/json;charset=utf-8",
      });

      downloadFile({
        filename: `minhas-financas-${stamp}.csv`,
        content: exportTransactionsCSV(),
        mimeType: "text/csv;charset=utf-8",
      });
    });
  }

 
  const input = document.querySelector(".filtro-texto");
  const select = document.querySelector(".filtro-tipo");
  if (input) input.addEventListener("input", refresh);
  if (select) select.addEventListener("change", refresh);
}


document.addEventListener("DOMContentLoaded", () => {
  const ok = initUI();
  if (!ok) return;

  setupCalendarTop();
  setupCategoryButtons();
  setupLimitValueInput(); 
  setupButtons();

  refresh();
});
