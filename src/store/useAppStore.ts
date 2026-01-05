// store/useAppStore.ts - UPDATED VERSION
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { createUserProfile } from '../services/firestoreService';

interface User {
  uid: string | null;
  email: string | null;
  name: string;
  avatar?: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  versions: Array<{content: string; description: string; timestamp: Date}>;
}

interface Idea {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface AppState {
  // User state
  currentUser: User;
  isLoading: boolean;
  
  // App state
  documents: Document[];
  ideas: Idea[];
  currentDocumentId: string | null;
  sidebarOpen: boolean;
  activeRibbonTab: 'file' | 'home' | 'insert' | 'view';
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  setCurrentUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  
  // App actions
  createDocument: (title: string) => void;
  updateCurrentDocument: (content: string) => void;
  saveVersion: (description: string) => void;
  openDocument: (id: string) => void;
  addIdea: (title: string, content: string) => void;
  deleteIdea: (id: string) => void;
  toggleSidebar: () => void;
  setActiveRibbonTab: (tab: 'file' | 'home' | 'insert' | 'view') => void;
  
  // Initialize auth listener
  initAuthListener: () => (() => void);
}

// Helper to convert Firebase user to app user
const firebaseUserToAppUser = (user: FirebaseUser | null): User => {
  if (!user) {
    return {
      uid: null,
      email: null,
      name: "Guest",
      avatar: ""
    };
  }
  
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || user.email?.split('@')[0] || "User",
    avatar: user.photoURL || ""
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: {
        uid: null,
        email: null,
        name: 'Guest',
        avatar: ''
      },
      isLoading: false,
      documents: [],
      ideas: [],
      currentDocumentId: null,
      sidebarOpen: true,
      activeRibbonTab: 'home',

      // Loading state
      setLoading: (loading) => set({ isLoading: loading }),

      // User management
      setCurrentUser: (user) => set({ currentUser: user }),

      // Auth listener
      initAuthListener: () => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          const appUser = firebaseUserToAppUser(user);
          set({ currentUser: appUser });
        });
        
        return unsubscribe;
      },

      // Auth actions
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          set({ 
            currentUser: firebaseUserToAppUser(user),
            isLoading: false
          });
        } catch (error: any) {
          console.error("Login failed", error);
          set({ isLoading: false });
          throw new Error(error.message || "Login failed. Please check your credentials.");
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ 
            currentUser: firebaseUserToAppUser(null),
            isLoading: false
          });
        } catch (error: any) {
          console.error("Logout failed", error);
          set({ isLoading: false });
          throw new Error(error.message || "Logout failed");
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
          
          // Create user profile in Firestore
          await createUserProfile(user.uid, { email, name });
          
          set({ 
            currentUser: firebaseUserToAppUser(user),
            isLoading: false
          });
        } catch (error: any) {
          console.error("Registration failed", error);
          set({ isLoading: false });
          throw new Error(error.message || "Registration failed. Please try again.");
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
          throw new Error(error.message || "Failed to update profile");
        }
      },

      // Document actions
      createDocument: (title: string) => {
        const newDoc: Document = {
          id: Date.now().toString(),
          title,
          content: '',
          lastModified: new Date(),
          versions: []
        };
        
        set(state => ({
          documents: [newDoc, ...state.documents],
          currentDocumentId: newDoc.id
        }));
      },

      updateCurrentDocument: (content: string) => {
        const { currentDocumentId, documents } = get();
        if (!currentDocumentId) return;

        set({
          documents: documents.map(doc =>
            doc.id === currentDocumentId
              ? { ...doc, content, lastModified: new Date() }
              : doc
          )
        });
      },

      saveVersion: (description: string) => {
        const { currentDocumentId, documents } = get();
        if (!currentDocumentId) return;

        const currentDoc = documents.find(d => d.id === currentDocumentId);
        if (!currentDoc) return;

        const newVersion = {
          content: currentDoc.content,
          description,
          timestamp: new Date()
        };

        set({
          documents: documents.map(doc =>
            doc.id === currentDocumentId
              ? { 
                  ...doc, 
                  versions: [newVersion, ...doc.versions.slice(0, 9)] // Keep last 10 versions
                }
              : doc
          )
        });
      },

      openDocument: (id: string) => {
        set({ currentDocumentId: id });
      },

      // Idea actions
      addIdea: (title: string, content: string) => {
        const newIdea: Idea = {
          id: Date.now().toString(),
          title,
          content,
          createdAt: new Date()
        };
        
        set(state => ({
          ideas: [newIdea, ...state.ideas]
        }));
      },

      deleteIdea: (id: string) => {
        set(state => ({
          ideas: state.ideas.filter(idea => idea.id !== id)
        }));
      },

      // UI actions
      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setActiveRibbonTab: (tab) => {
        set({ activeRibbonTab: tab });
      },
    }),
    {
      name: 'writing-editor-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        documents: state.documents,
        ideas: state.ideas,
        currentDocumentId: state.currentDocumentId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);