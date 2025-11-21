import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Counties from "./pages/Counties";
import CountiesList from "./pages/CountiesList";
import CountyData from "./pages/CountyData";
import ThematicAreas from "./pages/ThematicAreas";
import AddThematicArea from "./pages/AddThematicArea";
import PublicPortal from "./pages/PublicPortal";
import Publications from "./pages/Publications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/counties" element={<Counties />} />
          <Route path="/counties-list" element={<CountiesList />} />
          <Route path="/county-data" element={<CountyData />} />
          <Route path="/thematic-areas" element={<ThematicAreas />} />
          <Route path="/thematic-areas/add" element={<AddThematicArea />} />
          <Route path="/indicators" element={<Index />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/public-portal" element={<PublicPortal />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
