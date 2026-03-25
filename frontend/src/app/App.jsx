import { Routes, Route, Navigate } from "react-router-dom";
import { Login, Forgot, ResetPassword, Dashboard, NotFound } from "@/pages";
import { AuthProvider } from "@/context";
import { SidebarProvider } from "@/context";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Dashboard />} />
            <Route path="/loans" element={<Dashboard />} />
            <Route path="/reports" element={<Dashboard />} />
            <Route path="/notifications" element={<Dashboard />} />
            <Route
              path="/settings"
              element={<Navigate to="/settings/permissions" replace />}
            />
            <Route path="/settings/permissions" element={<Dashboard />} />
            <Route path="/settings/profiles" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
