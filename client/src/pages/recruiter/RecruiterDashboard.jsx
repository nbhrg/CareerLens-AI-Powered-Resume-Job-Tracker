import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, BarChart3, Calendar, AlertCircle } from "lucide-react";
import { recruiterAPI } from "../../utils/api";

const RecruiterDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await recruiterAPI.getDashboard();
            setDashboardData(response.data.stats);
            setError(null);
        } catch (err) {
            setError(err.message || "Failed to fetch dashboard stats");
        } finally {
            setLoading(false);
        }
    };

    const getStatsArray = () => {
        if (!dashboardData) return [];

        return [
            {
                name: "Active Jobs",
                value: dashboardData.activeJobs?.toString() || "0",
                icon: BarChart3,
                color: "bg-blue-500",
            },
            {
                name: "Total Applications",
                value:
                    dashboardData.totalApplicationsReceived?.toString() || "0",
                icon: Users,
                color: "bg-green-500",
            },
            {
                name: "Jobs Posted",
                value: dashboardData.totalJobsPosted?.toString() || "0",
                icon: Calendar,
                color: "bg-yellow-500",
            },
            {
                name: "Total Hires",
                value: dashboardData.totalHires?.toString() || "0",
                icon: Plus,
                color: "bg-purple-500",
            },
        ];
    };

    const stats = getStatsArray();

    return (
        <div className="space-y-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Recruiter Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your job postings and applicants
                    </p>
                </div>
                <button
                    onClick={fetchDashboardStats}
                    disabled={loading}
                    className="inline-flex cursor-pointer items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg
                        className={`-ml-0.5 mr-2 h-4 w-4 ${
                            loading ? "animate-spin" : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-red-800 font-medium">
                            Error loading dashboard
                        </p>
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={fetchDashboardStats}
                            className="text-red-600 hover:text-red-800 text-sm underline mt-1 cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white overflow-hidden shadow rounded-lg animate-pulse"
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-gray-300 p-3 rounded-md h-12 w-12"></div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1 space-y-2">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Stats Grid */
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.name}
                                className="bg-white overflow-hidden shadow rounded-lg"
                            >
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div
                                                className={`${stat.color} p-3 rounded-md`}
                                            >
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    {stat.name}
                                                </dt>
                                                <dd className="text-2xl font-bold text-gray-900">
                                                    {stat.value}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link
                        to="/recruiter/post-job"
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                    >
                        <Plus className="h-8 w-8 text-gray-400 mb-2" />
                        <h3 className="font-medium text-gray-900">
                            Post New Job
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Create a new job listing
                        </p>
                    </Link>
                    <Link
                        to="/recruiter/applicants"
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                    >
                        <Users className="h-8 w-8 text-gray-400 mb-2" />
                        <h3 className="font-medium text-gray-900">
                            Review Applicants
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Manage job applications
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
