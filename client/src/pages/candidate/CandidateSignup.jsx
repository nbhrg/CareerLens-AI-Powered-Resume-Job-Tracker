/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { candidateAPI } from "../../utils/api";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar } from "lucide-react";

const CandidateSignup = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Frontend validation
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        // Check password complexity
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            toast.error(
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            );
            setLoading(false);
            return;
        }

        // Check age validation
        if (formData.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(formData.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();

            if (
                monthDifference < 0 ||
                (monthDifference === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }

            if (age < 18) {
                toast.error("You must be at least 18 years old to register");
                setLoading(false);
                return;
            }
        }

        // Check phone number format
        if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
            toast.error("Please enter a valid phone number");
            setLoading(false);
            return;
        }

        try {
            // Call the backend API for candidate registration
            await candidateAPI.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                password: formData.password,
            });

            navigate("/candidate/login", {
                state: {
                    message: "Account created successfully! Please sign in.",
                },
            });
        } catch (error) {
            console.error("Registration error:", error);

            // Check if error has specific validation messages
            if (
                error.response?.data?.errors &&
                Array.isArray(error.response.data.errors)
            ) {
                // Show each validation error
                error.response.data.errors.forEach((err) => {
                    toast.error(`${err.path || "Field"}: ${err.msg}`);
                });
            } else if (error.response?.data?.message) {
                // Show general error message from backend
                toast.error(error.response.data.message);
            } else if (error.message) {
                // Show error message from axios or other source
                toast.error(error.message);
            } else {
                // Fallback message
                toast.error(
                    "Failed to create account. Please check your information and try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center">
                        <User className="h-12 w-12 text-blue-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Job Seeker Registration
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    First Name
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your first name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Last Name
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your last name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                            </div>

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
                                    htmlFor="dateOfBirth"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Date of Birth
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        required
                                        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />
                                    <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Phone Number
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                    <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
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
                                        type={
                                            showPassword ? "text" : "password"
                                        }
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

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Confirm Password
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
                                        required
                                        className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Confirm your password"
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
                                    {loading
                                        ? "Creating account..."
                                        : "Create account"}
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
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    to="/candidate/login"
                                    className="w-full flex justify-center py-2 px-4 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                                >
                                    Sign in to existing account
                                </Link>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                to="/recruiter/signup"
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Are you a recruiter? Register here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CandidateSignup;
