import type { Database } from "@/integrations/supabase/types";

export type Venda = Database["public"]["Tables"]["vendas"]["Row"];
export type VendaInsert = Database["public"]["Tables"]["vendas"]["Insert"];

export const GENEROS = ["Masculino", "Feminino"] as const;
export const TAMANHOS = ["PP", "P", "M", "G", "GG", "XG"] as const;
export const FORMAS_PAGAMENTO = [
  "Dinheiro",
  "Pix",
  "Cartão de Débito",
  "Cartão de Crédito",
] as const;

export type Genero = (typeof GENEROS)[number];
export type Tamanho = (typeof TAMANHOS)[number];
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

export const formatBRL = (value: number): string =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export interface Resumo {
  total: number;
  recebido: number;
  pendente: number;
  pecas: number;
  clientes: number;
  porTamanho: Record<string, number>;
  porGenero: Record<string, number>;
  porPagamento: Record<string, number>;
}

export function calcularResumo(vendas: Venda[]): Resumo {
  const resumo: Resumo = {
    total: 0,
    recebido: 0,
    pendente: 0,
    pecas: 0,
    clientes: 0,
    porTamanho: Object.fromEntries(TAMANHOS.map((t) => [t, 0])),
    porGenero: { Masculino: 0, Feminino: 0 },
    porPagamento: Object.fromEntries(FORMAS_PAGAMENTO.map((f) => [f, 0])),
  };

  const clientes = new Set<string>();

  for (const venda of vendas) {
    const total = Number(venda.valor_total ?? 0);
    resumo.total += total;
    if (venda.pago) {
      resumo.recebido += total;
      if (venda.forma_pagamento) {
        resumo.porPagamento[venda.forma_pagamento] =
          (resumo.porPagamento[venda.forma_pagamento] ?? 0) + total;
      }
    } else {
      resumo.pendente += total;
    }
    resumo.pecas += venda.quantidade;
    resumo.porTamanho[venda.tamanho] = (resumo.porTamanho[venda.tamanho] ?? 0) + venda.quantidade;
    resumo.porGenero[venda.genero] = (resumo.porGenero[venda.genero] ?? 0) + venda.quantidade;
    clientes.add(venda.nome_cliente.trim().toLowerCase());
  }

  resumo.clientes = clientes.size;
  return resumo;
}

export function exportarCsv(vendas: Venda[]): void {
  const headers = [
    "Cliente",
    "Gênero",
    "Tamanho",
    "Quantidade",
    "Valor unitário",
    "Valor total",
    "Pago",
    "Forma de pagamento",
    "Observação",
    "Data/hora",
  ];

  const escape = (value: string | number | null): string =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const linhas = vendas.map((v) =>
    [
      v.nome_cliente,
      v.genero,
      v.tamanho,
      v.quantidade,
      Number(v.valor_unitario).toFixed(2).replace(".", ","),
      Number(v.valor_total ?? 0)
        .toFixed(2)
        .replace(".", ","),
      v.pago ? "Sim" : "Não",
      v.forma_pagamento ?? "",
      v.observacao ?? "",
      new Date(v.data_hora).toLocaleString("pt-BR"),
    ]
      .map(escape)
      .join(";"),
  );

  const csv = "\uFEFF" + [headers.map(escape).join(";"), ...linhas].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vendas-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
