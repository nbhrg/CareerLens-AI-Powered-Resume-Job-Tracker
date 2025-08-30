import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Menu, X, Briefcase, User, LogOut } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/");
        setIsOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Briefcase className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">
                                JobOrbit
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive("/")
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/about"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive("/about")
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                        >
                            About
                        </Link>

                        {!user ? (
                            <>
                                <Link
                                    to="/candidate/jobs"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive("/candidate/jobs")
                                            ? "text-blue-600 bg-blue-50"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                    }`}
                                >
                                    Browse Jobs
                                </Link>
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/candidate/login"
                                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Job Seeker Login
                                    </Link>
                                    <Link
                                        to="/recruiter/login"
                                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Recruiter Login
                                    </Link>
                                    <Link
                                        to="/candidate/signup"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to={
                                        user.role === "candidate"
                                            ? "/candidate/dashboard"
                                            : "/recruiter/dashboard"
                                    }
                                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Welcome, {user.name || user.email}
                                </Link>
                                <div className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-gray-500" />
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 cursor-pointer"
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                        <Link
                            to="/"
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                isActive("/")
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/about"
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                isActive("/about")
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                            onClick={() => setIsOpen(false)}
                        >
                            About
                        </Link>

                        {!user ? (
                            <>
                                <Link
                                    to="/candidate/jobs"
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                        isActive("/candidate/jobs")
                                            ? "text-blue-600 bg-blue-50"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                    }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Browse Jobs
                                </Link>
                                <div className="border-t border-gray-200 pt-4">
                                    <Link
                                        to="/candidate/login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Job Seeker Login
                                    </Link>
                                    <Link
                                        to="/recruiter/login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Recruiter Login
                                    </Link>
                                    <Link
                                        to="/candidate/signup"
                                        className="block px-3 py-2 mt-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-colors text-center"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="border-t border-gray-200 pt-4">
                                <Link
                                    to={
                                        user.role === "candidate"
                                            ? "/candidate/dashboard"
                                            : "/recruiter/dashboard"
                                    }
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="text-base font-medium text-gray-800">
                                        {user.name || user.email}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {user.role}
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
