import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAtualizarEstoqueInicial, useEstoque } from "@/hooks/use-estoque";

function statusDe(restante: number): { label: string; classe: string } {
  if (restante <= 0) return { label: "Esgotado", classe: "border-pending/40 bg-pending/15 text-pending" };
  if (restante <= 3)
    return { label: "Estoque baixo", classe: "border-amber-400/40 bg-amber-400/15 text-amber-300" };
  return { label: "OK", classe: "border-paid/40 bg-paid/15 text-paid" };
}

export function EstoquePainel() {
  const { data: itens = [], isLoading } = useEstoque();
  const atualizar = useAtualizarEstoqueInicial();
  const [rascunho, setRascunho] = useState<Record<string, string>>({});

  useEffect(() => {
    setRascunho((atual) => {
      const proximo = { ...atual };
      for (const item of itens) {
        const chave = `${item.genero}|${item.tamanho}`;
        if (proximo[chave] === undefined) {
          proximo[chave] = String(item.quantidade_inicial ?? 0);
        }
      }
      return proximo;
    });
  }, [itens]);

  const salvar = async (genero: string, tamanho: string, valor: string, atualValor: number) => {
    const quantidadeInicial = Number(valor);
    if (!Number.isInteger(quantidadeInicial) || quantidadeInicial < 0) {
      toast.error("Informe um número inteiro válido");
      setRascunho((r) => ({ ...r, [`${genero}|${tamanho}`]: String(atualValor) }));
      return;
    }
    if (quantidadeInicial === atualValor) return;
    try {
      await atualizar.mutateAsync({ genero, tamanho, quantidadeInicial });
      toast.success(`Estoque de ${genero} - ${tamanho} atualizado`);
    } catch {
      toast.error("Não foi possível atualizar o estoque");
      setRascunho((r) => ({ ...r, [`${genero}|${tamanho}`]: String(atualValor) }));
    }
  };

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-faint">Carregando estoque…</p>;
  }

  return (
    <section className="space-y-2.5">
      {itens.map((item) => {
        const genero = item.genero ?? "";
        const tamanho = item.tamanho ?? "";
        const chave = `${genero}|${tamanho}`;
        const inicial = item.quantidade_inicial ?? 0;
        const vendido = item.vendido ?? 0;
        const restante = item.restante ?? 0;
        const status = statusDe(restante);

        return (
          <div key={chave} className="tile p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-display text-lg font-semibold leading-none">
                  {tamanho}
                  <span className="ml-2 text-xs font-normal text-faint">{genero}</span>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${status.classe}`}
              >
                {status.label}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 items-end gap-2">
              <div>
                <label
                  htmlFor={`estoque-${chave}`}
                  className="text-[10px] uppercase tracking-[0.16em] text-faint"
                >
                  Inicial
                </label>
                <input
                  id={`estoque-${chave}`}
                  className="field mt-1 py-2 text-sm"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={rascunho[chave] ?? String(inicial)}
                  onChange={(e) => setRascunho((r) => ({ ...r, [chave]: e.target.value }))}
                  onBlur={(e) => void salvar(genero, tamanho, e.target.value, inicial)}
                />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-faint">Vendido</div>
                <div className="mt-1 font-display text-lg font-semibold">{vendido}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-faint">Restante</div>
                <div className="mt-1 font-display text-lg font-semibold text-accent2">
                  {restante}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
