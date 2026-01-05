import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

const Login: React.FC = () => {
    const { login, register, currentUser } = useAppStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser.uid) {
            navigate("/");
        }
    }, [currentUser.uid, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validation
        if (!email || !password) {
            setError("Email and password are required");
            setIsLoading(false);
            return;
        }

        if (isRegistering && !name.trim()) {
            setError("Name is required for registration");
            setIsLoading(false);
            return;
        }

        try {
            if (isRegistering) {
                await register(email, password, name);
                // Show success message for registration
                alert("Registration successful! You can now login.");
                setIsRegistering(false);
                setName("");
            } else {
                await login(email, password);
                // Redirect will happen via useEffect above
            }

            // Clear form
            setEmail("");
            setPassword("");
        } catch (err: any) {
            console.error("Auth error:", err);

            // Handle specific Firebase errors
            let errorMessage = `Failed to ${isRegistering ? "register" : "log in"}`;

            if (err.code) {
                switch (err.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = "This email is already registered. Try logging in instead.";
                        break;
                    case 'auth/invalid-email':
                        errorMessage = "Invalid email address.";
                        break;
                    case 'auth/weak-password':
                        errorMessage = "Password should be at least 6 characters.";
                        break;
                    case 'auth/user-not-found':
                        errorMessage = "No account found with this email.";
                        break;
                    case 'auth/wrong-password':
                        errorMessage = "Incorrect password.";
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = "Too many attempts. Try again later.";
                        break;
                    default:
                        errorMessage = err.message || errorMessage;
                }
            } else {
                errorMessage = err.message || errorMessage;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
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
                            disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    className={`w-full py-2 rounded font-medium transition-colors ${isLoading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                    disabled={!email || !password || (isRegistering && !name) || isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isRegistering ? "Registering..." : "Logging in..."}
                        </span>
                    ) : (
                        isRegistering ? "Register" : "Log In"
                    )}
                </button>

                <p
                    className="text-sm text-center text-gray-600 mt-4 cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                        if (!isLoading) {
                            setIsRegistering(!isRegistering);
                            setError("");
                            setName("");
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (!isLoading && (e.key === 'Enter' || e.key === ' ')) {
                            setIsRegistering(!isRegistering);
                            setError("");
                            setName("");
                        }
                    }}
                    style={isLoading ? { pointerEvents: 'none', opacity: 0.5 } : {}}
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