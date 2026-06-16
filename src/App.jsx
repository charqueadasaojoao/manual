import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import RotaProtegida from "./components/RotaProtegida";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Impressao from "./pages/Impressao";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <RotaProtegida>
                <Dashboard />
              </RotaProtegida>
            }
          />

          <Route
            path="/processo/:codigo"
            element={
              <RotaProtegida>
                <Dashboard />
              </RotaProtegida>
            }
          />

          <Route
            path="/admin"
            element={
              <RotaProtegida>
                <Admin />
              </RotaProtegida>
            }
          />

          <Route
            path="/imprimir"
            element={
              <RotaProtegida>
                <Impressao />
              </RotaProtegida>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
