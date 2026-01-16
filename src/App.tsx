import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Battle from "./pages/Battle";
import Quests from "./pages/Quests";
import Vitality from "./pages/Vitality";
import Stats from "./pages/Stats";
import Shop from "./pages/Shop";
import Communities from "./pages/Communities";
import CommunityDetails from "./pages/CommunityDetails";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Study from "./pages/Study";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/vitality" element={<Vitality />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/community/:id" element={<CommunityDetails />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/study" element={<Study />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
