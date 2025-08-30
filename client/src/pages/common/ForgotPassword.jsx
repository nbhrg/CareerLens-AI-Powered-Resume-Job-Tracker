import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, KeyRound } from "lucide-react";
import { candidateAPI, recruiterAPI } from "../../utils/api";

const ForgotPassword = () => {
    const [formData, setFormData] = useState({
        email: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState("candidate"); // candidate or recruiter

    const navigate = useNavigate();
    const location = useLocation();

    // Get user type from URL query params or default to candidate
    React.useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const type = searchParams.get("type");
        if (type === "recruiter" || type === "candidate") {
            setUserType(type);
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const validateForm = () => {
        if (!formData.email) {
            toast.error("Email is required");
            return false;
        }

        if (!formData.newPassword) {
            toast.error("New password is required");
            return false;
        }

        if (formData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const resetData = {
                email: formData.email,
                newPassword: formData.newPassword,
            };

            // Try to reset password based on user type
            if (userType === "candidate") {
                await candidateAPI.resetPassword(resetData);
            } else {
                await recruiterAPI.resetPassword(resetData);
            }

            toast.success(
                "Password reset successful! You can now login with your new password."
            );

            // Redirect to appropriate login page
            navigate(
                userType === "candidate"
                    ? "/candidate/login"
                    : "/recruiter/login",
                {
                    state: {
                        message:
                            "Password updated successfully. Please login with your new password.",
                    },
                }
            );
        } catch (error) {
            if (
                error.message.includes("not found") ||
                error.message.includes("does not exist")
            ) {
                toast.error(
                    `User does not exist. Please create an account first.`
                );

                // Redirect to signup page after a short delay
                setTimeout(() => {
                    navigate(
                        userType === "candidate"
                            ? "/candidate/signup"
                            : "/recruiter/signup"
                    );
                }, 2000);
            } else {
                toast.error("Failed to reset password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleUserType = (type) => {
        setUserType(type);
        // Update URL without causing page reload
        const newUrl = `${location.pathname}?type=${type}`;
        window.history.replaceState({}, "", newUrl);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <KeyRound className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email and new password
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* User Type Toggle */}
                    <div className="mb-6">
                        <div className="flex rounded-md border border-gray-300 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleUserType("candidate")}
                                className={`flex-1 py-2 px-4 text-sm font-medium text-center transition-colors cursor-pointer ${
                                    userType === "candidate"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                Job Seeker
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleUserType("recruiter")}
                                className={`flex-1 py-2 px-4 text-sm font-medium text-center transition-colors cursor-pointer ${
                                    userType === "recruiter"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                Recruiter
                            </button>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="newPassword"
                                className="block text-sm font-medium text-gray-700"
                            >
                                New Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                />
                                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Confirm New Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Remember your password?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <Link
                                to={
                                    userType === "candidate"
                                        ? "/candidate/login"
                                        : "/recruiter/login"
                                }
                                className="w-full flex justify-center py-2 px-4 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Back to Sign In
                            </Link>

                            <Link
                                to={
                                    userType === "candidate"
                                        ? "/candidate/signup"
                                        : "/recruiter/signup"
                                }
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Create New Account
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Need help? Contact support at{" "}
                            <a
                                href="mailto:support@joborbit.com"
                                className="text-blue-600 hover:text-blue-500"
                            >
                                support@joborbit.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
