// Profile.tsx - with Back to Homepage button
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { toast } from "react-hot-toast";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, logout, updateUserProfile } = useAppStore();
    const [name, setName] = useState(currentUser.name || "");
    const [avatar, setAvatar] = useState(currentUser.avatar || "");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Update local state when currentUser changes
    useEffect(() => {
        setName(currentUser.name || "");
        setAvatar(currentUser.avatar || "");
        setIsSaved(false); // Reset saved state when user changes
    }, [currentUser]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!currentUser?.uid) {
            navigate("/login");
        }
    }, [currentUser, navigate]);

    const handleSave = async () => {
        if (!currentUser?.uid) {
            toast.error("You must be logged in to update your profile");
            navigate("/login");
            return;
        }

        setIsLoading(true);

        try {
            // Update profile (name only for now - storage not enabled)
            await updateUserProfile(name);
            toast.success("Profile updated successfully!");
            setIsSaved(true);

            // Reset saved state after 3 seconds
            setTimeout(() => setIsSaved(false), 3000);
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

            // Redirect to login page after successful logout
            setTimeout(() => {
                navigate("/login");
            }, 500);
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    // If not logged in, don't render the profile page
    if (!currentUser?.uid) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleBackToHome}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition duration-200"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back to Home
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800 text-center flex-1">Profile Settings</h2>
                </div>

                {/* Avatar Preview */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-4xl text-white font-bold">
                            {name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm text-center">
                        {currentUser.email ? `Logged in as ${currentUser.email}` : "Welcome!"}
                    </p>
                </div>

                {/* Profile Form */}
                <div className="space-y-6">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Display Name
                        </label>
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
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Email
                            </label>
                            <p className="text-gray-600">{currentUser.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Email cannot be changed
                            </p>
                        </div>
                    )}

                    {/* Status Message */}
                    {isSaved && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                            <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-700 text-sm">
                                Profile saved successfully!
                            </span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-4 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isLoading || !name.trim()}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex items-center justify-center ${isLoading || !name.trim()
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                } text-white shadow-lg`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>

                        {/* Secondary Actions */}
                        <div className="flex space-x-4">
                            <button
                                onClick={handleBackToHome}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition duration-200 shadow"
                            >
                                Back to Home
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition duration-200 shadow-lg"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Quick Navigation Links */}
                        <div className="pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">Quick Links:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    to="/"
                                    className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-center text-sm font-medium transition duration-200"
                                >
                                    📝 Editor
                                </Link>
                                <Link
                                    to="/ideas"
                                    className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-center text-sm font-medium transition duration-200"
                                >
                                    💡 Ideas
                                </Link>
                                <Link
                                    to="/documents"
                                    className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-center text-sm font-medium transition duration-200"
                                >
                                    📄 Documents
                                </Link>
                                <Link
                                    to="/settings"
                                    className="p-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg text-center text-sm font-medium transition duration-200"
                                >
                                    ⚙️ Settings
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Need help? Contact support at{" "}
                        <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                            support@example.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;