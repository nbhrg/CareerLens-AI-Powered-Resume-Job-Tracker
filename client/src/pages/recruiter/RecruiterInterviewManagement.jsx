import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
    UserPlus,
    Star,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import { toast } from "react-toastify";
import InterviewScheduler from "../../components/InterviewScheduler";

// API base URL - should match the one in utils/api.js
const API_BASE_URL = "http://localhost:5000/api";

const RecruiterInterviewManagement = () => {
    const location = useLocation();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const [feedback, setFeedback] = useState({
        rating: 5,
        comments: "",
        strengths: [],
        weaknesses: [],
        recommendation: "hire",
        interviewNotes: "",
    });

    // Check if we came from applicants page with candidate info
    useEffect(() => {
        if (location.state?.fromApplicants) {
            setShowScheduler(true);
            toast.info(`Opening scheduler for ${location.state.candidateName}`);
        }
    }, [location.state]);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            const response = await fetch(
                `${API_BASE_URL}/interviews/recruiter?${params}`,
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

    const handleAddFeedback = (interview) => {
        setSelectedInterview(interview);
        setFeedback({
            rating: interview.feedback?.rating || 5,
            comments: interview.feedback?.comments || "",
            strengths: interview.feedback?.strengths || [],
            weaknesses: interview.feedback?.weaknesses || [],
            recommendation: interview.feedback?.recommendation || "hire",
            interviewNotes: interview.notes?.interviewNotes || "",
        });
        setShowFeedbackModal(true);
    };

    const saveFeedback = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/interviews/${selectedInterview._id}/feedback`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                    body: JSON.stringify(feedback),
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to save feedback");
            }

            toast.success("Feedback saved successfully");
            setShowFeedbackModal(false);
            fetchInterviews();
        } catch (error) {
            console.error("Error saving feedback:", error);
            toast.error("Failed to save feedback");
        }
    };

    const getRecommendationIcon = (recommendation) => {
        switch (recommendation) {
            case "hire":
                return <ThumbsUp className="h-4 w-4 text-green-600" />;
            case "reject":
                return <ThumbsDown className="h-4 w-4 text-red-600" />;
            case "maybe":
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case "next-round":
                return <UserPlus className="h-4 w-4 text-blue-600" />;
            default:
                return null;
        }
    };

    const handleInterviewScheduled = (newInterview) => {
        setInterviews((prev) => [newInterview, ...prev]);
    };

    return (
        <div className="space-y-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Interview Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Schedule and manage interviews with candidates
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowScheduler(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Schedule Interview
                    </button>
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
                                ? "You haven't scheduled any interviews yet."
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
                                                                    .candidate
                                                                    ?.firstName
                                                            }{" "}
                                                            {
                                                                interview
                                                                    .candidate
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
                                                                <a
                                                                    href={
                                                                        interview.meetingLink
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 underline"
                                                                >
                                                                    {
                                                                        interview.meetingLink
                                                                    }
                                                                </a>
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

                                                {/* Feedback Display */}
                                                {interview.feedback && (
                                                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-sm font-medium text-green-800">
                                                                Interview
                                                                Feedback
                                                            </p>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="flex items-center">
                                                                    {[
                                                                        ...Array(
                                                                            5
                                                                        ),
                                                                    ].map(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) => (
                                                                            <Star
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className={`h-4 w-4 ${
                                                                                    i <
                                                                                    interview
                                                                                        .feedback
                                                                                        .rating
                                                                                        ? "text-yellow-400 fill-current"
                                                                                        : "text-gray-300"
                                                                                }`}
                                                                            />
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    {getRecommendationIcon(
                                                                        interview
                                                                            .feedback
                                                                            .recommendation
                                                                    )}
                                                                    <span className="text-sm font-medium capitalize">
                                                                        {interview.feedback.recommendation.replace(
                                                                            "-",
                                                                            " "
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {interview.feedback
                                                            .comments && (
                                                            <p className="text-sm text-green-700">
                                                                {
                                                                    interview
                                                                        .feedback
                                                                        .comments
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {interview.notes
                                                    ?.recruiterNotes && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-sm font-medium text-blue-800">
                                                            My Notes:
                                                        </p>
                                                        <p className="text-sm text-blue-700 mt-1">
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

                                        {(interview.status === "scheduled" ||
                                            interview.status ===
                                                "rescheduled") && (
                                            <button
                                                onClick={() =>
                                                    handleAddFeedback(interview)
                                                }
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <MessageSquare className="h-3 w-3 mr-1" />
                                                Add Feedback
                                            </button>
                                        )}

                                        {interview.feedback && (
                                            <button
                                                onClick={() =>
                                                    handleAddFeedback(interview)
                                                }
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <Edit3 className="h-3 w-3 mr-1" />
                                                Edit Feedback
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Interview Feedback
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                {selectedInterview?.title} -{" "}
                                {selectedInterview?.candidate?.firstName}{" "}
                                {selectedInterview?.candidate?.lastName}
                            </p>

                            <div className="space-y-4">
                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Overall Rating
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() =>
                                                    setFeedback((prev) => ({
                                                        ...prev,
                                                        rating,
                                                    }))
                                                }
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`h-6 w-6 ${
                                                        rating <=
                                                        feedback.rating
                                                            ? "text-yellow-400 fill-current"
                                                            : "text-gray-300"
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">
                                            ({feedback.rating}/5)
                                        </span>
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Recommendation
                                    </label>
                                    <select
                                        value={feedback.recommendation}
                                        onChange={(e) =>
                                            setFeedback((prev) => ({
                                                ...prev,
                                                recommendation: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="hire">Hire</option>
                                        <option value="reject">Reject</option>
                                        <option value="maybe">Maybe</option>
                                        <option value="next-round">
                                            Next Round
                                        </option>
                                    </select>
                                </div>

                                {/* Comments */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Comments
                                    </label>
                                    <textarea
                                        value={feedback.comments}
                                        onChange={(e) =>
                                            setFeedback((prev) => ({
                                                ...prev,
                                                comments: e.target.value,
                                            }))
                                        }
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Overall feedback about the candidate..."
                                    />
                                </div>

                                {/* Interview Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Interview Notes
                                    </label>
                                    <textarea
                                        value={feedback.interviewNotes}
                                        onChange={(e) =>
                                            setFeedback((prev) => ({
                                                ...prev,
                                                interviewNotes: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Notes about the interview process..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowFeedbackModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveFeedback}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview Scheduler Modal */}
            {showScheduler && (
                <InterviewScheduler
                    isOpen={showScheduler}
                    onClose={() => setShowScheduler(false)}
                    onInterviewScheduled={handleInterviewScheduled}
                    jobDetails={
                        location.state?.fromApplicants
                            ? {
                                  id: location.state.jobId,
                                  title: location.state.jobTitle,
                              }
                            : {}
                    }
                    candidateDetails={
                        location.state?.fromApplicants
                            ? {
                                  id: location.state.candidateId,
                                  name: location.state.candidateName,
                                  email: location.state.candidateEmail,
                              }
                            : {}
                    }
                />
            )}
        </div>
    );
};

export default RecruiterInterviewManagement;
