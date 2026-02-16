import { getTotals, removeTransaction, updateTransaction } from "./state.js";
import { RULES } from "./rules.js";

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
    console.error("Elementos não encontrados:", missing);
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
  const defaultBtn = elements.categoriasbuttons.find((b) => b.dataset.category === "Outros");
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


function isValidDatePT(dateStr) {
  const re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const m = dateStr.match(re);
  if (!m) return false;

  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);

  if (mo < 1 || mo > 12) return false;
  if (d < 1 || d > 31) return false;
  if (y < 1900 || y > 3000) return false;
  return true;
}


function askDescricao(atual) {
  while (true) {
    const input = prompt(`Descrição (máx ${RULES.DESCRICAO_MAX}):`, atual);
    if (input === null) return null;

    const desc = input.trim();

    if (desc.length === 0) {
      alert("Descrição não pode ficar vazia.");
      continue;
    }

    if (desc.length > RULES.DESCRICAO_MAX) {
      alert(`Passou do limite. Máx: ${RULES.DESCRICAO_MAX} caracteres.`);
      continue;
    }

    return desc;
  }
}

function askValor(atual) {
  while (true) {
    const input = prompt(`Valor (máx 7 dígitos, até ${RULES.VALOR_MAX}):`, String(atual));
    if (input === null) return null;

    const txt = input.trim();

 
    if (!/^\d+$/.test(txt)) {
      alert("Digite apenas números (sem vírgula/ponto).");
      continue;
    }

    
    if (txt.length > RULES.VALOR_MAX_DIGITOS) {
      alert("Passou do limite. Máx: 7 dígitos.");
      continue;
    }

    const valor = Number(txt);

    if (!valor || Number.isNaN(valor)) {
      alert("Valor inválido.");
      continue;
    }

    if (valor < RULES.VALOR_MIN) {
      alert(`O valor deve ser maior que ${RULES.VALOR_MIN}.`);
      continue;
    }

    if (valor > RULES.VALOR_MAX) {
      alert(`O valor máximo permitido é ${RULES.VALOR_MAX}.`);
      continue;
    }

    return valor;
  }
}

function askTipo(atual) {
  while (true) {
    const input = prompt('Tipo: receita / despesa / poupanca', atual);
    if (input === null) return null;

    const tipo = input.trim().toLowerCase(); 

    if (!["receita", "despesa", "poupanca"].includes(tipo)) {
      alert("Tipo inválido. Escreva: receita, despesa ou poupanca.");
      continue;
    }

    return tipo;
  }
}

function askCategoria(atual) {
  const input = prompt("Categoria:", atual);
  if (input === null) return null;
  return input.trim() || "Outros";
}

function askData(atual) {
  while (true) {
    const input = prompt('Data (dd/mm/aaaa) ou vazio:', atual);
    if (input === null) return null;

    const data = input.trim();

    if (data === "") return ""; 

    if (!isValidDatePT(data)) {
      alert('Data inválida. Ex: 05/02/2026');
      continue;
    }

    return data;
  }
}


function editTransaction(t, refresh) {
  const descricao = askDescricao(t.descricao);
  if (descricao === null) return;

  const valor = askValor(t.valor);
  if (valor === null) return;

  const tipo = askTipo(t.tipo);
  if (tipo === null) return;

  const categoria = askCategoria(t.categoria || "Outros");
  if (categoria === null) return;

  const data = askData(t.data || "");
  if (data === null) return;

  updateTransaction(t.id, { descricao, valor, tipo, categoria, data });
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

  const etiquetaTexto = isDespesa ? "DESPESA" : isReceita ? "RECEITA" : "POUPANÇA";

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

  div.querySelector(".button-editar").addEventListener("click", () => {
    editTransaction(t, refresh);
  });

  div.querySelector(".button-remover").addEventListener("click", () => {
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
