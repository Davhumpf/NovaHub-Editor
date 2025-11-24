import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserTier, LoginCredentials, RegisterCredentials } from '@/types/user';

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  upgradeToPremium: () => Promise<boolean>;
  checkPremiumStatus: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call - Replace with actual API endpoint
          // For now, we'll do a mock authentication
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Mock user data - In production, this would come from your API
          const mockUser: User = {
            id: `user-${Date.now()}`,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            tier: 'free',
            createdAt: new Date(),
          };

          const mockToken = `token-${Date.now()}`;

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
          return false;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call - Replace with actual API endpoint
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Mock user data - In production, this would come from your API
          const mockUser: User = {
            id: `user-${Date.now()}`,
            email: credentials.email,
            name: credentials.name,
            tier: 'free',
            createdAt: new Date(),
          };

          const mockToken = `token-${Date.now()}`;

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      upgradeToPremium: async () => {
        const { user } = get();
        if (!user) return false;

        set({ isLoading: true, error: null });

        try {
          // Simulate API call for upgrading to premium
          await new Promise(resolve => setTimeout(resolve, 1000));

          const updatedUser: User = {
            ...user,
            tier: 'premium',
            premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          };

          set({
            user: updatedUser,
            isLoading: false,
          });

          return true;
        } catch (error: any) {
          set({
            error: error.message || 'Failed to upgrade to premium',
            isLoading: false,
          });
          return false;
        }
      },

      checkPremiumStatus: () => {
        const { user } = get();
        if (!user || user.tier !== 'premium') return false;

        if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
          // Premium expired, downgrade to free
          set({
            user: {
              ...user,
              tier: 'free',
            },
          });
          return false;
        }

        return true;
      },
    }),
    {
      name: 'novahub-user-storage',
    }
  )
);
