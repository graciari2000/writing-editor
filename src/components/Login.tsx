import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";

const Login: React.FC = () => {
    const { login, register } = useAppStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        if (isRegistering && !name.trim()) {
            setError("Name is required for registration");
            return;
        }

        try {
            if (isRegistering) {
                await register(email, password, name);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            setError(err.message || `Failed to ${isRegistering ? "register" : "log in"}`);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-80"
                noValidate
            >
                <h2 className="text-2xl font-bold mb-4">
                    {isRegistering ? "Register" : "Login"}
                </h2>

                {error && (
                    <p className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
                        {error}
                    </p>
                )}

                {isRegistering && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="name">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required={isRegistering}
                            autoComplete="name"
                        />
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                        minLength={6}
                        autoComplete={isRegistering ? "new-password" : "current-password"}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={!email || !password || (isRegistering && !name)}
                >
                    {isRegistering ? "Register" : "Log In"}
                </button>

                <p
                    className="text-sm text-center text-gray-600 mt-4 cursor-pointer hover:underline"
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError("");
                        setName("");
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setIsRegistering(!isRegistering);
                            setError("");
                            setName("");
                        }
                    }}
                >
                    {isRegistering
                        ? "Already have an account? Log in"
                        : "Don't have an account? Register"
                    }
                </p>
            </form>
        </div>
    );
};

export default Login;