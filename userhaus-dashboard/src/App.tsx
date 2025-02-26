import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Index from "./pages/Index";
import FarmSelection from "./pages/Engineer/FarmSelection";
import FarmDashboard from "./pages/Engineer/FarmDashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import RobotSelection from "./pages/Engineer/RobotSelection";
import Farmer from "./pages/Farmer/Farmer";
import Layout from "@/components/layout/Layout"; // ✅ Ensure this file exists
import ProtectedRoute from "./pages/ProtectedRoute"; // ✅ Ensure this exists

const queryClient = new QueryClient();

const App = () => {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true"; // ✅ Convert to boolean

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes (Accessible to Everyone) */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes (Inside Layout) */}
            {isLoggedIn ? (
              <Route element={<Layout />}>
                <Route element={<ProtectedRoute allowedRoles={["engineer"]} />}>
                <Route path="/farm-selection" element={<FarmSelection />} />
                <Route path="/dashboard/:farmId" element={<FarmDashboard />} />
                <Route path="/engineer" element={<RobotSelection />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={["farmer"]} />}>
                <Route path="/farmer" element={<Farmer />} />
                </Route>
             
                
                <Route path="*" element={<NotFound />} />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
