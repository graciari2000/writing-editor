// Profile.tsx - Simplified version
import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { toast } from "react-hot-toast";

const Profile: React.FC = () => {
    const { currentUser, logout, updateUserProfile } = useAppStore();
    const [name, setName] = useState(currentUser.name || "");
    const [avatar, setAvatar] = useState(currentUser.avatar || "");
    const [isLoading, setIsLoading] = useState(false);

    // Update local state when currentUser changes
    useEffect(() => {
        setName(currentUser.name || "");
        setAvatar(currentUser.avatar || "");
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser?.uid) {
            toast.error("You must be logged in to update your profile");
            return;
        }

        setIsLoading(true);

        try {
            // Update profile (name only for now - storage not enabled)
            await updateUserProfile(name);
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

                {/* Avatar Preview - Using default for now */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-4xl text-white font-bold">
                            {name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Note: Avatar upload requires Firebase Storage (not enabled)
                    </p>
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