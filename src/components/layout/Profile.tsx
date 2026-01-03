import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { updateProfile } from "../../services/authService";
import { uploadImage } from "../../services/storageService";
import { toast } from "react-hot-toast";

const Profile: React.FC = () => {
    const { currentUser, logout, updateUser } = useAppStore();
    const [name, setName] = useState(currentUser.name);
    const [avatar, setAvatar] = useState(currentUser.avatar || "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar || "");

    // Update local state when currentUser changes
    useEffect(() => {
        setName(currentUser.name);
        setAvatar(currentUser.avatar || "");
        setAvatarPreview(currentUser.avatar || "");
    }, [currentUser]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setAvatar(""); // Clear URL input if file is selected
        }
    };

    const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setAvatar(url);
        setAvatarPreview(url);
        setAvatarFile(null); // Clear file if URL is entered
    };

    const handleSave = async () => {
        if (!currentUser?.uid) {
            toast.error("You must be logged in to update your profile");
            return;
        }

        setIsLoading(true);

        try {
            let avatarUrl = avatar;

            // Upload avatar file if selected
            if (avatarFile) {
                try {
                    avatarUrl = await uploadImage(avatarFile, `avatars/${currentUser.uid}`);
                    toast.success("Avatar uploaded successfully!");
                } catch (uploadError) {
                    console.error("Failed to upload avatar:", uploadError);
                    toast.error("Failed to upload avatar. Using existing image.");
                }
            }

            // Update profile in Firebase/auth
            const updatedUser = await updateProfile({
                displayName: name,
                photoURL: avatarUrl || null
            });

            // Update local Zustand store
            updateUser({
                name: updatedUser.displayName || name,
                avatar: updatedUser.photoURL || avatarUrl,
                email: updatedUser.email || currentUser.email
            });

            // Clear file input if URL was used
            if (!avatarFile && avatar) {
                const fileInput = document.getElementById('avatarFile') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }

            toast.success("Profile updated successfully!");

        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully!");
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Profile Settings</h2>

                {/* Avatar Preview */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <span className="text-4xl text-white font-bold">
                                    {name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600">Click below to change your avatar</p>
                </div>

                {/* Name Input */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        placeholder="Enter your name"
                    />
                </div>

                {/* Avatar Upload Options */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar</label>

                    {/* Option 1: File Upload */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-2">Upload an image</label>
                        <input
                            id="avatarFile"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {/* Option 2: URL Input */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Or enter image URL</label>
                        <input
                            type="text"
                            value={avatar}
                            onChange={handleAvatarUrlChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                </div>

                {/* Email Display (Read-only) */}
                {currentUser.email && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <p className="text-gray-600">{currentUser.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={handleSave}
                        disabled={isLoading || !name.trim()}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-200 ${isLoading || !name.trim()
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            } text-white shadow-lg`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </span>
                        ) : "Save Changes"}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition duration-200 shadow-lg"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;