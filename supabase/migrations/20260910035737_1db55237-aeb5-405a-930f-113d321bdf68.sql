-- 1. Remover as regras antigas antes de normalizar os dados
ALTER TABLE public.vendas DROP CONSTRAINT IF EXISTS vendas_genero_check;
ALTER TABLE public.vendas DROP CONSTRAINT IF EXISTS vendas_tamanho_check;

-- 2. Normalizar dados antigos para as novas regras de gênero/tamanho
UPDATE public.vendas SET genero = 'Baby Look' WHERE genero = 'Feminino';
UPDATE public.vendas SET tamanho = 'P' WHERE tamanho = 'PP';
UPDATE public.vendas SET tamanho = 'GG' WHERE tamanho = 'XG';

-- 3. Nova regra de validação de gênero/tamanho da tabela vendas
ALTER TABLE public.vendas ADD CONSTRAINT vendas_genero_tamanho_check CHECK (
  (genero = 'Masculino' AND tamanho IN ('P','M','G','GG','G1','G2','G3'))
  OR (genero = 'Baby Look' AND tamanho IN ('P','M','G','GG'))
);

-- 3. Criar a tabela de estoque
CREATE TABLE public.estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  genero TEXT NOT NULL,
  tamanho TEXT NOT NULL,
  quantidade_inicial INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_inicial >= 0),
  CONSTRAINT estoque_genero_tamanho_check CHECK (
    (genero = 'Masculino' AND tamanho IN ('P','M','G','GG','G1','G2','G3'))
    OR (genero = 'Baby Look' AND tamanho IN ('P','M','G','GG'))
  ),
  CONSTRAINT estoque_genero_tamanho_key UNIQUE (genero, tamanho)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.estoque TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estoque TO authenticated;
GRANT ALL ON public.estoque TO service_role;

ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso publico ao estoque do evento" ON public.estoque
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.estoque REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque;

INSERT INTO public.estoque (genero, tamanho, quantidade_inicial) VALUES
  ('Masculino','P',0), ('Masculino','M',0), ('Masculino','G',0), ('Masculino','GG',0),
  ('Masculino','G1',0), ('Masculino','G2',0), ('Masculino','G3',0),
  ('Baby Look','P',0), ('Baby Look','M',0), ('Baby Look','G',0), ('Baby Look','GG',0)
ON CONFLICT (genero, tamanho) DO NOTHING;

-- 4. View que já junta estoque + vendas, calculando vendido e restante
CREATE VIEW public.estoque_status AS
SELECT
  e.id,
  e.genero,
  e.tamanho,
  e.quantidade_inicial,
  COALESCE(v.vendido, 0) AS vendido,
  e.quantidade_inicial - COALESCE(v.vendido, 0) AS restante
FROM public.estoque e
LEFT JOIN (
  SELECT genero, tamanho, SUM(quantidade) AS vendido
  FROM public.vendas
  GROUP BY genero, tamanho
) v ON v.genero = e.genero AND v.tamanho = e.tamanho;

GRANT SELECT ON public.estoque_status TO anon, authenticated;

-- 5. Trigger que bloqueia uma venda se a quantidade pedida for maior que o estoque restante
CREATE OR REPLACE FUNCTION public.verificar_estoque_disponivel()
RETURNS TRIGGER AS $$
DECLARE
  estoque_inicial INTEGER;
  vendido_atual INTEGER;
  restante INTEGER;
BEGIN
  SELECT quantidade_inicial INTO estoque_inicial
  FROM public.estoque
  WHERE genero = NEW.genero AND tamanho = NEW.tamanho;

  IF estoque_inicial IS NULL THEN
    estoque_inicial := 0;
  END IF;

  SELECT COALESCE(SUM(quantidade), 0) INTO vendido_atual
  FROM public.vendas
  WHERE genero = NEW.genero
    AND tamanho = NEW.tamanho
    AND id IS DISTINCT FROM NEW.id;

  restante := estoque_inicial - vendido_atual;

  IF NEW.quantidade > restante THEN
    RAISE EXCEPTION 'Estoque insuficiente para % - %: restam % unidade(s)', NEW.genero, NEW.tamanho, restante;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verificar_estoque
BEFORE INSERT OR UPDATE ON public.vendas
FOR EACH ROW
EXECUTE FUNCTION public.verificar_estoque_disponivel();