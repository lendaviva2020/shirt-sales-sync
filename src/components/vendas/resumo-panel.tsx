import { TAMANHOS, formatBRL, type Resumo } from "@/lib/vendas";

interface ResumoPanelProps {
  resumo: Resumo;
}

export function ResumoPanel({ resumo }: ResumoPanelProps) {
  const maxTamanho = Math.max(...TAMANHOS.map((t) => resumo.porTamanho[t] ?? 0), 0);

  return (
    <section className="glass p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-medium text-faint">Painel de resumo</span>
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-paid">
          <span className="h-1.5 w-1.5 rounded-full bg-paid shadow-[0_0_8px_#4ADE80]" />
          Ao vivo
        </span>
      </div>

      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-faint">
          Valor total arrecadado
        </div>
        <div
          className="mt-1 font-display text-[40px] font-semibold leading-none text-luminous"
          style={{ textShadow: "0 0 22px rgba(165,180,252,0.25)" }}
        >
          {formatBRL(resumo.total)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="tile p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-paid">Recebido</div>
          <div className="mt-1 font-display text-lg font-semibold text-paid">
            {formatBRL(resumo.recebido)}
          </div>
        </div>
        <div className="tile p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-pending">Pendente</div>
          <div className="mt-1 font-display text-lg font-semibold text-pending">
            {formatBRL(resumo.pendente)}
          </div>
        </div>
        <div className="tile p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-faint">Peças vendidas</div>
          <div className="mt-1 font-display text-lg font-semibold text-luminous">
            {resumo.pecas}
          </div>
        </div>
        <div className="tile p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-faint">Clientes</div>
          <div className="mt-1 font-display text-lg font-semibold text-luminous">
            {resumo.clientes}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-faint">
          Peças por tamanho
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {TAMANHOS.map((tamanho) => {
            const valor = resumo.porTamanho[tamanho] ?? 0;
            const destaque = valor > 0 && valor === maxTamanho;
            return (
              <div key={tamanho} className="tile py-2 text-center">
                <div className="text-[10px] text-faint">{tamanho}</div>
                <div
                  className={`font-display text-sm font-semibold ${destaque ? "text-accent2" : "text-luminous"}`}
                >
                  {valor}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <div className="tile p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-faint">Gênero</div>
          <div className="mt-1 text-sm">
            <span className="font-display font-semibold">
              M {resumo.porGenero["Masculino"] ?? 0}
            </span>
            <span className="text-faint"> · </span>
            <span className="font-display font-semibold text-accent2">
              BL {resumo.porGenero["Baby Look"] ?? 0}
            </span>

          </div>
        </div>
        <div className="tile p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-faint">Recebido por</div>
          <div className="mt-1 space-y-0.5 text-[11px] leading-tight text-faint">
            <div>
              Pix <span className="font-display text-luminous">{formatBRL(resumo.porPagamento["Pix"] ?? 0)}</span>
            </div>
            <div>
              Dinheiro{" "}
              <span className="font-display text-luminous">
                {formatBRL(resumo.porPagamento["Dinheiro"] ?? 0)}
              </span>
            </div>
            <div>
              Cartão{" "}
              <span className="font-display text-luminous">
                {formatBRL(
                  (resumo.porPagamento["Cartão de Débito"] ?? 0) +
                    (resumo.porPagamento["Cartão de Crédito"] ?? 0),
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
