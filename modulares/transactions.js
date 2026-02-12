import { els } from "./userInterface.js";
import { addTransaction } from "./state.js";

function makeDate() {
  return new Date().toLocaleDateString("pt-PT");
}

function getFormData() {
  return {
    descricao: els.descricao.value.trim(),
    valor: Number(els.quantidade.value),
    tipo: els.tipo.value, 
    categoria: els.categoriaSelecionada || "Outros",
  };
}

function validate(data) {
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
  els.descricao.value = "";
  els.quantidade.value = "";
  els.tipo.value = "receita";
}

export function submitTransaction(refresh) {
  const data = getFormData();
  if (!validate(data)) return;

  addTransaction({
    descricao: data.descricao,
    valor: data.valor,
    tipo: data.tipo,
    categoria: data.categoria,
    data: makeDate(),
  });

  clearForm();
  refresh();
}
