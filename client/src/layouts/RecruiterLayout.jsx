import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
    Home,
    Plus,
    Users,
    BarChart3,
    Settings,
    Building2,
    Calendar,
} from "lucide-react";

const RecruiterLayout = () => {
    const { user } = useAuth();
    const location = useLocation();

    const sidebarItems = [
        {
            name: "Dashboard",
            href: "/recruiter/dashboard",
            icon: Home,
        },
        {
            name: "Post Job",
            href: "/recruiter/post-job",
            icon: Plus,
        },
        {
            name: "Manage Applicants",
            href: "/recruiter/applicants",
            icon: Users,
        },
        {
            name: "Interview Management",
            href: "/recruiter/interviews",
            icon: Calendar,
        },
    ];

    const isActive = (href) => location.pathname === href;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                                Recruiter Portal
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {user?.name}
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 flex-grow flex flex-col">
                        <nav className="flex-1 px-2 space-y-1">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`${
                                            isActive(item.href)
                                                ? "bg-blue-100 text-blue-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                                    >
                                        <Icon
                                            className={`${
                                                isActive(item.href)
                                                    ? "text-blue-500"
                                                    : "text-gray-400"
                                            } mr-3 flex-shrink-0 h-6 w-6`}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RecruiterLayout;
