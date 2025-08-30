import React, { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    Video,
    Phone,
    Building2,
    User,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertCircle,
    Edit3,
    MessageSquare,
} from "lucide-react";
import { toast } from "react-toastify";

// API base URL - should match the one in utils/api.js
const API_BASE_URL = "http://localhost:5000/api";

const InterviewManagement = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [candidateNotes, setCandidateNotes] = useState("");

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            const response = await fetch(
                `${API_BASE_URL}/interviews/candidate?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch interviews");
            }

            setInterviews(data.interviews || []);
        } catch (error) {
            console.error("Error fetching interviews:", error);
            toast.error("Failed to load interviews");
            setInterviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const getStatusIcon = (status) => {
        switch (status) {
            case "scheduled":
                return <Clock className="h-5 w-5 text-blue-600" />;
            case "rescheduled":
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case "completed":
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "cancelled":
                return <XCircle className="h-5 w-5 text-red-600" />;
            case "no-show":
                return <XCircle className="h-5 w-5 text-gray-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "scheduled":
                return "bg-blue-100 text-blue-800";
            case "rescheduled":
                return "bg-yellow-100 text-yellow-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            case "no-show":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "video":
                return <Video className="h-4 w-4" />;
            case "phone":
                return <Phone className="h-4 w-4" />;
            case "in-person":
                return <MapPin className="h-4 w-4" />;
            default:
                return <Calendar className="h-4 w-4" />;
        }
    };

    const formatStatus = (status) => {
        return (
            status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")
        );
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString();
    };

    const isUpcoming = (dateTime) => {
        return new Date(dateTime) > new Date();
    };

    const handleAddNotes = (interview) => {
        setSelectedInterview(interview);
        setCandidateNotes(interview.notes?.candidateNotes || "");
        setShowNotesModal(true);
    };

    const saveNotes = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/interviews/${selectedInterview._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                    body: JSON.stringify({
                        candidateNotes,
                    }),
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to save notes");
            }

            toast.success("Notes saved successfully");
            setShowNotesModal(false);
            fetchInterviews();
        } catch (error) {
            console.error("Error saving notes:", error);
            toast.error("Failed to save notes");
        }
    };

    const getInterviewLink = (interview) => {
        if (interview.type === "video" && interview.meetingLink) {
            return (
                <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    Join Meeting
                </a>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Interviews
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage and track all your scheduled interviews
                    </p>
                </div>
                <button
                    onClick={fetchInterviews}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw
                        className={`-ml-0.5 mr-2 h-4 w-4 ${
                            loading ? "animate-spin" : ""
                        }`}
                    />
                    Refresh
                </button>
            </div>

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
                        <option value="all">All Interviews</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Interviews List */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Interviews ({interviews.length})
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
                ) : interviews.length === 0 ? (
                    <div className="p-12 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No interviews found
                        </h3>
                        <p className="mt-2 text-gray-500">
                            {statusFilter === "all"
                                ? "You don't have any scheduled interviews yet."
                                : `No interviews with status "${formatStatus(
                                      statusFilter
                                  )}" found.`}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {interviews.map((interview) => (
                            <div
                                key={interview._id}
                                className="p-6 hover:bg-gray-50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getStatusIcon(
                                                    interview.status
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {interview.title}
                                                </h3>
                                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <Building2 className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                interview.job
                                                                    ?.title
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <User className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                interview
                                                                    .recruiter
                                                                    ?.firstName
                                                            }{" "}
                                                            {
                                                                interview
                                                                    .recruiter
                                                                    ?.lastName
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        {getTypeIcon(
                                                            interview.type
                                                        )}
                                                        <span className="capitalize">
                                                            {interview.type}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-2 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span
                                                            className={
                                                                isUpcoming(
                                                                    interview.scheduledDateTime
                                                                )
                                                                    ? "font-medium text-blue-600"
                                                                    : ""
                                                            }
                                                        >
                                                            {formatDateTime(
                                                                interview.scheduledDateTime
                                                            )}
                                                        </span>
                                                        <span>
                                                            (
                                                            {
                                                                interview.formattedDuration
                                                            }
                                                            )
                                                        </span>
                                                    </div>
                                                </div>

                                                {interview.description && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {interview.description}
                                                    </p>
                                                )}

                                                {/* Interview Details */}
                                                <div className="mt-3 space-y-1 text-sm">
                                                    {interview.type ===
                                                        "video" &&
                                                        interview.meetingLink && (
                                                            <div className="flex items-center space-x-2">
                                                                <Video className="h-4 w-4 text-blue-500" />
                                                                {getInterviewLink(
                                                                    interview
                                                                )}
                                                            </div>
                                                        )}
                                                    {interview.type ===
                                                        "phone" &&
                                                        interview.phoneNumber && (
                                                            <div className="flex items-center space-x-2">
                                                                <Phone className="h-4 w-4 text-green-500" />
                                                                <span className="font-medium">
                                                                    {
                                                                        interview.phoneNumber
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    {interview.type ===
                                                        "in-person" &&
                                                        interview.location && (
                                                            <div className="flex items-center space-x-2">
                                                                <MapPin className="h-4 w-4 text-red-500" />
                                                                <span>
                                                                    {
                                                                        interview.location
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>

                                                {/* Notes */}
                                                {interview.notes
                                                    ?.candidateNotes && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-sm font-medium text-blue-800">
                                                            My Notes:
                                                        </p>
                                                        <p className="text-sm text-blue-700 mt-1">
                                                            {
                                                                interview.notes
                                                                    .candidateNotes
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                {interview.notes
                                                    ?.recruiterNotes && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm font-medium text-gray-800">
                                                            Recruiter Notes:
                                                        </p>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            {
                                                                interview.notes
                                                                    .recruiterNotes
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-3 ml-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                interview.status
                                            )}`}
                                        >
                                            {formatStatus(interview.status)}
                                        </span>

                                        <button
                                            onClick={() =>
                                                handleAddNotes(interview)
                                            }
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                        >
                                            <MessageSquare className="h-3 w-3 mr-1" />
                                            {interview.notes?.candidateNotes
                                                ? "Edit Notes"
                                                : "Add Notes"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Add Notes for Interview
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {selectedInterview?.title}
                            </p>
                            <textarea
                                value={candidateNotes}
                                onChange={(e) =>
                                    setCandidateNotes(e.target.value)
                                }
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add your notes about this interview..."
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setShowNotesModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveNotes}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                                >
                                    Save Notes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewManagement;
