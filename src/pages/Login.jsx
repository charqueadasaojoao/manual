import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { session, entrar } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    const { error } = await entrar(email.trim(), senha);

    setEnviando(false);

    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-marinho px-5">
      <div className="bg-papel w-full max-w-sm rounded border-t-[6px] border-dourado px-10 py-11">
        <p className="font-corpo text-xs uppercase tracking-[0.18em] text-dourado mb-2">
          Charqueada São João
        </p>
        <h1 className="font-display text-2xl mb-7 leading-tight">
          Acesso ao Manual de Processos
        </h1>

        {erro && (
          <div className="bg-[#fdeae4] border-l-[3px] border-dourado text-[#7a2c17] text-sm px-3 py-2.5 rounded mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-corpo text-xs uppercase tracking-wider text-marinho-suave mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-kraft rounded font-corpo text-sm bg-white focus:border-dourado focus:outline-none"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="senha" className="block font-corpo text-xs uppercase tracking-wider text-marinho-suave mb-1.5">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-kraft rounded font-corpo text-sm bg-white focus:border-dourado focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-marinho text-papel font-corpo font-semibold text-sm py-3 rounded hover:bg-marinho-suave disabled:opacity-60 transition-colors"
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
