import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-blue-600">404</h1>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h2>

                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Sorry, we couldn't find the page you're looking for. It
                    might have been moved, deleted, or the URL might be
                    incorrect.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Home className="mr-2 h-5 w-5" />
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Go Back
                    </button>
                </div>

                <div className="mt-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Popular Pages
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <Link
                            to="/candidate/jobs"
                            className="text-blue-600 hover:underline"
                        >
                            Browse Jobs
                        </Link>
                        <Link
                            to="/candidate/signup"
                            className="text-blue-600 hover:underline"
                        >
                            Job Seeker Signup
                        </Link>
                        <Link
                            to="/recruiter/signup"
                            className="text-blue-600 hover:underline"
                        >
                            Recruiter Signup
                        </Link>
                        <Link
                            to="/about"
                            className="text-blue-600 hover:underline"
                        >
                            About Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
