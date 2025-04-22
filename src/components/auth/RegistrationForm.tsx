
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

interface RegistrationFormProps {
  onSuccess: () => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API
    console.log("Registration submitted:", registrationData);
    
    // Reset form
    setRegistrationData({
      name: "",
      email: "",
      password: "",
    });
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            placeholder="Seu nome completo"
            className="pl-10"
            value={registrationData.name}
            onChange={(e) =>
              setRegistrationData({ ...registrationData, name: e.target.value })
            }
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="Seu endereço de email"
            className="pl-10"
            value={registrationData.email}
            onChange={(e) =>
              setRegistrationData({ ...registrationData, email: e.target.value })
            }
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password"
            type="password"
            placeholder="Crie uma senha segura"
            className="pl-10"
            value={registrationData.password}
            onChange={(e) =>
              setRegistrationData({ ...registrationData, password: e.target.value })
            }
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" className="w-full">
          Solicitar acesso
        </Button>
      </DialogFooter>
    </form>
  );
}
