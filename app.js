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
  const input = elements.quantidade;
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    const blocked = ["e", "E", "+", "-"];
    if (blocked.includes(e.key)) e.preventDefault();
  });

  input.addEventListener("input", () => {
    input.value = cleanMoneyText(input.value);
  });
}

function cleanMoneyText(text) {
  let s = String(text ?? "");

  s = s.replace(/[^\d.,]/g, "");

  const firstComma = s.indexOf(",");
  const firstDot = s.indexOf(".");

  let sepIndex = -1;
  let sepChar = "";

  if (firstComma !== -1 && firstDot !== -1) {

    if (firstComma < firstDot) {
      sepIndex = firstComma;
      sepChar = ",";
    } else {
      sepIndex = firstDot;
      sepChar = ".";
    }
  } else if (firstComma !== -1) {
    sepIndex = firstComma;
    sepChar = ",";
  } else if (firstDot !== -1) {
    sepIndex = firstDot;
    sepChar = ".";
  }

  let inteiro = "";
  let decimal = "";

  if (sepIndex === -1) {
    inteiro = s.replace(/[^\d]/g, "");
  } else {
    inteiro = s.slice(0, sepIndex).replace(/[^\d]/g, "");
    decimal = s.slice(sepIndex + 1).replace(/[^\d]/g, "");
  }

  if (inteiro.length > 7) inteiro = inteiro.slice(0, 7);

  if (decimal.length > 2) decimal = decimal.slice(0, 2);

  if (sepIndex === -1) return inteiro;
  return decimal.length > 0 ? `${inteiro}${sepChar}${decimal}` : `${inteiro}${sepChar}`;
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


  const filtroTexto = document.querySelector(".filtro-texto");
  const filtroTipo = document.querySelector(".filtro-tipo");
  if (filtroTexto) filtroTexto.addEventListener("input", refresh);
  if (filtroTipo) filtroTipo.addEventListener("change", refresh);
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
