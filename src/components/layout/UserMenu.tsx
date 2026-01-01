import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserMenu: React.FC = () => {
    const { currentUser, logout } = useAppStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    return (
        <div className="relative">
            <div
                className="flex items-center gap-2 px-2 py-1 hover:bg-slate-700 rounded cursor-pointer transition-colors"
                onClick={toggleMenu}
            >
                <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold border border-slate-500">
                    {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="User" className="w-full h-full rounded-full" />
                    ) : (
                        <User size={14} />
                    )}
                </div>
                <span className="text-xs font-medium text-white">
                    {currentUser?.name || "Guest"}
                </span>
                <ChevronDown size={12} className="text-slate-400" />
            </div>

            {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-md z-10">
                    {currentUser.name === "Guest" ? (
                        <div className="p-2">
                            <button
                                onClick={() => window.location.reload()} // Redirect to login
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Login
                            </button>
                        </div>
                    ) : (
                        <div className="p-2">
                            <button
                                onClick={() => navigate("/profile")}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                View Profile
                            </button>
                            <button
                                onClick={logout}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserMenu;