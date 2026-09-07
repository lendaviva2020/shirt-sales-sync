CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_cliente TEXT NOT NULL,
  genero TEXT NOT NULL CHECK (genero IN ('Masculino','Feminino')),
  tamanho TEXT NOT NULL CHECK (tamanho IN ('PP','P','M','G','GG','XG')),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  valor_unitario NUMERIC(10,2) NOT NULL CHECK (valor_unitario > 0),
  valor_total NUMERIC(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  pago BOOLEAN NOT NULL DEFAULT false,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('Dinheiro','Pix','Cartão de Débito','Cartão de Crédito')),
  observacao TEXT,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT vendas_pagamento_obrigatorio CHECK (NOT pago OR forma_pagamento IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendas TO authenticated;
GRANT ALL ON public.vendas TO service_role;

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso publico as vendas do evento" ON public.vendas
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX vendas_data_hora_idx ON public.vendas (data_hora DESC);

ALTER TABLE public.vendas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;