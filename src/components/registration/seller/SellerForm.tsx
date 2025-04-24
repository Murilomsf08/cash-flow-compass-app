
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface SellerFormData {
  name: string;
  email: string;
  phone: string;
  commission: string;
}

interface SellerFormProps {
  initialData?: SellerFormData;
  isEditMode: boolean;
  onSubmit: (data: SellerFormData) => Promise<void>;
  onCancel: () => void;
}

export function SellerForm({ initialData, isEditMode, onSubmit, onCancel }: SellerFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SellerFormData>({
    name: "",
    email: "",
    phone: "",
    commission: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Form validation
    if (!formData.name || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    // Validate commission
    const commission = parseFloat(formData.commission || "0");
    if (isNaN(commission) || commission < 0 || commission > 100) {
      toast({
        title: "Comissão inválida",
        description: "A comissão deve ser um número entre 0 e 100.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o vendedor.",
        variant: "destructive"
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? "Editar Vendedor" : "Adicionar Vendedor"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="commission">Comissão (%)</Label>
          <Input
            id="commission"
            name="commission"
            type="number"
            min="0"
            max="100"
            value={formData.commission}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit}>
          {isEditMode ? "Atualizar" : "Salvar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
