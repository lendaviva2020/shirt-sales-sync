import * as XLSX from "xlsx";
import type { EstoqueStatus } from "@/hooks/use-estoque";
import { FORMAS_PAGAMENTO, TAMANHOS, calcularResumo, type Venda } from "@/lib/vendas";

type Linha = (string | number | null)[];

const TITULO = 'CONTROLE DE VENDAS — Camisetas "Jesus é o Caminho" (4º Louvorzão IEQ 2026)';

function abaVendas(vendas: Venda[]): XLSX.WorkSheet {
  const linhas: Linha[] = [
    [TITULO],
    [],
    [
      "Nome do Cliente",
      "Gênero",
      "Tamanho",
      "Quantidade",
      "Valor Unitário (R$)",
      "Valor Total (R$)",
      "Pago?",
      "Forma de Pagamento",
      "Observação",
      "Data",
    ],
  ];

  const ordenadas = [...vendas].sort(
    (a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime(),
  );

  for (const v of ordenadas) {
    linhas.push([
      v.nome_cliente,
      v.genero,
      v.tamanho,
      v.quantidade,
      Number(v.valor_unitario),
      Number(v.valor_total ?? 0),
      v.pago ? "Sim" : "Não",
      v.forma_pagamento ?? "",
      v.observacao ?? "",
      new Date(v.data_hora).toLocaleString("pt-BR"),
    ]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(linhas);
  sheet["!cols"] = [
    { wch: 28 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 18 },
    { wch: 16 },
    { wch: 8 },
    { wch: 20 },
    { wch: 28 },
    { wch: 20 },
  ];
  return sheet;
}

function abaEstoque(estoque: EstoqueStatus[]): XLSX.WorkSheet {
  const linhas: Linha[] = [
    ["ESTOQUE DE CAMISETAS — por tamanho e gênero"],
    [],
    ["Gênero", "Tamanho", "Estoque Inicial", "Vendido", "Restante", "Status"],
  ];

  let totalInicial = 0;
  let totalVendido = 0;
  let totalRestante = 0;

  for (const item of estoque) {
    const inicial = item.quantidade_inicial ?? 0;
    const vendido = item.vendido ?? 0;
    const restante = item.restante ?? 0;
    totalInicial += inicial;
    totalVendido += vendido;
    totalRestante += restante;
    const status = restante <= 0 ? "Esgotado" : restante <= 3 ? "Estoque baixo" : "OK";
    linhas.push([item.genero ?? "", item.tamanho ?? "", inicial, vendido, restante, status]);
  }

  const percentual = totalInicial > 0 ? (totalVendido / totalInicial) * 100 : 0;
  linhas.push([]);
  linhas.push(["TOTAL", "", totalInicial, totalVendido, totalRestante, ""]);
  linhas.push([]);
  linhas.push([
    `Progresso de vendas: ${totalVendido} de ${totalInicial} unidades (${percentual.toFixed(1)}%)`,
  ]);

  const sheet = XLSX.utils.aoa_to_sheet(linhas);
  sheet["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 16 }];
  return sheet;
}

function abaResumo(vendas: Venda[]): XLSX.WorkSheet {
  const resumo = calcularResumo(vendas);
  const linhas: Linha[] = [
    ["RESUMO FINANCEIRO — Evento 4º Louvorzão IEQ 2026"],
    [],
    ["Totais gerais"],
    ["Total arrecadado (todas as vendas)", resumo.total],
    ["Total já recebido (pago = Sim)", resumo.recebido],
    ["Total pendente (pago = Não)", resumo.pendente],
    ["Quantidade total de peças vendidas", resumo.pecas],
    ["Número de vendas registradas", vendas.length],
    ["Número de clientes atendidos", resumo.clientes],
    [],
    ["Por tamanho", "Peças vendidas"],
  ];

  for (const tamanho of TAMANHOS) {
    linhas.push([tamanho, resumo.porTamanho[tamanho] ?? 0]);
  }

  linhas.push([]);
  linhas.push(["Por gênero", "Peças vendidas"]);
  linhas.push(["Masculino", resumo.porGenero["Masculino"] ?? 0]);
  linhas.push(["Baby Look", resumo.porGenero["Baby Look"] ?? 0]);
  linhas.push([]);
  linhas.push(["Recebido por forma de pagamento", "Valor (R$)"]);
  for (const forma of FORMAS_PAGAMENTO) {
    linhas.push([forma, resumo.porPagamento[forma] ?? 0]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(linhas);
  sheet["!cols"] = [{ wch: 38 }, { wch: 18 }];
  return sheet;
}

export function exportarPlanilha(vendas: Venda[], estoque: EstoqueStatus[]): void {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, abaVendas(vendas), "Vendas");
  XLSX.utils.book_append_sheet(wb, abaEstoque(estoque), "Estoque");
  XLSX.utils.book_append_sheet(wb, abaResumo(vendas), "Resumo");
  XLSX.writeFile(wb, `Controle_Vendas_Camisetas_Evento_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
