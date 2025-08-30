import React from "react";
import { Link } from "react-router-dom";
import {
    Briefcase,
    Mail,
    Phone,
    MapPin,
    Github,
    Linkedin,
    Twitter,
} from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <Briefcase className="h-8 w-8 text-blue-400" />
                            <span className="text-xl font-bold">JobOrbit</span>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Your smart job board platform with advanced resume
                            parsing and application tracking.
                        </p>
                        <div className="flex space-x-4">
                            <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                            <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                            <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/candidate/signup"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Job Seekers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/recruiter/signup"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Recruiters
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Contact Support
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <div className="space-y-2 items-center justify-center flex flex-col">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-blue-400" />
                                <span className="text-gray-300">
                                    contact@joborbit.com
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-blue-400" />
                                <span className="text-gray-300">
                                    +1 (555) 123-4567
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-blue-400" />
                                <span className="text-gray-300">
                                    New York, NY 10001
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400">
                        &copy; 2025 JobOrbit. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
