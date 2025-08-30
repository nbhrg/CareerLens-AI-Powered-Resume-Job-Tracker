import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
    BarChart3,
    FileText,
    Calendar,
    Search,
    Upload,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader,
} from "lucide-react";
import { jobsAPI } from "../../utils/api";
import { useAuth } from "../../context/useAuth";

const CandidateDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        {
            name: "Applications Sent",
            value: "0",
            icon: FileText,
            color: "bg-blue-500",
        },
        {
            name: "Interviews",
            value: "0",
            icon: Calendar,
            color: "bg-green-500",
        },
        {
            name: "Saved Jobs",
            value: "0",
            icon: BarChart3,
            color: "bg-orange-500",
        },
    ]);

    const [recentApplications, setRecentApplications] = useState([]);
    const [, setSavedJobs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch job applications
                const applicationsResponse = await jobsAPI.getApplications();

                // Extract applications array from response
                const applications =
                    applicationsResponse.applications ||
                    applicationsResponse ||
                    [];

                // Ensure applications is an array
                if (!Array.isArray(applications)) {
                    console.error(
                        "Applications is not an array:",
                        applications
                    );
                    throw new Error("Invalid applications data format");
                }

                // Fetch saved jobs
                const saved = await jobsAPI.getSavedJobs();
                setSavedJobs(saved);

                // Map the applications to the format expected by the UI
                const formattedApplications = applications.map((app) => ({
                    id: app.id,
                    jobId: app.jobId,
                    company: app.company,
                    position: app.position,
                    status: mapStatusToUI(app.status),
                    date: app.appliedDate,
                    statusColor: getStatusColor(app.status),
                }));

                setRecentApplications(formattedApplications);

                // Update stats
                setStats([
                    {
                        name: "Applications Sent",
                        value: applications.length.toString(),
                        icon: FileText,
                        color: "bg-blue-500",
                    },
                    {
                        name: "Interviews",
                        value: applications
                            .filter((app) => app.status === "interviewed")
                            .length.toString(),
                        icon: Calendar,
                        color: "bg-green-500",
                    },
                    {
                        name: "Saved Jobs",
                        value: saved.length.toString(),
                        icon: BarChart3,
                        color: "bg-orange-500",
                    },
                ]);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(
                    "Failed to load dashboard data. Please try again later."
                );
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Helper function to map API status to UI status
    const mapStatusToUI = (status) => {
        switch (status) {
            case "applied":
                return "Applied";
            case "under-review":
                return "Interviewing";
            case "interviewed":
                return "Interviewing";
            case "hired":
                return "Offer";
            case "rejected":
                return "Rejected";
            default:
                return "Applied";
        }
    };

    // Helper function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "applied":
                return "bg-blue-100 text-blue-800";
            case "under-review":
            case "interviewed":
                return "bg-yellow-100 text-yellow-800";
            case "hired":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-blue-100 text-blue-800";
        }
    };

    const quickActions = [
        {
            title: "Browse Jobs",
            description: "Discover new opportunities",
            icon: Search,
            link: "/candidate/jobs",
            color: "bg-blue-500",
        },
        {
            title: "Upload Resume",
            description: "Update your resume",
            icon: Upload,
            link: "/candidate/upload-resume",
            color: "bg-green-500",
        },
        {
            title: "Applications",
            description: "Track your progress",
            icon: BarChart3,
            link: "/candidate/applications",
            color: "bg-orange-500",
        },
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case "Applied":
                return <Clock className="h-4 w-4" />;
            case "Interviewing":
                return <AlertCircle className="h-4 w-4" />;
            case "Offer":
                return <CheckCircle className="h-4 w-4" />;
            case "Rejected":
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Welcome back{user ? `, ${user.firstName}` : ""}! Here's
                        your job search overview.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="h-8 w-8 animate-spin text-blue-500 mr-3" />
                        <p className="text-gray-600">
                            Loading your dashboard...
                        </p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-blue-600 hover:underline cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
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
                    </>
                )}

                {!loading && !error && (
                    /* Quick Actions */
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.title}
                                        to={action.link}
                                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div
                                                className={`${action.color} p-2 rounded-md`}
                                            >
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {action.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Recent Applications */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Recent Applications
                                </h2>
                                <Link
                                    to="/candidate/applications"
                                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {recentApplications.length === 0 ? (
                                    <div className="px-6 py-8 text-center">
                                        <p className="text-gray-500 mb-4">
                                            You haven't applied to any jobs yet.
                                        </p>
                                        <Link
                                            to="/candidate/jobs"
                                            className="inline-flex items-center text-blue-600 hover:underline"
                                        >
                                            <Search className="h-4 w-4 mr-1" />
                                            Browse jobs
                                        </Link>
                                    </div>
                                ) : (
                                    recentApplications
                                        .slice(0, 5)
                                        .map((application) => (
                                            <div
                                                key={application.id}
                                                className="px-6 py-4 hover:bg-gray-50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-sm font-medium text-gray-900">
                                                            {
                                                                application.position
                                                            }
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                application.company
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Applied on{" "}
                                                            {new Date(
                                                                application.date
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${application.statusColor}`}
                                                        >
                                                            {getStatusIcon(
                                                                application.status
                                                            )}
                                                            <span className="ml-1">
                                                                {
                                                                    application.status
                                                                }
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CandidateDashboard;
