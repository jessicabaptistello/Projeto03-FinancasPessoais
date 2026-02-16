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
    valorTexto: String(elements.quantidade.value || "").trim(),
    tipo: elements.tipo.value,
    categoria: elements.categoriaSelecionada || "Outros",
  };
}

function convertMoneyTextToNumber(valorTexto) {
  const txt = String(valorTexto).trim().replace(",", ".");
  const numero = Number(txt);
  return numero;
}


function isMoneyTextValid(valorTexto) {
  const txt = String(valorTexto).trim();

  const pattern = /^\d+([.,]\d{1,2})?$/;
  if (!pattern.test(txt)) return false;

  const normalized = txt.replace(",", ".");
  const parts = normalized.split(".");
  const inteiro = parts[0] || "";
  const decimal = parts[1] || "";

  if (inteiro.length > RULES.VALOR_MAX_DIGITOS_INTEIRO) return false;
  if (decimal.length > RULES.VALOR_MAX_DECIMAIS) return false;

  return true;
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

  if (!data.valorTexto) {
    alert("Insira um valor.");
    return false;
  }

  if (!isMoneyTextValid(data.valorTexto)) {
    alert("Valor inválido. Use exemplo: 10,50 ou 10.50 (máx 7 dígitos e 2 decimais).");
    return false;
  }

  const numero = convertMoneyTextToNumber(data.valorTexto);

  if (!numero || Number.isNaN(numero)) {
    alert("Valor inválido.");
    return false;
  }

  if (numero < RULES.VALOR_MIN) {
    alert(`O valor deve ser maior que ${RULES.VALOR_MIN}.`);
    return false;
  }

  if (numero > RULES.VALOR_MAX) {
    alert(`O valor máximo permitido é ${RULES.VALOR_MAX}.`);
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

  const valorNumero = Number(convertMoneyTextToNumber(data.valorTexto).toFixed(2));

  addTransaction({
    descricao: data.descricao,
    valor: valorNumero,
    tipo: data.tipo,
    categoria: data.categoria,
    data: todayPT(),
  });

  clearForm();
  refresh();
}
