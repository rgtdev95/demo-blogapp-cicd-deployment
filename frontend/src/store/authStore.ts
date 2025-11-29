import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authAPI from '@/api/auth';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  tempEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  verify: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; bio?: string; avatar?: string }) => Promise<boolean>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      tempEmail: null,

      setToken: (token: string) => {
        set({ token });
      },

      login: async (email: string, password: string) => {
        try {
          const response = await authAPI.login(email, password);
          const token = response.access_token;

          set({ token });

          const user = await authAPI.getCurrentUser();
          set({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              bio: user.bio
            },
            isAuthenticated: true
          });

          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        try {
          const response = await authAPI.register(name, email, password);
          set({ tempEmail: email });

          console.log('OTP Code (development):', response.otp_code);

          return true;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },

      verify: async (code: string) => {
        try {
          const tempEmail = get().tempEmail;
          if (!tempEmail) {
            console.error('No email found for verification');
            return false;
          }

          const response = await authAPI.verifyOTP(tempEmail, code);
          const token = response.access_token;
          const user = response.user;

          set({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              bio: user.bio
            },
            isAuthenticated: true,
            tempEmail: null
          });

          return true;
        } catch (error) {
          console.error('Verification error:', error);
          return false;
        }
      },

      updateProfile: async (data) => {
        try {
          const updatedUser = await authAPI.updateProfile(data);
          set({
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              avatar: updatedUser.avatar,
              bio: updatedUser.bio
            }
          });
          return true;
        } catch (error) {
          console.error('Update profile error:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, token: null, isAuthenticated: false, tempEmail: null });
        }
      }
    }),
    {
      name: 'scribble-auth'
    }
  )
);
