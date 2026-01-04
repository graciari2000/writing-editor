// store/useAppStore.ts - CORRECTED VERSION
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from "firebase/auth";

interface User {
  uid: string | null;
  email: string | null;
  name: string;
  avatar?: string;
}

interface AppState {
  // User state
  currentUser: User;
  isLoading: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  setCurrentUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initAuthListener: () => void; // ADD THIS
}

// Initialize auth listener outside the store
let authListenerInitialized = false;

const initAuthListener = () => {
  if (authListenerInitialized || typeof window === 'undefined') return;
  
  authListenerInitialized = true;
  
  onAuthStateChanged(auth, (user) => {
    const store = useAppStore.getState();
    
    if (user) {
      console.log('Auth listener: User logged in', user.email);
      store.setCurrentUser({
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || "User",
        avatar: user.photoURL || ""
      });
    } else {
      console.log('Auth listener: User logged out');
      store.setCurrentUser({
        uid: null,
        email: null,
        name: "Guest",
        avatar: ""
      });
    }
  });
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: {
        uid: null,
        email: null,
        name: 'Guest',
        avatar: ''
      },
      isLoading: false,

      setLoading: (loading) => set({ isLoading: loading }),

      setCurrentUser: (user) => set({ currentUser: user }),

      // ADD THIS METHOD TO THE STORE
      initAuthListener: () => {
        initAuthListener();
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          set({ 
            currentUser: {
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || "User",
              avatar: user.photoURL || ""
            },
            isLoading: false
          });
        } catch (error: any) {
          console.error("Login failed", error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ 
            currentUser: {
              uid: null,
              email: null,
              name: "Guest",
              avatar: ""
            },
            isLoading: false
          });
        } catch (error) {
          console.error("Logout failed", error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Update display name in Firebase
          await firebaseUpdateProfile(user, {
            displayName: name
          });
          
          set({ 
            currentUser: {
              uid: user.uid,
              email: user.email,
              name: name,
              avatar: ""
            },
            isLoading: false
          });
        } catch (error: any) {
          console.error("Registration failed", error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateUserProfile: async (name: string) => {
        const { currentUser } = get();
        if (!currentUser.uid) {
          throw new Error("User must be logged in");
        }

        set({ isLoading: true });
        try {
          const user = auth.currentUser;
          if (!user) throw new Error("No user found");

          // Update Firebase auth profile
          await firebaseUpdateProfile(user, {
            displayName: name
          });

          // Update local state
          set({ 
            currentUser: {
              ...currentUser,
              name
            },
            isLoading: false
          });
        } catch (error: any) {
          console.error("Update profile failed", error);
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'writing-editor-storage',
      partialize: (state) => ({
        currentUser: state.currentUser
      }),
    }
  )
);

// Export the initAuthListener function separately as well
export { initAuthListener };