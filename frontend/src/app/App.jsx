import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "../pages/login/login";
import { Forgot } from "../pages/forgot/forgot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<Forgot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
