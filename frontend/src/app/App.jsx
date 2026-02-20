import { Routes, Route } from "react-router-dom";
import { Login } from "@/pages";
import { Forgot } from "@/pages";
import { ResetPassword } from "@/pages";
import { Dashboard } from "@/pages";
import { NotFound } from "@/pages";
import { AuthProvider } from "@/context";
import { ProtectedRoute } from "@/components";

function App() {
  return (
    <AuthProvider>
      <Routes>
<<<<<<< HEAD
        <Route path='/' element={<Login />}/>
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<Forgot />} />
        <Route path='/reset-password' element={<ResetPassword />} />
=======
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password" element={<ResetPassword />} />
>>>>>>> 8481540b0b69838fc28ea963aec7977200406fcf

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
export default App;
