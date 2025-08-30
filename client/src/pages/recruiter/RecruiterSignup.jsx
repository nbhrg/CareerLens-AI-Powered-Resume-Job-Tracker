import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { recruiterAPI } from "../../utils/api";
import {
    Building2,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    MapPin,
    Briefcase,
    Calendar,
} from "lucide-react";

const RecruiterSignup = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        position: "",
        department: "HR",
        company: {
            name: "",
            industry: "",
            size: "",
            website: "",
            description: "",
            address: {
                city: "",
                state: "",
                country: "",
            },
        },
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("company.")) {
            const fieldName = name.replace("company.", "");
            if (fieldName.startsWith("address.")) {
                const addressField = fieldName.replace("address.", "");
                setFormData((prev) => ({
                    ...prev,
                    company: {
                        ...prev.company,
                        address: {
                            ...prev.company.address,
                            [addressField]: value,
                        },
                    },
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    company: {
                        ...prev.company,
                        [fieldName]: value,
                    },
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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
                toast.error(
                    "You must be at least 18 years old to register as a recruiter"
                );
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
            // Call the backend API for recruiter registration
            await recruiterAPI.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                position: formData.position,
                department: formData.department,
                company: formData.company,
                password: formData.password,
            });

            navigate("/recruiter/login", {
                state: {
                    message:
                        "Recruiter account created successfully! Please sign in.",
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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="flex justify-center">
                    <Building2 className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create Recruiter Account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join our platform to find the best talent
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email Address
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label
                                        htmlFor="position"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Your Position
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="position"
                                            name="position"
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., HR Manager, Talent Acquisition"
                                            value={formData.position}
                                            onChange={handleChange}
                                        />
                                        <Briefcase className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="department"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Department
                                    </label>
                                    <select
                                        id="department"
                                        name="department"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.department}
                                        onChange={handleChange}
                                    >
                                        <option value="HR">
                                            Human Resources
                                        </option>
                                        <option value="Engineering">
                                            Engineering
                                        </option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">
                                            Marketing
                                        </option>
                                        <option value="Operations">
                                            Operations
                                        </option>
                                        <option value="Finance">Finance</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Company Information */}
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Company Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="company.name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Company Name
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="company.name"
                                            name="company.name"
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your company name"
                                            value={formData.company.name}
                                            onChange={handleChange}
                                        />
                                        <Building2 className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="company.industry"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Industry
                                    </label>
                                    <select
                                        id="company.industry"
                                        name="company.industry"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.company.industry}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Industry
                                        </option>
                                        <option value="Technology">
                                            Technology
                                        </option>
                                        <option value="Healthcare">
                                            Healthcare
                                        </option>
                                        <option value="Finance">Finance</option>
                                        <option value="Education">
                                            Education
                                        </option>
                                        <option value="Manufacturing">
                                            Manufacturing
                                        </option>
                                        <option value="Retail">Retail</option>
                                        <option value="Construction">
                                            Construction
                                        </option>
                                        <option value="Transportation">
                                            Transportation
                                        </option>
                                        <option value="Media">Media</option>
                                        <option value="Government">
                                            Government
                                        </option>
                                        <option value="Non-profit">
                                            Non-profit
                                        </option>
                                        <option value="Consulting">
                                            Consulting
                                        </option>
                                        <option value="Real Estate">
                                            Real Estate
                                        </option>
                                        <option value="Hospitality">
                                            Hospitality
                                        </option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label
                                        htmlFor="company.size"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Company Size
                                    </label>
                                    <select
                                        id="company.size"
                                        name="company.size"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.company.size}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Company Size
                                        </option>
                                        <option value="1-10">
                                            1-10 employees
                                        </option>
                                        <option value="11-50">
                                            11-50 employees
                                        </option>
                                        <option value="51-200">
                                            51-200 employees
                                        </option>
                                        <option value="201-1000">
                                            201-1000 employees
                                        </option>
                                        <option value="1001-5000">
                                            1001-5000 employees
                                        </option>
                                        <option value="5000+">
                                            5000+ employees
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="company.website"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Company Website
                                    </label>
                                    <input
                                        id="company.website"
                                        name="company.website"
                                        type="url"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://www.company.com"
                                        value={formData.company.website}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label
                                    htmlFor="company.description"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Company Description
                                </label>
                                <textarea
                                    id="company.description"
                                    name="company.description"
                                    rows="3"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Brief description of your company..."
                                    value={formData.company.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label
                                        htmlFor="company.address.city"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        City
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="company.address.city"
                                            name="company.address.city"
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="City"
                                            value={
                                                formData.company.address.city
                                            }
                                            onChange={handleChange}
                                        />
                                        <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="company.address.state"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        State/Province
                                    </label>
                                    <input
                                        id="company.address.state"
                                        name="company.address.state"
                                        type="text"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="State/Province"
                                        value={formData.company.address.state}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="company.address.country"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Country
                                    </label>
                                    <input
                                        id="company.address.country"
                                        name="company.address.country"
                                        type="text"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Country"
                                        value={formData.company.address.country}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Security
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                showPassword
                                                    ? "text"
                                                    : "password"
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
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            required
                                            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>
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

                    <div className="mt-6 text-center">
                        <Link
                            to="/recruiter/login"
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Already have an account? Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterSignup;
