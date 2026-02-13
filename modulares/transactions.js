import { elements } from "./userInterface.js";
import { addTransaction } from "./state.js";

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

  if (!data.valor || Number.isNaN(data.valor) || data.valor <= 0) {
    alert("Insira um valor numérico positivo (maior que 0).");
    return false;
  }

  const tiposValidos = ["receita", "despesa", "poupanca"];
  if (!tiposValidos.includes(data.tipo)) {
    alert("Selecione um tipo válido.");
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
