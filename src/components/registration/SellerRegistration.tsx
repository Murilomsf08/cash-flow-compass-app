
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSellers } from "@/hooks/useSellers";
import { SellerForm } from "./seller/SellerForm";
import { SellerSearch } from "./seller/SellerSearch";
import { SellersTable } from "./seller/SellersTable";

export default function SellerRegistration() {
  const { toast } = useToast();
  const { 
    sellers,
    isLoading,
    error,
    refetch,
    addSeller,
    updateSeller,
    deleteSeller
  } = useSellers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSellerId, setCurrentSellerId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    commission: ""
  });

  const filteredSellers = sellers?.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (seller: any) => {
    setFormData({
      name: seller.name,
      email: seller.email,
      phone: seller.phone || "",
      commission: seller.commission.toString()
    });
    setCurrentSellerId(seller.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSeller(id);
      toast({
        title: "Vendedor removido",
        description: "O vendedor foi removido com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao remover o vendedor.",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = async (formData: any) => {
    const commission = parseFloat(formData.commission || "0");
    
    if (isEditMode && currentSellerId !== null) {
      await updateSeller({
        id: currentSellerId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        commission: commission
      });
      
      toast({
        title: "Vendedor atualizado",
        description: "As informações do vendedor foram atualizadas com sucesso."
      });
    } else {
      await addSeller({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        commission: commission
      });
      
      toast({
        title: "Vendedor registrado",
        description: "O vendedor foi adicionado com sucesso."
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      commission: ""
    });
    setIsEditMode(false);
    setCurrentSellerId(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <SellerSearch value={searchTerm} onChange={setSearchTerm} />
        <Button onClick={() => {
          resetForm();
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Vendedor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">Carregando vendedores...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              Erro ao carregar dados. Por favor, tente novamente.
              <Button 
                variant="outline" 
                className="mt-2 mx-auto block"
                onClick={() => refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : (
            <SellersTable
              sellers={filteredSellers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
      }}>
        <SellerForm
          initialData={formData}
          isEditMode={isEditMode}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
        />
      </Dialog>
    </div>
  );
}
