
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DollarSign, LogOut, Menu, User, Users } from "lucide-react";
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
import { useAuth, PERMISSIONS } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout, hasPermission } = useAuth();
  const { toast } = useToast();
  
  const getLinks = () => {
    const baseLinks = [
      { href: "/", label: "Dashboard" },
      { href: "/servicos", label: "Serviços" },
      { href: "/despesas", label: "Despesas" },
      { href: "/cadastros", label: "Cadastros" },
    ];
    
    // Add admin links if user has permissions
    if (hasPermission(PERMISSIONS.MANAGE_USERS)) {
      baseLinks.push({ href: "/usuarios", label: "Usuários" });
    }
    
    return baseLinks;
  };
  
  const links = getLinks();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema com sucesso.",
    });
  };

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
        
        {isAuthenticated && (
          <div className="mt-6 mb-8 flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">
              {user?.role === "owner" 
                ? "Proprietário" 
                : user?.role === "admin" 
                ? "Administrador" 
                : "Colaborador"}
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-4">
          {isAuthenticated ? (
            <>
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
              <Button variant="outline" className="mt-4" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <SheetClose asChild>
              <Link
                to="/login"
                className="flex items-center py-2 text-base font-medium transition-colors hover:text-primary"
              >
                Login
              </Link>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop navigation
  const DesktopNavigation = () => (
    <nav className="ml-auto flex gap-4 md:gap-6">
      {isAuthenticated ? (
        <>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.role === "owner" 
                      ? "Proprietário" 
                      : user?.role === "admin" 
                      ? "Administrador" 
                      : "Colaborador"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hasPermission(PERMISSIONS.MANAGE_USERS) && (
                <DropdownMenuItem asChild>
                  <Link to="/usuarios" className="flex w-full cursor-pointer items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Gerenciar Usuários</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Link
          to="/login"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Login
        </Link>
      )}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to={isAuthenticated ? "/" : "/login"} className="flex items-center gap-2 font-bold text-xl text-primary">
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
