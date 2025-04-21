
import { Navbar } from "./Navbar";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // If user is not authenticated, we won't render layout
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 overflow-x-hidden">
        {children}
      </main>
      <footer className="py-4 border-t text-center text-sm text-muted-foreground">
        <p>© 2025 FinQ. Todos os direitos reservados.</p>
      </footer>
      <Toaster />
    </div>
  );
}
