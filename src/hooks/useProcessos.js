import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Centraliza acesso aos dados de departamentos e processos.
 * Usado pelo Dashboard, pelo Admin e pela página de Impressão.
 */
export function useProcessos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const [{ data: deptos, error: e1 }, { data: procs, error: e2 }] = await Promise.all([
      supabase.from("departamentos").select("*").order("ordem"),
      supabase.from("processos").select("*").order("ordem"),
    ]);

    if (e1 || e2) {
      setErro((e1 || e2).message);
      setCarregando(false);
      return;
    }

    setDepartamentos(deptos || []);
    setProcessos(procs || []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function criarProcesso(dados) {
    const { error } = await supabase.from("processos").insert(dados);
    if (!error) await carregar();
    return { error };
  }

  async function atualizarProcesso(id, dados) {
    const { error } = await supabase.from("processos").update(dados).eq("id", id);
    if (!error) await carregar();
    return { error };
  }

  async function excluirProcesso(id) {
    const { error } = await supabase.from("processos").delete().eq("id", id);
    if (!error) await carregar();
    return { error };
  }

  return {
    departamentos,
    processos,
    carregando,
    erro,
    recarregar: carregar,
    criarProcesso,
    atualizarProcesso,
    excluirProcesso,
  };
}
