import { getTotals, removeTransaction, updateTransaction } from "./state.js";

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
  elements.descricao = byId("descricao");
  elements.quantidade = byId("quantidade");
  elements.tipo = byId("tipo-transacao");

  elements.buttonAdicionar = $(".adiciona-historia");
  elements.buttonLimpar = $(".limpar-tudo");

  elements.lista = $(".lista-transacoes");

  elements.totalBalance = byId("total-balance");
  elements.totalIncome = byId("total-income");
  elements.totalExpense = byId("total-expense");
  elements.totalSavings = byId("total-savings");

  elements.categoriasbuttons = Array.from(document.querySelectorAll(".categorias"));

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
  el.classList.remove("positivo", "negativo", "neutro");
  el.classList.add(status);
}

export function setupCategoryButtons() {
  const defaultBtn = elements.categoriasbuttons.find(
    (b) => b.dataset.category === "Outros"
  );
  if (defaultBtn) defaultBtn.classList.add("is-active");

  for (const button of elements.categoriasbuttons) {
    button.addEventListener("click", () => {
      for (const b of elements.categoriasbuttons) b.classList.remove("is-active");
      button.classList.add("is-active");
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

function editTransaction(t, refresh) {
  const novaDescricao = prompt("Nova descrição:", t.descricao);
  if (novaDescricao === null) return;

  const novoValorStr = prompt("Novo valor (apenas número):", String(t.valor));
  if (novoValorStr === null) return;

  const novoValor = Number(novoValorStr);
  if (!novoValor || Number.isNaN(novoValor) || novoValor <= 0) {
    alert("Valor inválido. Deve ser um número maior que 0.");
    return;
  }

  const novoTipo = prompt('Novo tipo: "receita", "despesa" ou "poupanca"', t.tipo);
  if (novoTipo === null) return;

  if (!["receita", "despesa", "poupanca"].includes(novoTipo)) {
    alert("Tipo inválido.");
    return;
  }

  const novaCategoria = prompt("Nova categoria:", t.categoria || "Outros");
  if (novaCategoria === null) return;

  updateTransaction(t.id, {
    descricao: novaDescricao.trim(),
    valor: novoValor,
    tipo: novoTipo,
    categoria: novaCategoria.trim(),
  });

  refresh();
}

function createTransactionItem(t, refresh) {
  const isDespesa = t.tipo === "despesa";
  const isReceita = t.tipo === "receita";
  const isPoupanca = t.tipo === "poupanca";

  const valorAssinado = isDespesa ? -t.valor : t.valor;

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

  const valorClass = isDespesa ? "negativo" : isPoupanca ? "neutro" : "positivo";


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
    <div class="data-transacao">${t.data || "-"}</div>

    <div class="valor-transacao ${valorClass}">
      ${formatEUR(valorAssinado)}
      <button class="button-editar" type="button" title="Editar">✏️</button>
      <button class="button-remover" type="button" title="Remover">🗑️</button>
    </div>
  `;

  const btnEdit = div.querySelector(".button-editar");
  btnEdit.addEventListener("click", () => {
    editTransaction(t, refresh);
  });

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
