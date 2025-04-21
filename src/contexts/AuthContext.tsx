
import React, { createContext, useContext, useState, useEffect } from "react";

// Define user roles
export type UserRole = "owner" | "admin" | "collaborator";

// Define user interface
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  approved: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PERMISSIONS = {
  // Owner permissions
  CREATE_ANY: "create_any",
  EDIT_ANY: "edit_any",
  DELETE_ANY: "delete_any",
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
  VIEW_REPORTS: "view_reports",
  CONFIGURE_PLATFORM: "configure_platform",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_PLANS: "manage_plans",
  
  // Admin permissions
  CREATE_USER: "create_user",
  CHANGE_USER_ROLE: "change_user_role",
  APPROVE_USER: "approve_user",
  VIEW_RECORDS: "view_records",
  EDIT_CONFIG: "edit_config",
  
  // Collaborator permissions
  CREATE_RECORD: "create_record",
  VIEW_OWN_RECORDS: "view_own_records",
};

// Define role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.CHANGE_USER_ROLE,
    PERMISSIONS.APPROVE_USER,
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.EDIT_CONFIG,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_RECORD,
    PERMISSIONS.VIEW_OWN_RECORDS,
  ],
  collaborator: [
    PERMISSIONS.CREATE_RECORD,
    PERMISSIONS.VIEW_OWN_RECORDS,
  ],
};

// Define a "login only" type for local comparison, including password
type AuthMockUser = User & { password: string };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check localStorage for existing user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    // Mock authentication - in a real app this would call an API
    // The id:1 is owner, id:2 is admin (approved=true)
    const MOCK_USERS: AuthMockUser[] = [
      { id: 1, name: "Admin", email: "admin@finq.com", password: "admin123", role: "owner", approved: true },
      { id: 2, name: "Gerente", email: "gerente@finq.com", password: "gerente123", role: "admin", approved: true },
      { id: 3, name: "Colaborador", email: "colaborador@finq.com", password: "colaborador123", role: "collaborator", approved: true },
      { id: 4, name: "Pendente", email: "pendente@finq.com", password: "pendente123", role: "collaborator", approved: false },
    ];
    
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      return { success: false, message: "E-mail ou senha incorretos." };
    }
    
    if (!foundUser.approved) {
      return { success: false, message: "Seu acesso ainda não foi aprovado." };
    }
    
    // Remove password from user object before saving/using it as a session
    const { password: _pw, ...userNoPassword } = foundUser;

    setUser(userNoPassword);
    localStorage.setItem("currentUser", JSON.stringify(userNoPassword));
    
    return { success: true };
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };
  
  const hasPermission = (permission: string) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole];
    return userPermissions.includes(permission);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
