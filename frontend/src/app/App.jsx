import { Routes, Route, Navigate } from "react-router-dom"; 
import { Login, Forgot, Dashboard, NotFound, Reset } from "@/pages"; 
import { AuthProvider } from "@/context";
import { ProtectedRoute } from "@/components";

function App() {

  return (
    <AuthProvider>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password" element={<Reset />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
  </AuthProvider>
  );
}
export default App;