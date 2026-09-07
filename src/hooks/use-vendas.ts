import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Venda, VendaInsert } from "@/lib/vendas";

const QUERY_KEY = ["vendas"] as const;

async function fetchVendas(): Promise<Venda[]> {
  const { data, error } = await supabase
    .from("vendas")
    .select("*")
    .order("data_hora", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function useVendas() {
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: QUERY_KEY, queryFn: fetchVendas });

  useEffect(() => {
    const channel = supabase
      .channel("vendas-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendas" }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useSalvarVenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: VendaInsert }) => {
      if (id) {
        const { error } = await supabase.from("vendas").update(values).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("vendas").insert(values);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useExcluirVenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
