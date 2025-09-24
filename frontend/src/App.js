import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard"; // ✅ importe ton Dashboard
import Contracts from "./pages/Contracts";
import DashboardLayout from "./components/DashboardLayout";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route
  path="/dashboard/*"
  element={
    <PrivateRoute>
      <DashboardLayout />
    </PrivateRoute>
  }
>
  <Route index element={<Dashboard />} />
  <Route path="clients" element={<Clients />} />
  {/* 📌 Route contrats */}
  <Route path="contracts" element={<Contracts />} />
</Route>

      </Routes>
    </BrowserRouter>
  );
}
