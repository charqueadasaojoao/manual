import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RotaProtegida({ children }) {
  const { session, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-papel">
        <p className="text-marinho-suave font-corpo">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
