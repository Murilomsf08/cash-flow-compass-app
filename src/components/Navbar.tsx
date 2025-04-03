
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  
  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/servicos", label: "Serviços" },
    { href: "/despesas", label: "Despesas" },
    { href: "/cadastros", label: "Cadastros" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <DollarSign className="h-6 w-6" />
          <span>FinanceControl</span>
        </Link>
        <nav className="ml-auto flex gap-4 md:gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
