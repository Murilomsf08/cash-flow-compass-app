
import { Navbar } from "./Navbar";
import { ScrollArea } from "./ui/scroll-area";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <ScrollArea className="flex-1">
        <main className="container mx-auto py-4 md:py-6 px-2 md:px-6">
          {children}
        </main>
        <footer className="py-4 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 Controle Financeiro. Todos os direitos reservados.</p>
        </footer>
      </ScrollArea>
    </div>
  );
}
