import { Routes, Route, Navigate } from "react-router-dom";
import { Login, Forgot, ResetPassword, Dashboard, NotFound } from "@/pages";
import { AuthProvider } from "@/context";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
<Routes>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="/login" element={<Login />} />
  <Route path="/forgot-password" element={<Forgot />} />
  <Route path="/reset-password" element={<ResetPassword />} />

  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/inventory" element={<Dashboard />} />
    <Route path="/loans" element={<Dashboard />} />
    <Route path="/notifications" element={<Dashboard />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
    </AuthProvider>
  );
}

export default App;
