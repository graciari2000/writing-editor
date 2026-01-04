// useAppStore.ts - Simplified version
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { auth } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from "firebase/auth";

export type Idea = {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
};

export type Document = {
    id: string;
    title: string;
    content: string;
    lastModified: string;
};

interface AppState {
    // UI State
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    
    // Data State
    ideas: Idea[];
    documents: Document[];
    currentDocumentId: string | null;
    currentUser: { 
        uid: string | null; 
        email: string | null; 
        name: string; 
        avatar?: string 
    };
    isLoading: boolean;

    // Actions
    addIdea: (title: string, content: string) => void;
    deleteIdea: (id: string) => void;
    updateIdea: (id: string, content: string) => void;

    createDocument: (title: string) => void;
    openDocument: (id: string) => void;
    updateCurrentDocument: (content: string) => void;

    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    updateUserProfile: (name: string, avatarUrl?: string) => Promise<void>;
    setCurrentUser: (user: { uid: string | null; email: string | null; name: string; avatar?: string }) => void;
    setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            
            ideas: [],
            documents: [],
            currentDocumentId: null,
            currentUser: { 
                uid: null, 
                email: null, 
                name: 'Guest', 
                avatar: '' 
            },
            isLoading: false,

            setLoading: (loading) => set({ isLoading: loading }),
            
            setCurrentUser: (user) => set({ currentUser: user }),

            addIdea: (title: string, content: string) => set((state) => ({
                ideas: [...state.ideas, {
                    id: uuidv4(),
                    title,
                    content,
                    tags: [],
                    createdAt: new Date().toISOString(),
                }]
            })),

            deleteIdea: (id: string) => set((state) => ({
                ideas: state.ideas.filter((idea) => idea.id !== id)
            })),

            updateIdea: (id: string, content: string) => set((state) => ({
                ideas: state.ideas.map((idea) =>
                    idea.id === id ? { ...idea, content } : idea
                )
            })),

            createDocument: (title: string) => {
                const newDoc: Document = {
                    id: uuidv4(),
                    title,
                    content: '',
                    lastModified: new Date().toISOString(),
                };
                set((state) => ({
                    documents: [...state.documents, newDoc],
                    currentDocumentId: newDoc.id,
                }));
            },

            openDocument: (id: string) => set({ currentDocumentId: id }),

            updateCurrentDocument: (content: string) => set((state) => {
                const docId = state.currentDocumentId;
                if (!docId) return state;

                return {
                    documents: state.documents.map((doc) =>
                        doc.id === docId
                            ? { ...doc, content, lastModified: new Date().toISOString() }
                            : doc
                    )
                };
            }),

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
                }
            },

            register: async (email: string, password: string, name: string) => {
                set({ isLoading: true });
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    
                    // Update display name
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

            updateUserProfile: async (name: string, avatarUrl?: string) => {
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
                        displayName: name,
                        photoURL: avatarUrl || null
                    });

                    // Update local state
                    set({ 
                        currentUser: { 
                            ...currentUser,
                            name,
                            avatar: avatarUrl || currentUser.avatar
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
            name: 'novel-writer-storage',
            partialize: (state) => ({
                // Persist minimal state
                sidebarOpen: state.sidebarOpen,
                currentUser: state.currentUser,
                currentDocumentId: state.currentDocumentId,
            }),
        }
    )
);

// Auth listener
export const initAuthListener = () => {
    return onAuthStateChanged(auth, (user) => {
        const store = useAppStore.getState();
        
        if (user) {
            console.log('User logged in:', user.email);
            store.setCurrentUser({
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0] || "User",
                avatar: user.photoURL || ""
            });
        } else {
            console.log('User logged out');
            store.setCurrentUser({
                uid: null,
                email: null,
                name: "Guest",
                avatar: ""
            });
        }
    });
};