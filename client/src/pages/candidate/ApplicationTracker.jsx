import React, { useState, useEffect, useCallback } from "react";
import {
    Calendar,
    MapPin,
    Building2,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    RefreshCw,
    User,
} from "lucide-react";
import { candidateAPI } from "../../utils/api";

const ApplicationTracker = () => {
    const [statusFilter, setStatusFilter] = useState("all");
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        applied: 0,
        interviewed: 0,
        hired: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== "all") {
                params.status = statusFilter;
            }

            const response = await candidateAPI.getApplications(params);
            setApplications(response.applications || []);
            setStats(
                response.stats || {
                    total: 0,
                    applied: 0,
                    interviewed: 0,
                    hired: 0,
                    rejected: 0,
                }
            );
            setError(null);
        } catch (err) {
            setError(err.message || "Failed to fetch applications");
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const getStatusIcon = (status) => {
        switch (status) {
            case "applied":
                return <Clock className="h-5 clw-5 text-blue-600" />;
            case "interviewed":
                return <Eye className="h-5 w-5 text-purple-600" />;
            case "hired":
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "rejected":
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "applied":
                return "bg-blue-100 text-blue-800";
            case "interviewed":
                return "bg-purple-100 text-purple-800";
            case "hired":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatStatus = (status) => {
        switch (status) {
            case "applied":
                return "Applied";
            case "interviewed":
                return "Interviewed";
            case "hired":
                return "Hired";
            case "rejected":
                return "Rejected";
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Application Tracker
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Track the status of all your job applications
                    </p>
                </div>
                <button
                    onClick={fetchApplications}
                    disabled={loading}
                    className="inline-flex cursor-pointer items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 "
                >
                    <RefreshCw
                        className={`-ml-0.5 mr-2 h-4 w-4 ${
                            loading ? "animate-spin" : ""
                        }`}
                    />
                    Refresh
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-red-800 font-medium">
                            Error loading applications
                        </p>
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={fetchApplications}
                            className="text-red-600 hover:text-red-800 text-sm underline mt-1 cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-lg shadow animate-pulse"
                        >
                            <div className="flex items-center">
                                <div className="bg-gray-300 h-8 w-8 rounded"></div>
                                <div className="ml-4 space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                                    <div className="h-6 bg-gray-300 rounded w-8"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Applied
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.applied}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <Eye className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Interviewed
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.interviewed}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Hired
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.hired}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <XCircle className="h-8 w-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Rejected
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.rejected}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">
                        Filter by status:
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        disabled={loading}
                    >
                        <option value="all">All Applications</option>
                        <option value="applied">Applied</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Applications List */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        My Applications ({applications.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="p-6">
                        <div className="animate-pulse space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center space-x-4"
                                >
                                    <div className="bg-gray-300 rounded h-5 w-5"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                                    </div>
                                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="p-12 text-center">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No applications found
                        </h3>
                        <p className="mt-2 text-gray-500">
                            {statusFilter === "all"
                                ? "You haven't applied to any jobs yet."
                                : `No applications with status "${formatStatus(
                                      statusFilter
                                  )}" found.`}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="p-6 hover:bg-gray-50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getStatusIcon(
                                                    application.status
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {application.position}
                                                </h3>
                                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <Building2 className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                application.company
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                application.location
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            Applied{" "}
                                                            {new Date(
                                                                application.appliedDate
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Salary: {application.salary}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 ml-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                application.status
                                            )}`}
                                        >
                                            {formatStatus(application.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationTracker;
