import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { EstoquePainel } from "@/components/vendas/estoque-painel";
import { ResumoPanel } from "@/components/vendas/resumo-panel";
import { VendaCard } from "@/components/vendas/venda-card";
import { VendaForm } from "@/components/vendas/venda-form";
import { useExcluirVenda, useVendas } from "@/hooks/use-vendas";
import {
  FORMAS_PAGAMENTO,
  GENEROS,
  TAMANHOS,
  calcularResumo,
  exportarCsv,
  type Venda,
} from "@/lib/vendas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Controle de Vendas — Blusas & Camisas do Evento" },
      {
        name: "description",
        content:
          "Registre vendas de blusas e camisas durante o evento pelo celular, com totais, pagamentos e exportação em CSV atualizados em tempo real.",
      },
      { property: "og:title", content: "Controle de Vendas — Blusas & Camisas do Evento" },
      {
        property: "og:description",
        content:
          "Cadastro rápido de vendas no celular, resumo financeiro em tempo real e exportação em CSV.",
      },
    ],
  }),
  component: Index,
});

type FiltroPagamento = "todos" | "pagos" | "pendentes";

function Index() {
  const { data: vendas = [], isLoading } = useVendas();
  const excluir = useExcluirVenda();

  const [busca, setBusca] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtroPagamento, setFiltroPagamento] = useState<FiltroPagamento>("todos");
  const [filtroGenero, setFiltroGenero] = useState<string>("");
  const [filtroTamanho, setFiltroTamanho] = useState<string>("");
  const [filtroForma, setFiltroForma] = useState<string>("");
  const [formAberto, setFormAberto] = useState(false);
  const [vendaEmEdicao, setVendaEmEdicao] = useState<Venda | null>(null);
  const [aba, setAba] = useState<"vendas" | "estoque">("vendas");

  const resumo = useMemo(() => calcularResumo(vendas), [vendas]);

  const vendasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return vendas.filter((venda) => {
      if (termo && !venda.nome_cliente.toLowerCase().includes(termo)) return false;
      if (filtroPagamento === "pagos" && !venda.pago) return false;
      if (filtroPagamento === "pendentes" && venda.pago) return false;
      if (filtroGenero && venda.genero !== filtroGenero) return false;
      if (filtroTamanho && venda.tamanho !== filtroTamanho) return false;
      if (filtroForma && venda.forma_pagamento !== filtroForma) return false;
      return true;
    });
  }, [vendas, busca, filtroPagamento, filtroGenero, filtroTamanho, filtroForma]);

  const abrirNova = () => {
    setVendaEmEdicao(null);
    setFormAberto(true);
  };

  const abrirEdicao = (venda: Venda) => {
    setVendaEmEdicao(venda);
    setFormAberto(true);
  };

  const handleExcluir = async (venda: Venda) => {
    if (!window.confirm(`Excluir a venda de ${venda.nome_cliente}?`)) return;
    try {
      await excluir.mutateAsync(venda.id);
      toast.success("Venda excluída");
    } catch {
      toast.error("Não foi possível excluir");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[430px] px-4 pb-32 pt-6">
        <header className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.28em] text-faint">
              Controle de vendas
            </div>
            <h1 className="truncate font-display text-2xl font-semibold leading-tight">
              Blusas &amp; Camisas
            </h1>
          </div>
          <div className="spec flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-glass2 font-display text-sm font-semibold text-accent2">
            EV
          </div>
        </header>

        <ResumoPanel resumo={resumo} />

        <div className="mb-3 mt-5 flex items-center gap-2">
          <input
            className="field flex-1"
            placeholder="Buscar cliente…"
            value={busca}
            maxLength={120}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setFiltrosAbertos((v) => !v)}
            className="rounded-2xl border border-line bg-glass2 px-3.5 py-3 text-sm text-faint"
          >
            Filtros
          </button>
        </div>

        {filtrosAbertos ? (
          <div className="tile mb-3 space-y-3 p-3">
            <div className="flex flex-wrap gap-1.5">
              {(["todos", "pagos", "pendentes"] as const).map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setFiltroPagamento(opcao)}
                  className={`rounded-full border border-line px-3 py-1 text-xs capitalize ${
                    filtroPagamento === opcao ? "text-accent2" : "text-faint"
                  }`}
                >
                  {opcao}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GENEROS.map((genero) => (
                <button
                  key={genero}
                  type="button"
                  onClick={() => setFiltroGenero(filtroGenero === genero ? "" : genero)}
                  className={`rounded-full border border-line px-3 py-1 text-xs ${
                    filtroGenero === genero ? "text-accent2" : "text-faint"
                  }`}
                >
                  {genero}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TAMANHOS.map((tamanho) => (
                <button
                  key={tamanho}
                  type="button"
                  onClick={() => setFiltroTamanho(filtroTamanho === tamanho ? "" : tamanho)}
                  className={`rounded-full border border-line px-3 py-1 text-xs ${
                    filtroTamanho === tamanho ? "text-accent2" : "text-faint"
                  }`}
                >
                  {tamanho}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FORMAS_PAGAMENTO.map((forma) => (
                <button
                  key={forma}
                  type="button"
                  onClick={() => setFiltroForma(filtroForma === forma ? "" : forma)}
                  className={`rounded-full border border-line px-3 py-1 text-xs ${
                    filtroForma === forma ? "text-accent2" : "text-faint"
                  }`}
                >
                  {forma}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <section className="space-y-2.5">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-faint">Carregando vendas…</p>
          ) : vendasFiltradas.length === 0 ? (
            <p className="py-8 text-center text-sm text-faint">
              {vendas.length === 0
                ? "Nenhuma venda registrada ainda. Toque no + para começar."
                : "Nenhuma venda encontrada com esses filtros."}
            </p>
          ) : (
            vendasFiltradas.map((venda) => (
              <VendaCard
                key={venda.id}
                venda={venda}
                onEditar={abrirEdicao}
                onExcluir={handleExcluir}
              />
            ))
          )}

          <button
            type="button"
            onClick={() => exportarCsv(vendasFiltradas)}
            disabled={vendasFiltradas.length === 0}
            className="mt-1 w-full rounded-2xl border border-line bg-glass2 py-3 text-sm font-medium text-accent2 disabled:opacity-50"
          >
            Exportar CSV (backup)
          </button>
        </section>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center">
        <button
          type="button"
          onClick={abrirNova}
          aria-label="Nova venda"
          className="pointer-events-auto grid h-16 w-16 place-items-center rounded-full bg-accent2 font-display text-3xl font-semibold text-obsidian shadow-[0_12px_36px_-8px_rgba(165,180,252,0.6)]"
        >
          +
        </button>
      </div>

      <VendaForm
        aberto={formAberto}
        vendaEmEdicao={vendaEmEdicao}
        onFechar={() => setFormAberto(false)}
      />
    </div>
  );
}
