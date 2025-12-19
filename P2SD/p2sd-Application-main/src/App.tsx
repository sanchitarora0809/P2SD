import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import FloatingChatbot from "./components/Chatbot/FloatingChatbot";
/*import Dashboard from "./pages/Dashboard";*/
import Graphs from "./pages/Graphs";
import ThresholdAlerts from "./pages/ThresholdAlerts";
import Recipients from "./pages/Recipients";
import NotFound from "./pages/NotFound";
import OperationDashboard from "./pages/OperationDashboard";
import OperationGraph from "./pages/OperationGraph";
import OperationAlerts from "./pages/OperationAlerts";  

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
           {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/graphs" element={<Graphs />} />
            <Route path="/alerts" element={<ThresholdAlerts />} />
            <Route path="/operation-dashboard" element={<OperationDashboard />} />
            <Route path="/operation-graph" element={<OperationGraph />} />  
            <Route path="/operation-alerts" element={<OperationAlerts />} />
            <Route path="/recipients" element={<Recipients />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingChatbot />
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
