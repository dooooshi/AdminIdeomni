'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthContextType,
  AuthState,
  AuthUserType,
  AdminLoginRequest,
  UserLoginRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  AdminUser,
  RegularUser,
} from './types';
import authService from './auth-service';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  userType: null,
  user: null,
  tokens: null,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { user: AdminUser | RegularUser; userType: AuthUserType } }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: AdminUser | RegularUser };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        userType: action.payload.userType,
        tokens: {
          accessToken: authService.getAccessToken() || '',
          refreshToken: '', // We don't expose refresh token
        },
        error: null,
      };
    case 'SET_UNAUTHENTICATED':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        userType: null,
        tokens: null,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          const userType = authService.getCurrentUserType();
          
          if (user && userType) {
            dispatch({
              type: 'SET_AUTHENTICATED',
              payload: { user, userType },
            });
          } else {
            dispatch({ type: 'SET_UNAUTHENTICATED' });
          }
        } else {
          dispatch({ type: 'SET_UNAUTHENTICATED' });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_UNAUTHENTICATED' });
      }
    };

    initializeAuth();
  }, []);

  // Listen for session expiration events from HTTP interceptor
  useEffect(() => {
    const handleSessionExpired = (event: CustomEvent) => {
      console.log('Session expired, logging out and redirecting...');
      dispatch({ type: 'SET_UNAUTHENTICATED' });
      
      // Navigate to login page without refresh
      const redirectPath = event.detail?.redirectPath || '/sign-in';
      router.push(redirectPath);
    };

    // Add event listener for session expiration
    window.addEventListener('auth:session-expired', handleSessionExpired as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired as EventListener);
    };
  }, [router]);

  // Login function
  const login = async (
    credentials: AdminLoginRequest | UserLoginRequest,
    userType: AuthUserType
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      let response;
      if (userType === 'admin') {
        response = await authService.adminLogin(credentials as AdminLoginRequest);
      } else {
        response = await authService.userLogin(credentials as UserLoginRequest);
      }

      const user = userType === 'admin' ? response.admin : response.user;
      
      dispatch({
        type: 'SET_AUTHENTICATED',
        payload: { user, userType },
      });
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authService.logout();
      dispatch({ type: 'SET_UNAUTHENTICATED' });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      dispatch({ type: 'SET_UNAUTHENTICATED' });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshAccessToken();
      // Token refresh doesn't change user data, just updates tokens
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      dispatch({ type: 'SET_UNAUTHENTICATED' });
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (data: UpdateProfileRequest): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const updatedUser = await authService.updateProfile(data);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await authService.changePassword(data);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export context for advanced usage
export { AuthContext }; 