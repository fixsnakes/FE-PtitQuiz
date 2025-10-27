import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const storedUser = localStorage.getItem("eduquiz_user");
  const initialUser = storedUser ? JSON.parse(storedUser) : null; 

  const [user, setUser] = useState(initialUser); 
  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    setUser(userData); 
    localStorage.setItem("eduquiz_user", JSON.stringify(userData)); 
  };

  const logout = () => {
    setUser(null); 
    localStorage.removeItem("eduquiz_user"); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
