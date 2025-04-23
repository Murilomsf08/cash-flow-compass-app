
import { Button } from "@/components/ui/button";
import { Check, Clock, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { EXPENSE_STATUS } from "@/utils/expenseUtils";
import { useToast } from "@/hooks/use-toast";

interface StatusDropdownProps {
  expense: any;
  onStatusChange: (id: number, newStatus: string) => void;
}

export function StatusDropdown({ expense, onStatusChange }: StatusDropdownProps) {
  const { toast } = useToast();
  
  const handleStatusChange = (newStatus: string) => {
    try {
      onStatusChange(expense.id, newStatus);
    } catch (error) {
      console.error("Erro ao mudar status:", error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status da despesa.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={
            expense.status === EXPENSE_STATUS.PAGO
              ? "border-green-600 text-green-600 px-2"
              : expense.status === EXPENSE_STATUS.PENDENTE
              ? "border-amber-500 text-amber-500 px-2"
              : "border-red-600 text-red-600 px-2"
          }
        >
          {expense.status}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-50 bg-white">
        <DropdownMenuItem onClick={() => handleStatusChange(EXPENSE_STATUS.PAGO)}>
          <Check className="w-4 h-4 mr-2 text-green-500" /> Pago
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(EXPENSE_STATUS.PENDENTE)}>
          <Clock className="w-4 h-4 mr-2 text-amber-500" /> Pendente
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(EXPENSE_STATUS.CANCELADO)}>
          <X className="w-4 h-4 mr-2 text-red-500" /> Cancelado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
