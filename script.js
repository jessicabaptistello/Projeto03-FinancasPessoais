// 1) Pegando elementos do HTML (por id)
const form = document.getElementById("transactionForm");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");

const list = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const clearAllBtn = document.getElementById("clearAllBtn");

// 2) Nosso "banco de dados" simples em memória (um array)
let transactions = [];

// 3) Função para formatar dinheiro (euros)
function formatEUR(value) {
  // garante número
  const num = Number(value) || 0;

  // formata no estilo PT (Portugal): 1 234,56 €
  return num.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

// 4) Atualiza os totais (saldo, receitas, despesas) e redesenha a lista
function render() {
  // Calcula receitas (valores > 0)
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcula despesas (valores < 0)
  const expense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income + expense; // expense já é negativo

  // Atualiza UI dos totais
  incomeEl.textContent = formatEUR(income);
  expenseEl.textContent = formatEUR(expense);
  balanceEl.textContent = formatEUR(balance);

  // Limpa lista antes de redesenhar
  list.innerHTML = "";

  // Estado vazio
  if (transactions.length === 0) {
    emptyState.style.display = "block";
    return;
  } else {
    emptyState.style.display = "none";
  }

  // Desenha cada item
  transactions.forEach((t) => {
    const li = document.createElement("li");
    li.className = "item";

    const isIncome = t.amount > 0;

    li.innerHTML = `
      <div class="left">
        <span class="desc">${t.desc}</span>
        <span class="type">${isIncome ? "Receita" : "Despesa"}</span>
      </div>

      <div class="right">
        <span class="amt ${isIncome ? "positive" : "negative"}">
          ${formatEUR(t.amount)}
        </span>
        <button class="remove" aria-label="Remover">✕</button>
      </div>
    `;

    // Botão remover
    li.querySelector(".remove").addEventListener("click", () => {
      transactions = transactions.filter(x => x.id !== t.id);
      render();
    });

    list.appendChild(li);
  });
}

// 5) Quando enviar o formulário, cria um lançamento
form.addEventListener("submit", (event) => {
  event.preventDefault(); // evita recarregar a página

  const desc = descInput.value.trim();
  const amount = Number(amountInput.value);

  // validações simples
  if (!desc) return;
  if (!amount || Number.isNaN(amount)) return;

  const newTransaction = {
    id: crypto.randomUUID(), // id único
    desc,
    amount
  };

  transactions.unshift(newTransaction); // adiciona no início
  form.reset(); // limpa os inputs

  render();
});

// 6) Limpar tudo
clearAllBtn.addEventListener("click", () => {
  transactions = [];
  render();
});

// 7) Primeira renderização
render();
