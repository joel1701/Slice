import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// ── create the context ────────────────────────────────────────────────────────
// think of AuthContext as an empty container — we fill it with the Provider below
const AuthContext = createContext(null);

// ── PROVIDER COMPONENT ────────────────────────────────────────────────────────
// This component wraps your entire app (in main.jsx)
// Any component inside it can access the auth state via useAuth()
export const AuthProvider = ({ children }) => {
  // user = the currently logged in user object, or null if not logged in
  const [user, setUser] = useState(null);

  // loading = true while we're checking localStorage on first app load
  // we need this so the app doesn't flash the login page before checking the token
  const [loading, setLoading] = useState(true);

  // ── CHECK FOR EXISTING SESSION ON APP LOAD ──────────────────────────────────
  // This useEffect runs once when the app first loads
  // It checks if there's a valid token in localStorage from a previous session
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // decode the token to read its contents
        // jwtDecode does NOT verify the signature — it just reads the payload
        // actual verification happens on the server for every API call
        const decoded = jwtDecode(token);

        // check if the token has expired
        // decoded.exp is the expiry timestamp in seconds
        // Date.now() / 1000 gives current time in seconds
        const isExpired = decoded.exp < Date.now() / 1000;

        if (isExpired) {
          // token is expired — clean up and treat as logged out
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          // token is valid — restore the user from localStorage
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        // if decoding fails, the token is malformed — clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }

    // done checking — allow the app to render
    setLoading(false);
  }, []); // empty array = run once on mount only

  // ── LOGIN FUNCTION ────────────────────────────────────────────────────────────
  // Called after a successful register or login API call
  // Saves the token and user to both state and localStorage
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // ── LOGOUT FUNCTION ───────────────────────────────────────────────────────────
  // Clears everything — state and localStorage
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // ── PROVIDE VALUES TO ALL CHILD COMPONENTS ────────────────────────────────────
  // Any component that calls useAuth() gets access to all of these
  const value = {
    user,         // the current user object (or null)
    login,        // call this after successful login/register
    logout,       // call this when user clicks logout
    isLoggedIn: !!user, // shorthand boolean: true if user exists
    loading,      // true while checking localStorage on first load
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ── CUSTOM HOOK ────────────────────────────────────────────────────────────────
// Instead of importing useContext and AuthContext in every component,
// components just call useAuth() — much cleaner
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // this error fires if you accidentally call useAuth() outside of AuthProvider
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};