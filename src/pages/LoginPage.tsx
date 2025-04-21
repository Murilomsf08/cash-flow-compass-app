
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DollarSign, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import RegistrationForm from "@/components/auth/RegistrationForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao Sistema FinQ!",
      });
      navigate("/");
    } else {
      toast({
        title: "Erro de autenticação",
        description: result.message || "E-mail ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = () => {
    setIsRegisterOpen(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegistrationSuccess(true);
  };

  const closeRegistrationDialog = () => {
    setIsRegisterOpen(false);
    setIsRegistrationSuccess(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-2">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">FinQ</CardTitle>
          <CardDescription className="text-center">
            Faça login para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Seu endereço de email cadastrado"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              ACESSAR
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={handleRegister}>
            Criar cadastro
          </Button>
        </CardFooter>
      </Card>

      {/* Registration Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={closeRegistrationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar cadastro</DialogTitle>
            <DialogDescription>
              {isRegistrationSuccess
                ? "Seu cadastro foi enviado. Aguarde a liberação de acesso por um administrador."
                : "Preencha os dados abaixo para solicitar acesso."}
            </DialogDescription>
          </DialogHeader>
          
          {!isRegistrationSuccess ? (
            <RegistrationForm onSuccess={handleRegistrationSuccess} />
          ) : (
            <DialogFooter>
              <Button onClick={closeRegistrationDialog} className="w-full">
                Fechar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

