import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { GET_ME } from '../lib/queries';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  // Add other user fields as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const client = useApolloClient();
  const { enqueueSnackbar } = useSnackbar();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await client.query({
          query: GET_ME,
          fetchPolicy: 'network-only',
        });
        
        if (data?.me) {
          setUser(data.me);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        // Clear any invalid tokens
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [client]);

  const login = async (token: string) => {
    try {
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Fetch user data
      const { data } = await client.query({
        query: GET_ME,
        fetchPolicy: 'network-only',
      });
      
      if (data?.me) {
        setUser(data.me);
        enqueueSnackbar('Successfully logged in', { variant: 'success' });
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear Apollo cache
      await client.clearStore();
      
      // Clear user data
      setUser(null);
      
      // Remove token
      localStorage.removeItem('token');
      
      // Redirect to login page
      router.push('/login');
      
      enqueueSnackbar('Successfully logged out', { variant: 'success' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
