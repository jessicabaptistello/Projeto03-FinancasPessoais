/*
  userInterface.js
  OBJETIVO: lidar com o DOM (tela).
  - selecionar elementos (initUI)
  - configurar botões (setupCategoryButtons)
  - renderizar totais e lista (renderTotals / renderList)
*/

import { getTotals, removeTransaction } from "./state.js";

export const elements = {
  descricao: null,
  quantidade: null,
  tipo: null,

  buttonAdicionar: null,
  buttonLimpar: null,

  lista: null,

  totalBalance: null,
  totalIncome: null,
  totalExpense: null,
  totalSavings: null,

  categoriasbuttons: [],
  categoriaSelecionada: "Outros",
};

function $(selector) {
  return document.querySelector(selector);
}

function byId(id) {
  return document.getElementById(id);
}

export function initUI() {
  // Inputs
  elements.descricao = byId("descricao");
  elements.quantidade = byId("quantidade");
  elements.tipo = byId("tipo-transacao");

  // Botões
  elements.buttonAdicionar = $(".adiciona-historia");
  elements.buttonLimpar = $(".limpar-tudo");

  // Lista
  elements.lista = $(".lista-transacoes");

  // Totais
  elements.totalBalance = byId("total-balance");
  elements.totalIncome = byId("total-income");
  elements.totalExpense = byId("total-expense");
  elements.totalSavings = byId("total-savings");

  // Categorias
  elements.categoriasbuttons = Array.from(document.querySelectorAll(".categorias"));

  // Verificação simples (iniciante-friendly)
  const missing = [];
  if (!elements.descricao) missing.push("#descricao");
  if (!elements.quantidade) missing.push("#quantidade");
  if (!elements.tipo) missing.push("#tipo-transacao");

  if (!elements.buttonAdicionar) missing.push(".adiciona-historia");
  if (!elements.buttonLimpar) missing.push(".limpar-tudo");

  if (!elements.lista) missing.push(".lista-transacoes");

  if (!elements.totalBalance) missing.push("#total-balance");
  if (!elements.totalIncome) missing.push("#total-income");
  if (!elements.totalExpense) missing.push("#total-expense");
  if (!elements.totalSavings) missing.push("#total-savings");

  if (missing.length > 0) {
    console.error("Elementos não encontrados no HTML:", missing);
    alert("Erro. Veja o Console (F12).");
    return false;
  }

  return true;
}

function formatEUR(value) {
  return value.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

function setStatusClass(el, status) {
  // status: "positivo" | "negativo" | "neutro"
  el.classList.remove("positivo", "negativo", "neutro");
  el.classList.add(status);
}

export function setupCategoryButtons() {
  // Marca "Outros" como ativo no início (se existir)
  const defaultBtn = elements.categoriasbuttons.find(
    (b) => b.dataset.category === "Outros"
  );
  if (defaultBtn) defaultBtn.classList.add("is-active");

  for (const button of elements.categoriasbuttons) {
    button.addEventListener("click", () => {
      // tira ativo de todos
      for (const b of elements.categoriasbuttons) b.classList.remove("is-active");

      // marca o clicado
      button.classList.add("is-active");

      // guarda categoria selecionada
      elements.categoriaSelecionada = button.dataset.category || "Outros";
    });
  }
}

export function renderTotals() {
  const { balance, income, expense, savings } = getTotals();

  elements.totalBalance.textContent = formatEUR(balance);
  elements.totalIncome.textContent = formatEUR(income);
  elements.totalExpense.textContent = formatEUR(expense);
  elements.totalSavings.textContent = formatEUR(savings);

  setStatusClass(elements.totalBalance, balance < 0 ? "negativo" : "positivo");
  setStatusClass(elements.totalIncome, "positivo");
  setStatusClass(elements.totalExpense, "negativo");
  setStatusClass(elements.totalSavings, "neutro");
}

function createTransactionItem(t, refresh) {
  const isDespesa = t.tipo === "despesa";
  const isReceita = t.tipo === "receita";

  const valorAssinado = isDespesa ? -t.valor : t.valor;

  const etiquetaClass = isDespesa
    ? "etiqueta-despesa"
    : isReceita
    ? "etiqueta-receita"
    : "etiqueta-poupanca";

  const etiquetaTexto = isDespesa ? "DESPESA" : isReceita ? "RECEITA" : "POUPANÇA";

  const valorClass = isDespesa ? "negativo" : "positivo";

  const div = document.createElement("div");
  div.className = "item-transacao";

  div.innerHTML = `
    <div class="info-transacao">
      <div class="caixa-icone"><span class="real-icon">€</span></div>
      <div>
        <div class="nome-transacao">${t.descricao}</div>
        <span class="etiqueta ${etiquetaClass}">${etiquetaTexto}</span>
      </div>
    </div>

    <div class="data-transacao">${t.categoria || "-"}</div>
    <div class="data-transacao">${t.data}</div>

    <div class="valor-transacao ${valorClass}">
      ${formatEUR(valorAssinado)}
      <button class="button-remover" type="button" title="Remover">🗑️</button>
    </div>
  `;

  const btnRemove = div.querySelector(".button-remover");
  btnRemove.addEventListener("click", () => {
    removeTransaction(t.id);
    refresh();
  });

  return div;
}

export function renderList(transactions, refresh) {
  elements.lista.innerHTML = "";

  for (const t of transactions) {
    elements.lista.appendChild(createTransactionItem(t, refresh));
  }
}
