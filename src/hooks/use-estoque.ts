import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type EstoqueStatus = Database["public"]["Views"]["estoque_status"]["Row"];

const QUERY_KEY = ["estoque_status"] as const;

async function fetchEstoque(): Promise<EstoqueStatus[]> {
  const { data, error } = await supabase
    .from("estoque_status")
    .select("*")
    .order("genero", { ascending: true })
    .order("tamanho", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function useEstoque() {
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: QUERY_KEY, queryFn: fetchEstoque });

  useEffect(() => {
    const invalidar = () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    };

    const channel = supabase
      .channel(`estoque-realtime-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "estoque" }, invalidar)
      .on("postgres_changes", { event: "*", schema: "public", table: "vendas" }, invalidar)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useAtualizarEstoqueInicial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      genero,
      tamanho,
      quantidadeInicial,
    }: {
      genero: string;
      tamanho: string;
      quantidadeInicial: number;
    }) => {
      const { error } = await supabase
        .from("estoque")
        .update({ quantidade_inicial: quantidadeInicial })
        .eq("genero", genero)
        .eq("tamanho", tamanho);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
