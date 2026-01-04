// useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { auth } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  onAuthStateChanged 
} from "firebase/auth";
import {
  saveIdeaToFirestore,
  getUserIdeas,
  updateIdeaInFirestore,
  deleteIdeaFromFirestore,
  saveDocumentToFirestore,
  getUserDocuments,
  updateDocumentInFirestore,
  createUserProfile
} from '../services/firestoreService';

export type Idea = {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    firestoreId?: string; // Add Firestore ID
};

export type DocumentVersion = {
    id: string;
    content: string;
    timestamp: string;
    author: string;
    description: string;
};

export type Document = {
    id: string;
    title: string;
    content: string;
    lastModified: string;
    versions: DocumentVersion[];
    firestoreId?: string; // Add Firestore ID
};

interface AppState {
    // UI State
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    activeRibbonTab: 'file' | 'home' | 'insert' | 'view' | 'review';
    setActiveRibbonTab: (tab: 'file' | 'home' | 'insert' | 'view' | 'review') => void;

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
    addIdea: (title: string, content: string) => Promise<void>;
    deleteIdea: (id: string) => Promise<void>;
    updateIdea: (id: string, content: string) => Promise<void>;
    loadUserIdeas: () => Promise<void>;

    createDocument: (title: string) => Promise<void>;
    openDocument: (id: string) => void;
    updateCurrentDocument: (content: string) => Promise<void>;
    saveVersion: (description: string) => Promise<void>;
    loadUserDocuments: () => Promise<void>;

    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            activeRibbonTab: 'home',
            setActiveRibbonTab: (tab) => set({ activeRibbonTab: tab }),

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

            addIdea: async (title: string, content: string) => {
                const { currentUser } = get();
                if (!currentUser.uid) {
                    console.error('User must be logged in to add ideas');
                    return;
                }

                set({ isLoading: true });
                try {
                    const localId = uuidv4();
                    const ideaData = {
                        title,
                        content,
                        tags: [],
                        createdAt: new Date().toISOString(),
                    };

                    // Save to Firestore
                    const firestoreId = await saveIdeaToFirestore(currentUser.uid, ideaData);

                    // Update local state
                    set((state) => ({
                        ideas: [...state.ideas, {
                            ...ideaData,
                            id: localId,
                            firestoreId
                        }],
                        isLoading: false
                    }));
                } catch (error) {
                    console.error('Error adding idea:', error);
                    set({ isLoading: false });
                }
            },

            deleteIdea: async (id: string) => {
                const idea = get().ideas.find(i => i.id === id);
                if (!idea?.firestoreId) return;

                set({ isLoading: true });
                try {
                    // Delete from Firestore
                    await deleteIdeaFromFirestore(idea.firestoreId);

                    // Update local state
                    set((state) => ({
                        ideas: state.ideas.filter((idea) => idea.id !== id),
                        isLoading: false
                    }));
                } catch (error) {
                    console.error('Error deleting idea:', error);
                    set({ isLoading: false });
                }
            },

            updateIdea: async (id: string, content: string) => {
                const idea = get().ideas.find(i => i.id === id);
                if (!idea?.firestoreId) return;

                set({ isLoading: true });
                try {
                    // Update in Firestore
                    await updateIdeaInFirestore(idea.firestoreId, { content });

                    // Update local state
                    set((state) => ({
                        ideas: state.ideas.map((idea) =>
                            idea.id === id ? { ...idea, content } : idea
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    console.error('Error updating idea:', error);
                    set({ isLoading: false });
                }
            },

            loadUserIdeas: async () => {
                const { currentUser } = get();
                if (!currentUser.uid) return;

                set({ isLoading: true });
                try {
                    const firestoreIdeas = await getUserIdeas(currentUser.uid);
                    
                    const ideas = firestoreIdeas.map((idea: any) => ({
                        id: uuidv4(),
                        firestoreId: idea.id,
                        title: idea.title,
                        content: idea.content,
                        tags: idea.tags || [],
                        createdAt: idea.createdAt?.toDate().toISOString() || new Date().toISOString(),
                    }));

                    set({ ideas, isLoading: false });
                } catch (error) {
                    console.error('Error loading ideas:', error);
                    set({ isLoading: false });
                }
            },

            createDocument: async (title: string) => {
                const { currentUser } = get();
                if (!currentUser.uid) {
                    console.error('User must be logged in to create documents');
                    return;
                }

                set({ isLoading: true });
                try {
                    const localId = uuidv4();
                    const documentData = {
                        title,
                        content: '',
                        lastModified: new Date().toISOString(),
                        versions: [],
                    };

                    // Save to Firestore
                    const firestoreId = await saveDocumentToFirestore(currentUser.uid, documentData);

                    // Update local state
                    set((state) => ({
                        documents: [...state.documents, {
                            ...documentData,
                            id: localId,
                            firestoreId
                        }],
                        currentDocumentId: localId,
                        isLoading: false
                    }));
                } catch (error) {
                    console.error('Error creating document:', error);
                    set({ isLoading: false });
                }
            },

            openDocument: (id: string) => set({ currentDocumentId: id }),

            updateCurrentDocument: async (content: string) => {
                const { currentDocumentId, documents, currentUser } = get();
                if (!currentDocumentId || !currentUser.uid) return;

                const doc = documents.find(d => d.id === currentDocumentId);
                if (!doc?.firestoreId) return;

                set({ isLoading: true });
                try {
                    // Update in Firestore
                    await updateDocumentInFirestore(doc.firestoreId, { content });

                    // Update local state
                    set((state) => ({
                        documents: state.documents.map((doc) =>
                            doc.id === currentDocumentId
                                ? { ...doc, content, lastModified: new Date().toISOString() }
                                : doc
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    console.error('Error updating document:', error);
                    set({ isLoading: false });
                }
            },

            saveVersion: async (description: string) => {
                const { currentDocumentId, documents, currentUser } = get();
                if (!currentDocumentId || !currentUser.uid) return;

                const doc = documents.find(d => d.id === currentDocumentId);
                if (!doc?.firestoreId) return;

                set({ isLoading: true });
                try {
                    const newVersion = {
                        id: uuidv4(),
                        content: doc.content,
                        timestamp: new Date().toISOString(),
                        author: currentUser.name,
                        description,
                    };

                    // Update document with new version in Firestore
                    await updateDocumentInFirestore(doc.firestoreId, {
                        versions: [...(doc.versions || []), newVersion]
                    });

                    // Update local state
                    set((state) => ({
                        documents: state.documents.map((d) =>
                            d.id === currentDocumentId
                                ? { ...d, versions: [newVersion, ...(d.versions || [])] }
                                : d
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    console.error('Error saving version:', error);
                    set({ isLoading: false });
                }
            },

            loadUserDocuments: async () => {
                const { currentUser } = get();
                if (!currentUser.uid) return;

                set({ isLoading: true });
                try {
                    const firestoreDocs = await getUserDocuments(currentUser.uid);
                    
                    const documents = firestoreDocs.map((doc: any) => ({
                        id: uuidv4(),
                        firestoreId: doc.id,
                        title: doc.title,
                        content: doc.content,
                        lastModified: doc.updatedAt?.toDate().toISOString() || new Date().toISOString(),
                        versions: doc.versions || [],
                    }));

                    set({ documents, isLoading: false });
                } catch (error) {
                    console.error('Error loading documents:', error);
                    set({ isLoading: false });
                }
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
                            name: user.email || "User", 
                            avatar: "" 
                        },
                        isLoading: false
                    });

                    // Load user data after login
                    get().loadUserIdeas();
                    get().loadUserDocuments();
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
                        ideas: [],
                        documents: [],
                        currentDocumentId: null,
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
                    
                    // Create user profile in Firestore
                    await createUserProfile(user.uid, { email, name });
                    
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
        }),
        {
            name: 'novel-writer-storage',
            partialize: (state) => ({
                // Only persist UI state, not data (data comes from Firestore)
                sidebarOpen: state.sidebarOpen,
                currentUser: state.currentUser,
                currentDocumentId: state.currentDocumentId,
                activeRibbonTab: state.activeRibbonTab,
            }),
        }
    )
);

// Initialize auth state listener
export const initAuthListener = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            useAppStore.getState().setCurrentUser({
                uid: user.uid,
                email: user.email,
                name: user.email || "User",
                avatar: ""
            });
        } else {
            useAppStore.getState().setCurrentUser({
                uid: null,
                email: null,
                name: "Guest",
                avatar: ""
            });
        }
    });
};

// Add missing setter for currentUser
useAppStore.setState((state) => ({
    ...state,
    setCurrentUser: (user: any) => set({ currentUser: user })
}));