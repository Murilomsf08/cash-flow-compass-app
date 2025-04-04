
import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ResponsiveTable({ children, className, ...props }: ResponsiveTableProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        "w-full", 
        isMobile ? "overflow-x-auto -mx-2 px-2 pb-2" : "", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
