import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "../components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Simple NotFound component
function NotFound() {
  return <div>404 - Not Found</div>;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* <TooltipProvider> */}
      <Toaster />
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    {/* </TooltipProvider> */}
  </QueryClientProvider>
);

export default App;

// Remove the duplicate Toaster component definition from here.