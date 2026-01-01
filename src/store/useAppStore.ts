import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";

export type Idea = {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
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
    currentUser: { name: string; avatar?: string };

    // Actions
    addIdea: (title: string, content: string) => void;
    deleteIdea: (id: string) => void;
    updateIdea: (id: string, content: string) => void;

    createDocument: (title: string) => void;
    openDocument: (id: string) => void;
    updateCurrentDocument: (content: string) => void;
    saveVersion: (description: string) => void;

    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            activeRibbonTab: 'home',
            setActiveRibbonTab: (tab) => set({ activeRibbonTab: tab }),

            ideas: [
                {
                    id: '1',
                    title: 'Character Concept: The Clockwork Merchant',
                    content: 'A merchant who sells time, but only in exchange for memories. He has a monocle that ticks.',
                    tags: ['character', 'fantasy'],
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: 'Plot Twist: The Butler',
                    content: 'The butler didn\'t do it, but he knows who did and is protecting them because they are his secret child.',
                    tags: ['plot', 'mystery'],
                    createdAt: new Date().toISOString(),
                }
            ],
            documents: [
                {
                    id: 'doc-1',
                    title: 'The Clockwork City',
                    content: '<h2>Chapter 1: The Ticking Gate</h2><p>The city didn\'t wake up; it wound up. The sound of a million gears clicking into place was the morning rooster.</p>',
                    lastModified: new Date().toISOString(),
                    versions: [],
                }
            ],
            currentDocumentId: 'doc-1',
            currentUser: { name: 'Author', avatar: '' },

            addIdea: (title, content) => set((state) => ({
                ideas: [...state.ideas, {
                    id: uuidv4(),
                    title,
                    content,
                    tags: [],
                    createdAt: new Date().toISOString(),
                }]
            })),

            deleteIdea: (id) => set((state) => ({
                ideas: state.ideas.filter((idea) => idea.id !== id)
            })),

            updateIdea: (id, content) => set((state) => ({
                ideas: state.ideas.map((idea) =>
                    idea.id === id ? { ...idea, content } : idea
                )
            })),

            createDocument: (title) => {
                const newDoc: Document = {
                    id: uuidv4(),
                    title,
                    content: '',
                    lastModified: new Date().toISOString(),
                    versions: [],
                };
                set((state) => ({
                    documents: [...state.documents, newDoc],
                    currentDocumentId: newDoc.id,
                }));
            },

            openDocument: (id) => set({ currentDocumentId: id }),

            updateCurrentDocument: (content) => set((state) => {
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

            saveVersion: (description) => set((state) => {
                const docId = state.currentDocumentId;
                if (!docId) return state;

                const doc = state.documents.find((d) => d.id === docId);
                if (!doc) return state;

                const newVersion: DocumentVersion = {
                    id: uuidv4(),
                    content: doc.content,
                    timestamp: new Date().toISOString(),
                    author: 'You', // Placeholder for auth
                    description,
                };

                return {
                    documents: state.documents.map((d) =>
                        d.id === docId
                            ? { ...d, versions: [newVersion, ...d.versions] }
                            : d
                    )
                };
            }),

            login: async (email, password) => {
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    set({ currentUser: { name: user.email || "User", avatar: "" } });
                } catch (error) {
                    console.error("Login failed", error);
                }
            },

            logout: async () => {
                try {
                    await signOut(auth);
                    set({ currentUser: { name: "Guest", avatar: "" } });
                } catch (error) {
                    console.error("Logout failed", error);
                }
            },

            register: async (email, password) => {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    set({ currentUser: { name: user.email || "User", avatar: "" } });
                } catch (error) {
                    console.error("Registration failed", error);
                }
            },
        }),
        {
            name: 'novel-writer-storage',
        }
    )
);