import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Register";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Settingsf from "./pages/Settingsf";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import EngineerDashboard from "./pages/EngineerDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/Register" element={<Index />} />
          <Route path="/Users" element={<Users />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/engineer" element={<EngineerDashboard />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/Settingsf" element={<Settingsf />} />
         
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
