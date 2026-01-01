import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";

const Profile: React.FC = () => {
    const { currentUser, logout } = useAppStore();
    const [name, setName] = useState(currentUser.name);
    const [avatar, setAvatar] = useState(currentUser.avatar || "");

    const handleSave = () => {
        // Update user profile logic here (e.g., save to Firebase or Zustand store)
        alert("Profile updated successfully!");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-2xl font-bold mb-4">Profile</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Avatar URL</label>
                    <input
                        type="text"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-4"
                >
                    Save
                </button>
                <button
                    onClick={logout}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;