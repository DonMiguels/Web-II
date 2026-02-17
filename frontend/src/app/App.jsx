import { Routes, Route } from "react-router-dom";
import { Login } from "@/pages";
import { Forgot } from "@/pages";
import { Dashboard } from "@/pages";
import { NotFound } from "@/pages";
import { AuthProvider } from "@/context";
import { ProtectedRoute } from "@/components";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<Forgot />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
