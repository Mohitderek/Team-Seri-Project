import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "recruiter";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("hireblind_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, _password: string) => {
    // Mock login - in production, this would call Supabase auth
    const mockUser: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      role: email.includes("admin") ? "admin" : "recruiter",
    };
    setUser(mockUser);
    localStorage.setItem("hireblind_user", JSON.stringify(mockUser));
  };

  const signup = async (email: string, _password: string, name: string, role: UserRole) => {
    const mockUser: User = { id: crypto.randomUUID(), email, name, role };
    setUser(mockUser);
    localStorage.setItem("hireblind_user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hireblind_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
