import { Routes, Route } from "react-router-dom";
import { 
  Login, 
  Forgot, 
  ResetPassword, 
  Dashboard, 
  NotFound, 
  Reports 
} from "@/pages"; 

import { AuthProvider } from "@/context";
import { ProtectedRoute } from "@/components";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<Forgot />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
export default App;