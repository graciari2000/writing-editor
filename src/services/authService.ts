import { auth } from "../firebaseConfig";
import { updateProfile as firebaseUpdateProfile } from "firebase/auth";

interface UpdateProfileData {
    displayName?: string;
    photoURL?: string | null;
}

export const updateProfile = async (data: UpdateProfileData) => {
    const user = auth.currentUser;
    
    if (!user) {
        throw new Error("No user is currently signed in");
    }

    try {
        await firebaseUpdateProfile(user, data);
        return user;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw new Error("Failed to update profile. Please try again.");
    }
};