
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        {children}
      </main>
      <footer className="py-4 border-t text-center text-sm text-muted-foreground">
        <p>© 2025 Controle Financeiro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
