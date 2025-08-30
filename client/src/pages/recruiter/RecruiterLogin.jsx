import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/useAuth";
import { recruiterAPI } from "../../utils/api";
import { Eye, EyeOff, Mail, Lock, Building2 } from "lucide-react";

const RecruiterLogin = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/recruiter/dashboard";

    // Check for success message from signup
    React.useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message);
        }
    }, [location.state]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Call the backend API for recruiter login
            const response = await recruiterAPI.login({
                email: formData.email,
                password: formData.password,
            });

            // Extract user data and token from response
            const { token, data } = response;
            const userData = {
                id: data.recruiter._id,
                name: data.recruiter.fullName,
                email: data.recruiter.email,
                firstName: data.recruiter.firstName,
                lastName: data.recruiter.lastName,
                role: "recruiter",
                company: data.recruiter.companyDisplayName,
                position: data.recruiter.position,
                profileCompleteness: data.recruiter.profileCompleteness,
                isEmailVerified: data.recruiter.isEmailVerified,
                isCompanyVerified: data.recruiter.isCompanyVerified,
            };

            // Login using auth context
            await login(userData, token);
            toast.success("Login successful! Welcome back.");
            navigate(from, { replace: true });
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Building2 className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Recruiter Sign In
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Access your recruiter dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your password"
                                    value={formData.password}
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

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link
                                    to="/forgot-password?type=recruiter"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? "Signing in..." : "Sign in"}
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
                                    New to JobOrbit?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/recruiter/signup"
                                className="w-full flex justify-center py-2 px-4 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                            >
                                Create recruiter account
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/candidate/login"
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Are you a job seeker? Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterLogin;
