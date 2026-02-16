import { elements } from "./userInterface.js";
import { addTransaction } from "./state.js";
import { RULES } from "./rules.js";


const categoriasPorTipo = {
  receita: ["Ordenado", "Outros"],
  despesa: [
    "Alimentação",
    "Educação",
    "Habitação",
    "Saúde",
    "Lazer",
    "Saúde - Outros",
    "Outros",
  ],
  poupanca: ["Poupança", "Outros"],
};

function todayPT() {
  return new Date().toLocaleDateString("pt-PT");
}

function readForm() {
  return {
    descricao: elements.descricao.value.trim(),
    valor: Number(elements.quantidade.value),
    tipo: elements.tipo.value,
    categoria: elements.categoriaSelecionada || "Outros",
  };
}

function isValid(data) {
  if (!data.descricao) {
    alert("Preencha a descrição.");
    return false;
  }

  if (data.descricao.length > RULES.DESCRICAO_MAX) {
    alert(`A descrição deve ter no máximo ${RULES.DESCRICAO_MAX} caracteres.`);
    return false;
  }

  if (!data.valor || Number.isNaN(data.valor)) {
    alert("Insira um valor numérico válido.");
    return false;
  }

  if (data.valor < RULES.VALOR_MIN) {
    alert(`O valor deve ser maior que ${RULES.VALOR_MIN}.`);
    return false;
  }

  if (data.valor > RULES.VALOR_MAX) {
    alert(`O valor máximo permitido é ${RULES.VALOR_MAX}.`);
    return false;
  }

  const tiposValidos = ["receita", "despesa", "poupanca"];
  if (!tiposValidos.includes(data.tipo)) {
    alert("Selecione um tipo válido.");
    return false;
  }

  const permitidas = categoriasPorTipo[data.tipo] || [];
  if (!permitidas.includes(data.categoria)) {
    alert(`A categoria "${data.categoria}" não combina com o tipo "${data.tipo}".`);
    return false;
  }

  return true;
}

function clearForm() {
  elements.descricao.value = "";
  elements.quantidade.value = "";
  elements.tipo.value = "receita";
}

export function submitTransaction(refresh) {
  const data = readForm();
  if (!isValid(data)) return;

  addTransaction({
    descricao: data.descricao,
    valor: data.valor,
    tipo: data.tipo,
    categoria: data.categoria,
    data: todayPT(), 
  });

  clearForm();
  refresh();
}
