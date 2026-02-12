import { getTotals, removeTransaction } from "./state.js";

export const els = {
  descricao: null,
  quantidade: null,
  tipo: null,

  btnAdicionar: null,
  btnLimpar: null,

  lista: null,

  totalBalance: null,
  totalIncome: null,
  totalExpense: null,
  totalSavings: null,

  categoriasBtns: [],
  categoriaSelecionada: "Outros",
};

export function initUI() {
  els.descricao = document.getElementById("descricao");
  els.quantidade = document.getElementById("quantidade");
  els.tipo = document.getElementById("tipo-transacao");

  els.btnAdicionar = document.querySelector(".adiciona-historia");
  els.btnLimpar = document.querySelector(".limpar-tudo");

  els.lista = document.querySelector(".lista-transacoes");

  els.totalBalance = document.getElementById("total-balance");
  els.totalIncome = document.getElementById("total-income");
  els.totalExpense = document.getElementById("total-expense");
  els.totalSavings = document.getElementById("total-savings");

  els.categoriasBtns = Array.from(document.querySelectorAll(".categorias"));

  const missing = [];
  if (!els.descricao) missing.push("#descricao");
  if (!els.quantidade) missing.push("#quantidade");
  if (!els.tipo) missing.push("#tipo-transacao");
  if (!els.btnAdicionar) missing.push(".adiciona-historia");
  if (!els.btnLimpar) missing.push(".limpar-tudo");
  if (!els.lista) missing.push(".lista-transacoes");

  if (!els.totalBalance) missing.push("#total-balance");
  if (!els.totalIncome) missing.push("#total-income");
  if (!els.totalExpense) missing.push("#total-expense");
  if (!els.totalSavings) missing.push("#total-savings");

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
  const defaultBtn = els.categoriasBtns.find((b) => b.dataset.category === "Outros");
  if (defaultBtn) defaultBtn.classList.add("is-active");

  els.categoriasBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      els.categoriasBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      els.categoriaSelecionada = btn.dataset.category || "Outros";
    });
  });
}

export function renderTotals() {
  const { balance, income, expense, savings } = getTotals();

  els.totalBalance.textContent = formatEUR(balance);
  els.totalIncome.textContent = formatEUR(income);
  els.totalExpense.textContent = formatEUR(expense);
  els.totalSavings.textContent = formatEUR(savings);

 
  els.totalBalance.classList.remove("positivo", "negativo");
  els.totalBalance.classList.add(balance < 0 ? "negativo" : "positivo");

  
  els.totalIncome.classList.add("positivo");

  
  els.totalSavings.classList.add("neutro");
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
      <button class="btn-remover" type="button" title="Remover">🗑️</button>
    </div>
  `;

  div.querySelector(".btn-remover").addEventListener("click", () => {
    removeTransaction(t.id);
    refresh();
  });

  return div;
}

export function renderList(transactions, refresh) {
  els.lista.innerHTML = "";
  transactions.forEach((t) => {
    els.lista.appendChild(createTransactionItem(t, refresh));
  });
}
