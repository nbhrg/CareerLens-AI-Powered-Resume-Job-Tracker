import React from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Upload,
    BarChart3,
    Users,
    Briefcase,
    ArrowRight,
} from "lucide-react";

const Home = () => {
    const features = [
        {
            icon: Upload,
            title: "Smart Resume Parsing",
            description:
                "Upload your resume and our AI will extract and organize your information automatically.",
        },
        {
            icon: Search,
            title: "Advanced Job Search",
            description:
                "Find the perfect job with our intelligent matching system and comprehensive filters.",
        },
        {
            icon: BarChart3,
            title: "Application Tracking",
            description:
                "Keep track of all your applications with real-time status updates and analytics.",
        },
        {
            icon: Users,
            title: "For Recruiters",
            description:
                "Streamline your hiring process with advanced candidate management tools.",
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Find Your Dream Job with{" "}
                            <span className="text-blue-200">JobOrbit</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Smart job board with advanced resume parsing and
                            application tracking
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/candidate/signup"
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
                            >
                                Get Started as Job Seeker
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                to="/recruiter/signup"
                                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                            >
                                I'm a Recruiter
                                <Briefcase className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose JobOrbit?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our platform combines cutting-edge technology with
                            user-friendly design to revolutionize your job
                            search experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                10K+
                            </div>
                            <div className="text-gray-600">Active Jobs</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                50K+
                            </div>
                            <div className="text-gray-600">
                                Registered Users
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                1K+
                            </div>
                            <div className="text-gray-600">Companies</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                95%
                            </div>
                            <div className="text-gray-600">Success Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join thousands of job seekers and recruiters who trust
                        JobOrbit
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/candidate/signup"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Sign Up Now
                        </Link>
                        <Link
                            to="/about"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
