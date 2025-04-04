
import { Navbar } from "./Navbar";
import { ScrollArea } from "./ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

export function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <ScrollArea className="flex-1 w-full">
        <main className={`mx-auto py-4 px-2 ${isMobile ? 'max-w-full' : 'container px-4 md:px-6'}`}>
          {children}
        </main>
        <footer className="py-4 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 Controle Financeiro. Todos os direitos reservados.</p>
        </footer>
      </ScrollArea>
    </div>
  );
}
