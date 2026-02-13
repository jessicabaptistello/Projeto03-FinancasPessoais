import { elements, initUI, renderTotals, renderList, setupCategoryButtons } from "./modulares/userInterface.js";
import { getTransactions, clearAllTransactions, exportTransactionsJSON, exportTransactionsCSV } from "./modulares/state.js";
import { submitTransaction } from "./modulares/transactions.js";

function refresh() {
  const transactions = getTransactions();
  renderTotals();
  renderList(transactions, refresh);
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

document.addEventListener("DOMContentLoaded", () => {
  
  const ok = initUI();
  if (!ok) return;

  
  const calendarioEl = document.querySelector(".calendario");
  if (calendarioEl) {
    calendarioEl.textContent = `Hoje: ${new Date().toLocaleDateString("pt-PT")}`;
  }

  
  setupCategoryButtons();

  
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

  
  const exportbutton = document.querySelector(".exportar");
  exportbutton.addEventListener("click", () => {
    const transactions = getTransactions();
    if (transactions.length === 0) {
      alert("Não há transações para exportar.");
      return;
    }

    const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");

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

  
  refresh();
});
