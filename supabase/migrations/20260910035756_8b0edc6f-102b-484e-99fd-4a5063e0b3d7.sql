ALTER VIEW public.estoque_status SET (security_invoker = true);

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
$$ LANGUAGE plpgsql SET search_path = public;