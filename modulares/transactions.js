/*
OBJETIVO:
Calcular saldo total, total de receitas e total de despesas.

PENSAMENTO:

1) O saldo começa em 0.
2) Para cada transação:
   - Se for receita, soma.
   - Se for despesa, subtrai.
3) Para calcular totais separados:
   - Filtrar por tipo.
   - Somar valores.

DICA IMPORTANTE:
Use reduce().

Pergunta:
- O que é o acumulador?
- Qual deve ser o valor inicial?

Exemplo mental:
[100, -50, 200]
Resultado esperado: 250

Não escreva loops tradicionais.
*/


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

  if (data.tipo !== "receita" && data.tipo !== "despesa") {
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
