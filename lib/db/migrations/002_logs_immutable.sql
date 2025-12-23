-- Trigger para bloquear UPDATE/DELETE em logs_acao
CREATE OR REPLACE FUNCTION prevent_logs_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Logs são imutáveis. Apenas INSERT é permitido.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_logs_update
  BEFORE UPDATE ON logs_acao
  FOR EACH ROW
  EXECUTE FUNCTION prevent_logs_modification();

CREATE TRIGGER prevent_logs_delete
  BEFORE DELETE ON logs_acao
  FOR EACH ROW
  EXECUTE FUNCTION prevent_logs_modification();

-- Comentário
COMMENT ON TABLE logs_acao IS 'Tabela de logs imutáveis. Apenas INSERT permitido.';

