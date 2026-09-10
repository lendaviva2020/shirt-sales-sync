import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useSalvarVenda } from "@/hooks/use-vendas";
import {
  FORMAS_PAGAMENTO,
  GENEROS,
  TAMANHOS,
  TAMANHOS_POR_GENERO,
  formatBRL,
  type Venda,
  type VendaInsert,
} from "@/lib/vendas";

const vendaSchema = z
  .object({
    nome_cliente: z
      .string()
      .trim()
      .min(1, { message: "Informe o nome do cliente" })
      .max(120, { message: "Nome muito longo" }),
    genero: z.enum(GENEROS),
    tamanho: z.enum(TAMANHOS),
    quantidade: z.coerce
      .number()
      .int({ message: "Quantidade deve ser um número inteiro" })
      .min(1, { message: "Quantidade deve ser no mínimo 1" }),
    valor_unitario: z.coerce.number().positive({ message: "Valor unitário deve ser maior que zero" }),
    pago: z.boolean(),
    forma_pagamento: z.enum(FORMAS_PAGAMENTO).nullable(),
    observacao: z.string().trim().max(500, { message: "Observação muito longa" }).nullable(),
  })
  .refine((data) => !data.pago || data.forma_pagamento !== null, {
    message: "Escolha a forma de pagamento",
    path: ["forma_pagamento"],
  });

interface FormState {
  nome_cliente: string;
  genero: string;
  tamanho: string;
  quantidade: string;
  valor_unitario: string;
  pago: boolean;
  forma_pagamento: string;
  observacao: string;
}

const estadoInicial: FormState = {
  nome_cliente: "",
  genero: "Baby Look",
  tamanho: "M",
  quantidade: "1",
  valor_unitario: "",
  pago: false,
  forma_pagamento: "",
  observacao: "",
};

interface VendaFormProps {
  aberto: boolean;
  vendaEmEdicao: Venda | null;
  onFechar: () => void;
}

export function VendaForm({ aberto, vendaEmEdicao, onFechar }: VendaFormProps) {
  const [form, setForm] = useState<FormState>(estadoInicial);
  const [erro, setErro] = useState<string | null>(null);
  const salvar = useSalvarVenda();

  useEffect(() => {
    if (!aberto) return;
    setErro(null);
    if (vendaEmEdicao) {
      setForm({
        nome_cliente: vendaEmEdicao.nome_cliente,
        genero: vendaEmEdicao.genero,
        tamanho: vendaEmEdicao.tamanho,
        quantidade: String(vendaEmEdicao.quantidade),
        valor_unitario: String(vendaEmEdicao.valor_unitario),
        pago: vendaEmEdicao.pago,
        forma_pagamento: vendaEmEdicao.forma_pagamento ?? "",
        observacao: vendaEmEdicao.observacao ?? "",
      });
    } else {
      setForm(estadoInicial);
    }
  }, [aberto, vendaEmEdicao]);

  if (!aberto) return null;

  const totalPrevisto =
    (Number(form.quantidade) || 0) * (Number(form.valor_unitario.replace(",", ".")) || 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = vendaSchema.safeParse({
      nome_cliente: form.nome_cliente,
      genero: form.genero,
      tamanho: form.tamanho,
      quantidade: form.quantidade,
      valor_unitario: form.valor_unitario.replace(",", "."),
      pago: form.pago,
      forma_pagamento: form.pago && form.forma_pagamento ? form.forma_pagamento : null,
      observacao: form.observacao ? form.observacao : null,
    });

    if (!parsed.success) {
      setErro(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }

    const values: VendaInsert = parsed.data;

    try {
      await salvar.mutateAsync({ id: vendaEmEdicao?.id, values });
      toast.success(vendaEmEdicao ? "Venda atualizada" : "Venda registrada");
      onFechar();
    } catch (error) {
      const bruta =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message ?? "")
          : "";
      const mensagem = bruta.includes("Estoque insuficiente")
        ? bruta.replace(/^.*?(Estoque insuficiente)/s, "$1")
        : "Não foi possível salvar. Verifique a conexão e tente de novo.";
      setErro(mensagem);
      toast.error(mensagem);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="glass max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-b-none p-4 pb-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {vendaEmEdicao ? "Editar venda" : "Nova venda"}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full border border-line bg-glass2 px-3 py-1 text-xs text-faint"
          >
            Fechar
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="nome" className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Nome do cliente
            </label>
            <input
              id="nome"
              className="field mt-1"
              placeholder="Ex.: Marina Alves"
              value={form.nome_cliente}
              maxLength={120}
              onChange={(e) => setForm({ ...form, nome_cliente: e.target.value })}
            />
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">Gênero</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {GENEROS.map((genero) => (
                <button
                  key={genero}
                  type="button"
                  onClick={() => setForm({ ...form, genero })}
                  className={`tile py-2.5 text-sm font-medium ${
                    form.genero === genero ? "text-accent2" : "text-faint"
                  }`}
                >
                  {genero}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">Tamanho</span>
            <div className="mt-1 grid grid-cols-6 gap-1.5">
              {TAMANHOS.map((tamanho) => (
                <button
                  key={tamanho}
                  type="button"
                  onClick={() => setForm({ ...form, tamanho })}
                  className={`tile py-2.5 text-sm font-semibold ${
                    form.tamanho === tamanho ? "text-accent2" : "text-faint"
                  }`}
                >
                  {tamanho}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="qtd" className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Quantidade
              </label>
              <input
                id="qtd"
                className="field mt-1"
                type="number"
                inputMode="numeric"
                min={1}
                value={form.quantidade}
                onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="valor" className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Valor unitário
              </label>
              <input
                id="valor"
                className="field mt-1"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={form.valor_unitario}
                onChange={(e) => setForm({ ...form, valor_unitario: e.target.value })}
              />
            </div>
          </div>

          <div className="tile flex items-center justify-between p-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-faint">Total</div>
              <div className="font-display text-xl font-semibold">{formatBRL(totalPrevisto)}</div>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  pago: !form.pago,
                  forma_pagamento: !form.pago ? form.forma_pagamento : "",
                })
              }
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                form.pago
                  ? "border-paid/40 bg-paid/15 text-paid"
                  : "border-pending/40 bg-pending/15 text-pending"
              }`}
            >
              {form.pago ? "Pago" : "Pendente"}
            </button>
          </div>

          {form.pago ? (
            <div>
              <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Forma de pagamento
              </span>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {FORMAS_PAGAMENTO.map((forma) => (
                  <button
                    key={forma}
                    type="button"
                    onClick={() => setForm({ ...form, forma_pagamento: forma })}
                    className={`tile px-2 py-2.5 text-xs font-medium ${
                      form.forma_pagamento === forma ? "text-accent2" : "text-faint"
                    }`}
                  >
                    {forma}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <label htmlFor="obs" className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Observação (opcional)
            </label>
            <textarea
              id="obs"
              className="field mt-1 min-h-[64px] resize-none"
              maxLength={500}
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            />
          </div>

          {erro ? <p className="text-sm text-pending">{erro}</p> : null}

          <button
            type="submit"
            disabled={salvar.isPending}
            className="w-full rounded-2xl bg-accent2 py-3.5 font-display text-base font-semibold text-obsidian disabled:opacity-60"
          >
            {salvar.isPending ? "Salvando…" : vendaEmEdicao ? "Salvar alterações" : "Registrar venda"}
          </button>
        </div>
      </form>
    </div>
  );
}
