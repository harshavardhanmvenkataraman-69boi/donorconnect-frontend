import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isLoggedIn, logout as doLogout } from '../api/authUtils';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  const refresh = () => { setUser(getCurrentUser()); setLoggedIn(isLoggedIn()); };
  const logout = () => { doLogout(); setUser(null); setLoggedIn(false); };

  useEffect(() => { refresh(); }, []);

  return <AuthContext.Provider value={{ user, loggedIn, refresh, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
