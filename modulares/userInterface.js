/*
OBJETIVO:
Atualizar a interface sempre que o estado mudar.

PENSAMENTO:

1) Selecionar o container da lista.
2) Limpar o conteúdo antes de renderizar novamente.
3) Para cada transação:
   - Criar elemento HTML dinamicamente.
   - Inserir no DOM.
4) Atualizar os cards com os valores calculados.

REFLEXÃO:
- Por que limpar antes de renderizar?
- O que acontece se não limpar?

DESAFIO:
Como aplicar classes diferentes para receita e despesa?
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

export function initUI() {
  elements.descricao = document.getElementById("descricao");
  elements.quantidade = document.getElementById("quantidade");
  elements.tipo = document.getElementById("tipo-transacao");

  elements.buttonAdicionar = document.querySelector(".adiciona-historia");
  elements.buttonLimpar = document.querySelector(".limpar-tudo");

  elements.lista = document.querySelector(".lista-transacoes");

  elements.totalBalance = document.getElementById("total-balance");
  elements.totalIncome = document.getElementById("total-income");
  elements.totalExpense = document.getElementById("total-expense");
  elements.totalSavings = document.getElementById("total-savings");

  elements.categoriasbuttons = Array.from(document.querySelectorAll(".categorias"));

  const missing = [];
  if (!elements.descricao) missing.push("#descricao");
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

export function setupCategoryButtons() {
  const defaultbutton = elements.categoriasbuttons.find((b) => b.dataset.category === "Outros");
  if (defaultbutton) defaultbutton.classList.add("is-active");

  elements.categoriasbuttons.forEach((button) => {
    button.addEventListener("click", () => {
      elements.categoriasbuttons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      elements.categoriaSelecionada = button.dataset.category || "Outros";
    });
  });
}

export function renderTotals() {
  const { balance, income, expense, savings } = getTotals();

 elements.totalBalance.textContent = formatEUR(balance);
 elements.totalIncome.textContent = formatEUR(income);
 elements.totalExpense.textContent = formatEUR(expense);
 elements.totalSavings.textContent = formatEUR(savings);

 
  elements.totalBalance.classList.remove("positivo", "negativo");
  elements.totalBalance.classList.add(balance < 0 ? "negativo" : "positivo");

  
  elements.totalIncome.classList.add("positivo");

  
  elements.totalSavings.classList.add("neutro");
}

function createTransactionItem(t, refresh) {
  const isDespesa = t.tipo === "despesa";
  const isReceita = t.tipo === "receita";

  let valorAssinado = t.valor;
  if (isDespesa) valorAssinado = -t.valor;

  const etiquetaClass = isDespesa
    ? "etiqueta-despesa"
    : isReceita
      ? "etiqueta-receita"
      : "etiqueta-poupanca";

  const etiquetaTexto = isDespesa
    ? "DESPESA"
    : isReceita
      ? "RECEITA"
      : "POUPANÇA";

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

  div.querySelector(".button-remover").addEventListener("click", () => {
    removeTransaction(t.id);
    refresh();
  });

  return div;
}

export function renderList(transactions, refresh) {
  elements.lista.innerHTML = "";
  transactions.forEach((t) => {
    elements.lista.appendChild(createTransactionItem(t, refresh));
  });
}
