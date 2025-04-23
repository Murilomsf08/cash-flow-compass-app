
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MOCK_EXPENSE_CATEGORIES, EXPENSE_STATUS } from "@/utils/expenseUtils";

interface ExpenseFormProps {
  onSubmit: (expense: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

export function ExpenseForm({ onSubmit, initialData, isEdit = false }: ExpenseFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [category, setCategory] = useState(initialData?.category || MOCK_EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState(initialData?.description || "");
  const [value, setValue] = useState(initialData?.value?.toString() || "");
  const [status, setStatus] = useState(initialData?.status || EXPENSE_STATUS.PENDENTE);
  const [isParceled, setIsParceled] = useState(initialData?.paymentType === "Parcelado");
  const [installments, setInstallments] = useState<number>(
    initialData?.totalInstallments || 1
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !category || !description || !value || !status) {
      return;
    }

    onSubmit({
      date: selectedDate.toISOString(),
      category,
      description,
      value: parseFloat(value),
      status,
      paymentType: isParceled ? "Parcelado" : "À Vista",
      ...(isParceled && installments > 1 && {
        installments,
      }),
      ...(initialData?.id && { id: initialData.id }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="date" className="text-right">
          Data
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[180px] pl-3 text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              {selectedDate ? (
                format(selectedDate, "PP", { locale: ptBR })
              ) : (
                <span>Selecione a data</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">
          Categoria
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Descrição
        </Label>
        <Input
          id="description"
          className="col-span-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="value" className="text-right">
          Valor
        </Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          min="0"
          className="col-span-3"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      {!isEdit && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Forma de Pagamento</Label>
          <RadioGroup
            className="col-span-2 flex flex-row gap-4"
            value={isParceled ? "parcelado" : "avista"}
            onValueChange={(v) => setIsParceled(v === "parcelado")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="avista" id="avista" />
              <Label htmlFor="avista">À Vista</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="parcelado" id="parcelado" />
              <Label htmlFor="parcelado">Parcelado</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EXPENSE_STATUS.PAGO}>Pago</SelectItem>
            <SelectItem value={EXPENSE_STATUS.PENDENTE}>Pendente</SelectItem>
            <SelectItem value={EXPENSE_STATUS.CANCELADO}>Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isEdit && isParceled && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="installments" className="text-right">
            Nº Parcelas
          </Label>
          <Input
            id="installments"
            type="number"
            min="2"
            max="36"
            className="col-span-3"
            value={installments}
            onChange={(e) => setInstallments(parseInt(e.target.value) || 2)}
          />
        </div>
      )}

      {isParceled && installments > 1 && value && (
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="text-right text-sm text-muted-foreground">
            Valor por parcela:
          </div>
          <div className="col-span-3">
            <strong>
              R$ {(parseFloat(value) / installments).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit">
          {isEdit ? "Salvar alterações" : "Adicionar despesa"}
        </Button>
      </div>
    </form>
  );
}
