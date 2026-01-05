import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { toast } from "react-hot-toast";

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, logout, updateUserProfile } = useAppStore();
    const [name, setName] = useState(currentUser.name || "");
    const [isLoading, setIsLoading] = useState(false);

    // Update local state when currentUser changes
    useEffect(() => {
        setName(currentUser.name || "");
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser?.uid) {
            toast.error("You must be logged in to update your profile");
            return;
        }

        setIsLoading(true);

        try {
            await updateUserProfile(name);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully!");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message || "Failed to logout");
        }
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    // Redirect if not logged in
    if (!currentUser?.uid) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={handleBackToHome}
                        className="text-gray-600 hover:text-gray-800 transition duration-200 mr-4 p-2 hover:bg-gray-100 rounded-full"
                        aria-label="Back to home"
                        type="button"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-3">
                        <span className="text-3xl text-white font-bold">
                            {name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                        {currentUser.email}
                    </p>
                </div>

                {/* Name Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profile-name">
                        Display Name
                    </label>
                    <input
                        type="text"
                        id="profile-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter your name"
                        autoComplete="name"
                    />
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleSave}
                        disabled={isLoading || !name.trim() || name === currentUser.name}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition ${isLoading || !name.trim() || name === currentUser.name
                            ? "bg-gray-300 cursor-not-allowed text-gray-500"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                        type="button"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        onClick={handleBackToHome}
                        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                        type="button"
                    >
                        Back to Home
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
                        type="button"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;