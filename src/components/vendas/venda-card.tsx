import { formatBRL, type Venda } from "@/lib/vendas";

interface VendaCardProps {
  venda: Venda;
  onEditar: (venda: Venda) => void;
  onExcluir: (venda: Venda) => void;
}

export function VendaCard({ venda, onEditar, onExcluir }: VendaCardProps) {
  return (
    <article className="glass p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-display text-base font-semibold">{venda.nome_cliente}</div>
          <div className="mt-0.5 text-[11px] text-faint">
            {venda.genero} · {venda.tamanho} · {venda.quantidade} un ·{" "}
            {formatBRL(Number(venda.valor_unitario))} cada
          </div>
          {venda.observacao ? (
            <div className="mt-1 text-[11px] italic text-faint">{venda.observacao}</div>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-base font-semibold">
            {formatBRL(Number(venda.valor_total ?? 0))}
          </div>
          {venda.pago ? (
            <span className="mt-1 inline-block rounded-full border border-paid/30 bg-paid/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paid">
              Pago · {venda.forma_pagamento}
            </span>
          ) : (
            <span className="mt-1 inline-block rounded-full border border-pending/30 bg-pending/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pending">
              Pendente
            </span>
          )}
        </div>
      </div>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={() => onEditar(venda)}
          className="flex-1 rounded-xl border border-line bg-glass2 py-2 text-xs font-medium text-luminous"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onExcluir(venda)}
          className="rounded-xl border border-pending/30 bg-pending/10 px-3 py-2 text-xs font-medium text-pending"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}
