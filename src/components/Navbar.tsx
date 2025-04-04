
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DollarSign, Menu, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/servicos", label: "Serviços" },
    { href: "/despesas", label: "Despesas" },
    { href: "/cadastros", label: "Cadastros" },
  ];

  const NavLinks = () => (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          onClick={() => setMobileMenuOpen(false)}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary py-2",
            location.pathname === link.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg md:text-xl text-primary">
          <DollarSign className="h-5 w-5 md:h-6 md:w-6" />
          <span className="truncate">FinanceControl</span>
        </Link>
        
        {isMobile ? (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="ml-auto">
              <button className="p-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-6 pt-6">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="ml-auto flex gap-4 md:gap-6">
            <NavLinks />
          </nav>
        )}
      </div>
    </header>
  );
}
