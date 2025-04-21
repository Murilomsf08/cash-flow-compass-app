
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DollarSign, Menu } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/servicos", label: "Serviços" },
    { href: "/despesas", label: "Despesas" },
    { href: "/cadastros", label: "Cadastros" },
  ];

  // Mobile navigation using Sheet component
  const MobileNavigation = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="p-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-bold text-xl text-primary">
            <DollarSign className="h-6 w-6" />
            <span>FinQ</span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-4">
          {links.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                to={link.href}
                className={cn(
                  "flex items-center py-2 text-base font-medium transition-colors hover:text-primary",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop navigation
  const DesktopNavigation = () => (
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
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <DollarSign className="h-6 w-6" />
          <span className="hidden md:inline">FinQ</span>
          <span className="md:hidden">FinQ</span>
        </Link>
        
        {isMobile ? (
          <div className="ml-auto">
            <MobileNavigation />
          </div>
        ) : (
          <DesktopNavigation />
        )}
      </div>
    </header>
  );
}
