import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';

// User profiles collection
const USERS_COLLECTION = 'users';
const IDEAS_COLLECTION = 'ideas';
const DOCUMENTS_COLLECTION = 'documents';

// User operations
export const createUserProfile = async (userId: string, userData: { email: string, name: string }) => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, userId), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Ideas operations
export const saveIdeaToFirestore = async (userId: string, ideaData: any) => {
  try {
    const ideaRef = await addDoc(collection(db, IDEAS_COLLECTION), {
      ...ideaData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return ideaRef.id;
  } catch (error) {
    console.error('Error saving idea:', error);
    throw error;
  }
};

export const getUserIdeas = async (userId: string) => {
  try {
    const q = query(
      collection(db, IDEAS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user ideas:', error);
    throw error;
  }
};

export const updateIdeaInFirestore = async (ideaId: string, updates: any) => {
  try {
    await updateDoc(doc(db, IDEAS_COLLECTION, ideaId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating idea:', error);
    throw error;
  }
};

export const deleteIdeaFromFirestore = async (ideaId: string) => {
  try {
    await deleteDoc(doc(db, IDEAS_COLLECTION, ideaId));
    return true;
  } catch (error) {
    console.error('Error deleting idea:', error);
    throw error;
  }
};

// Documents operations
export const saveDocumentToFirestore = async (userId: string, documentData: any) => {
  try {
    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
      ...documentData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

export const getUserDocuments = async (userId: string) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user documents:', error);
    throw error;
  }
};

export const updateDocumentInFirestore = async (documentId: string, updates: any) => {
  try {
    await updateDoc(doc(db, DOCUMENTS_COLLECTION, documentId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocumentFromFirestore = async (documentId: string) => {
  try {
    await deleteDoc(doc(db, DOCUMENTS_COLLECTION, documentId));
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};