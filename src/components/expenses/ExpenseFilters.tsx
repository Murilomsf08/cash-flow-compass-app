
import { Check, Clock, Filter, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_EXPENSE_CATEGORIES, EXPENSE_STATUS } from "@/utils/expenseUtils";

interface ExpenseFiltersProps {
  dateRange: { from: Date; to: Date | undefined };
  onDateRangeChange: (range: { from: Date; to: Date | undefined }) => void;
  categoryFilter?: string;
  onCategoryFilterChange: (category: string | undefined) => void;
  descriptionFilter: string;
  onDescriptionFilterChange: (description: string) => void;
  statusFilter?: string;
  onStatusFilterChange: (status: string | undefined) => void;
}

export function ExpenseFilters({
  dateRange,
  onDateRangeChange,
  categoryFilter,
  onCategoryFilterChange,
  descriptionFilter,
  onDescriptionFilterChange,
  statusFilter,
  onStatusFilterChange,
}: ExpenseFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Período</Label>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="categoryFilter">Categoria</Label>
            <Select
              value={categoryFilter}
              onValueChange={onCategoryFilterChange}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>Todas as categorias</SelectItem>
                {MOCK_EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="descriptionFilter">Descrição</Label>
            <Input
              id="descriptionFilter"
              placeholder="Buscar descrição..."
              className="mt-1"
              value={descriptionFilter}
              onChange={(e) => onDescriptionFilterChange(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="statusFilter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={onStatusFilterChange}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>Todos os status</SelectItem>
                <SelectItem value={EXPENSE_STATUS.PAGO}>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" /> Pago
                  </div>
                </SelectItem>
                <SelectItem value={EXPENSE_STATUS.PENDENTE}>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-amber-500 mr-2" /> Pendente
                  </div>
                </SelectItem>
                <SelectItem value={EXPENSE_STATUS.CANCELADO}>
                  <div className="flex items-center">
                    <X className="h-4 w-4 text-red-500 mr-2" /> Cancelado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
