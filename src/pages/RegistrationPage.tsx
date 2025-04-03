
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductServiceRegistration from "@/components/registration/ProductServiceRegistration";
import ClientRegistration from "@/components/registration/ClientRegistration";
import SellerRegistration from "@/components/registration/SellerRegistration";
import { useToast } from "@/hooks/use-toast";

export default function RegistrationPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div>
      <PageHeader 
        title="Cadastros" 
        description="Gerencie produtos, serviços, clientes e vendedores"
      />
      
      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Produtos/Serviços</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="sellers">Vendedores</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductServiceRegistration />
        </TabsContent>
        <TabsContent value="clients">
          <ClientRegistration />
        </TabsContent>
        <TabsContent value="sellers">
          <SellerRegistration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
