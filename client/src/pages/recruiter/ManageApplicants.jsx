import React, { useState, useEffect, useCallback } from "react";
import {
    User,
    Mail,
    Phone,
    FileText,
    Eye,
    Check,
    X,
    AlertCircle,
    RefreshCw,
    Calendar,
    MapPin,
    Briefcase,
    GraduationCap,
    Award,
    Clock,
    XIcon,
    CalendarPlus,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { recruiterAPI } from "../../utils/api";
import ResumeViewer from "../../components/ResumeViewer";

const ManageApplicants = () => {
    const navigate = useNavigate();
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [sortBy, setSortBy] = useState("appliedDate"); // New sorting state
    const [sortOrder, setSortOrder] = useState("desc"); // New sorting order state
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showResumeViewer, setShowResumeViewer] = useState(false);
    const [selectedResumeCandidate, setSelectedResumeCandidate] =
        useState(null);

    const fetchApplicants = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedStatus !== "all") {
                params.status = selectedStatus;
            }

            const response = await recruiterAPI.getApplicants(params);
            setApplicants(response.applicants || []);
            setError(null);
        } catch (err) {
            setError(err.message || "Failed to fetch applicants");
            setApplicants([]);
        } finally {
            setLoading(false);
        }
    }, [selectedStatus]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const getStatusColor = (status) => {
        switch (status) {
            case "applied":
                return "bg-blue-100 text-blue-800";
            case "under-review":
                return "bg-yellow-100 text-yellow-800";
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
            case "under-review":
                return "Under Review";
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

    // Helper function to check if hiring is possible for a job
    const canHireForJob = (jobId, applicants) => {
        const jobApplicants = applicants.filter((app) => app.jobId === jobId);
        const job = jobApplicants[0]; // Get job info from first applicant
        if (!job || !job.numberOfOpenings) return true; // Default to true if info not available

        const hiredCount = jobApplicants.filter(
            (app) => app.status === "hired"
        ).length;
        return hiredCount < job.numberOfOpenings;
    };

    const updateApplicationStatus = async (applicant, newStatus) => {
        const statusKey = `${applicant.jobId}-${applicant.candidateId}`;

        try {
            setUpdatingStatus((prev) => ({ ...prev, [statusKey]: true }));

            await recruiterAPI.updateApplicationStatus(
                applicant.jobId,
                applicant.candidateId,
                newStatus
            );

            // Update local state
            setApplicants((prev) =>
                prev.map((app) =>
                    app.id === applicant.id
                        ? { ...app, status: newStatus }
                        : app
                )
            );

            toast.success(
                `Application status updated to ${formatStatus(newStatus)}`
            );
        } catch (err) {
            toast.error(err.message || "Failed to update application status");
        } finally {
            setUpdatingStatus((prev) => ({ ...prev, [statusKey]: false }));
        }
    };

    const handleViewApplication = (applicant) => {
        setSelectedApplicant(applicant);
        setShowModal(true);
    };

    const handleResumeError = useCallback((errorMessage) => {
        // Show toast only for resume-related errors
        if (
            errorMessage.includes("Resume not found") ||
            errorMessage.includes("not found")
        ) {
            toast.error(errorMessage);
        }
    }, []);

    const handleViewResume = (applicant) => {
        if (!applicant.candidateId) {
            toast.error(
                "Unable to view resume: Candidate information not available"
            );
            return;
        }

        setSelectedResumeCandidate({
            id: applicant.candidateId,
            name: applicant.name,
        });
        setShowResumeViewer(true);
        // Don't show a toast here since the ResumeViewer will handle any errors
    };

    const handleScheduleInterview = (applicant) => {
        // Navigate to interview management page with candidate and job information
        navigate("/recruiter/interviews", {
            state: {
                candidateId: applicant.candidateId,
                candidateName: applicant.name,
                candidateEmail: applicant.email,
                jobId: applicant.jobId,
                jobTitle: applicant.jobTitle,
                fromApplicants: true,
            },
        });
    };

    const handleAcceptApplicant = (applicant) => {
        // Prevent hiring if candidate was previously rejected
        if (applicant.status === "rejected") {
            toast.error("Cannot hire a candidate who has been rejected");
            return;
        }

        // Check if positions are available for this job
        if (!canHireForJob(applicant.jobId, applicants)) {
            toast.error("All positions for this job have been filled");
            return;
        }

        updateApplicationStatus(applicant, "hired");
    };

    const handleRejectApplicant = (applicant) => {
        updateApplicationStatus(applicant, "rejected");
    };

    // Sorting function for applicants
    const sortApplicants = (applicantsToSort) => {
        return [...applicantsToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case "name":
                    aValue = a.name?.toLowerCase() || "";
                    bValue = b.name?.toLowerCase() || "";
                    break;
                case "appliedDate":
                    aValue = new Date(a.appliedDate);
                    bValue = new Date(b.appliedDate);
                    break;
                case "profileCompleteness":
                    aValue = a.candidate?.profileCompleteness || 0;
                    bValue = b.candidate?.profileCompleteness || 0;
                    break;
                case "experience":
                    aValue = a.candidate?.experience || 0;
                    bValue = b.candidate?.experience || 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortOrder === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortOrder === "asc" ? 1 : -1;
            }
            return 0;
        });
    };

    // Get sorted applicants
    const sortedApplicants = sortApplicants(applicants);

    // Modal component for viewing application details
    const ApplicationModal = () => {
        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        };

        const closeModal = () => {
            setShowModal(false);
            setSelectedApplicant(null);
        };

        // Handle escape key press
        React.useEffect(() => {
            if (!showModal) return;

            const handleEscape = (event) => {
                if (event.key === "Escape") {
                    closeModal();
                }
            };

            document.addEventListener("keydown", handleEscape);
            return () => {
                document.removeEventListener("keydown", handleEscape);
            };
        }, []);

        if (!showModal || !selectedApplicant) return null;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
                onClick={closeModal}
            >
                <div
                    className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            <div className="bg-blue-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                                <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                                    {selectedApplicant.name}
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 truncate">
                                    Application for {selectedApplicant.jobTitle}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2 cursor-pointer"
                        >
                            <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Application Status and Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="h-5 w-5 text-gray-500" />
                                    <h3 className="font-semibold text-gray-900">
                                        Application Status
                                    </h3>
                                </div>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                        selectedApplicant.status
                                    )}`}
                                >
                                    {formatStatus(selectedApplicant.status)}
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <h3 className="font-semibold text-gray-900">
                                        Applied On
                                    </h3>
                                </div>
                                <p className="text-gray-700">
                                    {formatDate(selectedApplicant.appliedDate)}
                                </p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <User className="h-5 w-5 text-gray-500" />
                                <span>Contact Information</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">
                                        {selectedApplicant.email}
                                    </span>
                                </div>
                                {selectedApplicant.phone && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700">
                                            {selectedApplicant.phone}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Personal Information */}
                        {(selectedApplicant.candidate?.dateOfBirth ||
                            selectedApplicant.candidate?.address ||
                            selectedApplicant.candidate?.phone) && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <User className="h-5 w-5 text-gray-500" />
                                    <span>Personal Information</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedApplicant.candidate
                                        ?.dateOfBirth && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                Age
                                            </label>
                                            <p className="text-gray-700">
                                                {new Date().getFullYear() -
                                                    new Date(
                                                        selectedApplicant.candidate.dateOfBirth
                                                    ).getFullYear()}{" "}
                                                years
                                            </p>
                                        </div>
                                    )}
                                    {selectedApplicant.candidate?.address && (
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">
                                                    Location
                                                </label>
                                                <p className="text-gray-700">
                                                    {[
                                                        selectedApplicant
                                                            .candidate.address
                                                            .city,
                                                        selectedApplicant
                                                            .candidate.address
                                                            .state,
                                                        selectedApplicant
                                                            .candidate.address
                                                            .country,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedApplicant.candidate?.phone && (
                                        <div className="flex items-start space-x-2">
                                            <Phone className="h-4 w-4 text-gray-500 mt-1" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">
                                                    Phone (Additional)
                                                </label>
                                                <p className="text-gray-700">
                                                    {
                                                        selectedApplicant
                                                            .candidate.phone
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Professional Information */}
                        {(selectedApplicant.candidate?.experience ||
                            selectedApplicant.candidate?.expectedSalary ||
                            selectedApplicant.candidate?.preferredJobType) && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <Briefcase className="h-5 w-5 text-gray-500" />
                                    <span>Professional Information</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedApplicant.candidate?.experience !==
                                        undefined && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                Experience
                                            </label>
                                            <p className="text-gray-700">
                                                {
                                                    selectedApplicant.candidate
                                                        .experience
                                                }{" "}
                                                years
                                            </p>
                                        </div>
                                    )}
                                    {selectedApplicant.candidate
                                        ?.preferredJobType && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                Preferred Job Type
                                            </label>
                                            <p className="text-gray-700 capitalize">
                                                {selectedApplicant.candidate.preferredJobType.replace(
                                                    "-",
                                                    " "
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    {selectedApplicant.candidate
                                        ?.expectedSalary && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                Expected Salary
                                            </label>
                                            <p className="text-gray-700">
                                                {selectedApplicant.candidate
                                                    .expectedSalary.min &&
                                                selectedApplicant.candidate
                                                    .expectedSalary.max
                                                    ? `${
                                                          selectedApplicant
                                                              .candidate
                                                              .expectedSalary
                                                              .currency || "USD"
                                                      } ${selectedApplicant.candidate.expectedSalary.min.toLocaleString()} - ${selectedApplicant.candidate.expectedSalary.max.toLocaleString()}`
                                                    : "Not specified"}
                                            </p>
                                        </div>
                                    )}
                                    {selectedApplicant.candidate
                                        ?.preferredLocations &&
                                        selectedApplicant.candidate
                                            .preferredLocations.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">
                                                    Preferred Locations
                                                </label>
                                                <p className="text-gray-700">
                                                    {selectedApplicant.candidate.preferredLocations.join(
                                                        ", "
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {selectedApplicant.candidate?.education &&
                            selectedApplicant.candidate.education.length >
                                0 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                        <GraduationCap className="h-5 w-5 text-gray-500" />
                                        <span>Education</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedApplicant.candidate.education.map(
                                            (edu, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-white rounded-lg p-3 border"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {edu.degree && (
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-500">
                                                                    Degree
                                                                </label>
                                                                <p className="text-gray-700">
                                                                    {edu.degree}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {edu.institution && (
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-500">
                                                                    Institution
                                                                </label>
                                                                <p className="text-gray-700">
                                                                    {
                                                                        edu.institution
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                        {edu.graduationYear && (
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-500">
                                                                    Graduation
                                                                    Year
                                                                </label>
                                                                <p className="text-gray-700">
                                                                    {
                                                                        edu.graduationYear
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                        {edu.grade && (
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-500">
                                                                    Grade/GPA
                                                                </label>
                                                                <p className="text-gray-700">
                                                                    {edu.grade}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Skills */}
                        {selectedApplicant.candidate?.skills &&
                            selectedApplicant.candidate.skills.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                        <Award className="h-5 w-5 text-gray-500" />
                                        <span>Skills</span>
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApplicant.candidate.skills.map(
                                            (skill, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Portfolio & Links */}
                        {(selectedApplicant.candidate?.portfolioUrl ||
                            selectedApplicant.candidate?.linkedinUrl) && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-gray-500" />
                                    <span>Portfolio & Links</span>
                                </h3>
                                <div className="space-y-3">
                                    {selectedApplicant.candidate
                                        .portfolioUrl && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                Portfolio
                                            </label>
                                            <a
                                                href={
                                                    selectedApplicant.candidate
                                                        .portfolioUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-blue-600 hover:text-blue-800 underline"
                                            >
                                                {
                                                    selectedApplicant.candidate
                                                        .portfolioUrl
                                                }
                                            </a>
                                        </div>
                                    )}
                                    {selectedApplicant.candidate
                                        .linkedinUrl && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                LinkedIn Profile
                                            </label>
                                            <a
                                                href={
                                                    selectedApplicant.candidate
                                                        .linkedinUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-blue-600 hover:text-blue-800 underline"
                                            >
                                                {
                                                    selectedApplicant.candidate
                                                        .linkedinUrl
                                                }
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={() =>
                                    handleViewResume(selectedApplicant)
                                }
                                className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-gray-200"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                View Resume
                            </button>
                            <button
                                onClick={() => {
                                    handleScheduleInterview(selectedApplicant);
                                    closeModal();
                                }}
                                className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-purple-700 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:bg-purple-50"
                            >
                                <CalendarPlus className="h-4 w-4 mr-2" />
                                Schedule Interview
                            </button>
                            {selectedApplicant.status !== "hired" &&
                                selectedApplicant.status !== "rejected" &&
                                canHireForJob(
                                    selectedApplicant.jobId,
                                    applicants
                                ) && (
                                    <button
                                        onClick={() => {
                                            handleAcceptApplicant(
                                                selectedApplicant
                                            );
                                            closeModal();
                                        }}
                                        className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Accept/Hire
                                    </button>
                                )}
                            {selectedApplicant.status !== "rejected" && (
                                <button
                                    onClick={() => {
                                        handleRejectApplicant(
                                            selectedApplicant
                                        );
                                        closeModal();
                                    }}
                                    className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    {selectedApplicant.status === "hired"
                                        ? "Revoke Hire"
                                        : "Reject"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Manage Applicants
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Review and manage job applications
                    </p>
                </div>
                <button
                    onClick={fetchApplicants}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw
                        className={`-ml-0.5 mr-2 h-4 w-4 cursor-pointer ${
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
                            Error loading applicants
                        </p>
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={fetchApplicants}
                            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* Filters and Sorting */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Status Filter */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">
                            Filter by status:
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                            disabled={loading}
                        >
                            <option value="all">All Statuses</option>
                            <option value="applied">Applied</option>
                            <option value="under-review">Under Review</option>
                            <option value="interviewed">Interviewed</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">
                            Sort by:
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                            disabled={loading}
                        >
                            <option value="appliedDate">Applied Date</option>
                            <option value="name">Name</option>
                            <option value="profileCompleteness">
                                Profile Completeness
                            </option>
                            <option value="experience">Experience</option>
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">
                            Order:
                        </label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                            disabled={loading}
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Applicants List */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Applications ({applicants.length})
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
                                    <div className="bg-gray-300 rounded-full h-12 w-12"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : applicants.length === 0 ? (
                    <div className="p-12 text-center">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No applicants found
                        </h3>
                        <p className="mt-2 text-gray-500">
                            {selectedStatus === "all"
                                ? "No applications have been received yet."
                                : `No applications with status "${formatStatus(
                                      selectedStatus
                                  )}" found.`}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {sortedApplicants.map((applicant) => {
                            const statusKey = `${applicant.jobId}-${applicant.candidateId}`;
                            const isUpdating = updatingStatus[statusKey];

                            return (
                                <div key={applicant.id} className="p-4 sm:p-6">
                                    {/* Desktop Layout */}
                                    <div className="hidden md:flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-gray-100 rounded-full p-3">
                                                <User className="h-8 w-8 text-gray-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {applicant.name}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {applicant.jobTitle}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <Mail className="h-4 w-4" />
                                                        <span>
                                                            {applicant.email}
                                                        </span>
                                                    </div>
                                                    {applicant.phone && (
                                                        <div className="flex items-center space-x-1">
                                                            <Phone className="h-4 w-4" />
                                                            <span>
                                                                {
                                                                    applicant.phone
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Applied on{" "}
                                                    {new Date(
                                                        applicant.appliedDate
                                                    ).toLocaleDateString()}
                                                </p>
                                                {/* Profile Completeness */}
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        Profile:
                                                    </span>
                                                    <div className="flex items-center space-x-1">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    (applicant
                                                                        .candidate
                                                                        ?.profileCompleteness ||
                                                                        0) >= 80
                                                                        ? "bg-green-500"
                                                                        : (applicant
                                                                              .candidate
                                                                              ?.profileCompleteness ||
                                                                              0) >=
                                                                          60
                                                                        ? "bg-yellow-500"
                                                                        : "bg-red-500"
                                                                }`}
                                                                style={{
                                                                    width: `${
                                                                        applicant
                                                                            .candidate
                                                                            ?.profileCompleteness ||
                                                                        0
                                                                    }%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-600">
                                                            {applicant.candidate
                                                                ?.profileCompleteness ||
                                                                0}
                                                            %
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                    applicant.status
                                                )} ${
                                                    applicant.status === "hired"
                                                        ? "ring-2 ring-green-300"
                                                        : ""
                                                }`}
                                            >
                                                {formatStatus(applicant.status)}
                                                {applicant.status ===
                                                    "hired" && (
                                                    <Check className="h-3 w-3 ml-1" />
                                                )}
                                            </span>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                                                    onClick={() =>
                                                        handleViewApplication(
                                                            applicant
                                                        )
                                                    }
                                                    title="View Application"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                                                    onClick={() =>
                                                        handleViewResume(
                                                            applicant
                                                        )
                                                    }
                                                    title="View Resume"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-md cursor-pointer"
                                                    onClick={() =>
                                                        handleScheduleInterview(
                                                            applicant
                                                        )
                                                    }
                                                    title="Schedule Interview"
                                                >
                                                    <CalendarPlus className="h-4 w-4" />
                                                </button>
                                                {applicant.status !== "hired" &&
                                                    applicant.status !==
                                                        "rejected" &&
                                                    canHireForJob(
                                                        applicant.jobId,
                                                        applicants
                                                    ) && (
                                                        <button
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-md cursor-pointer disabled:opacity-50"
                                                            onClick={() =>
                                                                handleAcceptApplicant(
                                                                    applicant
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            title="Accept/Hire"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                {applicant.status !==
                                                    "rejected" &&
                                                    applicant.status !==
                                                        "hired" && (
                                                        <button
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md cursor-pointer disabled:opacity-50"
                                                            onClick={() =>
                                                                handleRejectApplicant(
                                                                    applicant
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Layout */}
                                    <div className="md:hidden space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
                                                <User className="h-6 w-6 text-gray-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                                    {applicant.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {applicant.jobTitle}
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {applicant.email}
                                                        </span>
                                                    </div>
                                                    {applicant.phone && (
                                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                                            <span>
                                                                {
                                                                    applicant.phone
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-gray-400">
                                                        Applied:{" "}
                                                        {new Date(
                                                            applicant.appliedDate
                                                        ).toLocaleDateString()}
                                                    </p>
                                                    {/* Profile Completeness for Mobile */}
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500">
                                                            Profile:
                                                        </span>
                                                        <div className="flex items-center space-x-1">
                                                            <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className={`h-1.5 rounded-full ${
                                                                        (applicant
                                                                            .candidate
                                                                            ?.profileCompleteness ||
                                                                            0) >=
                                                                        80
                                                                            ? "bg-green-500"
                                                                            : (applicant
                                                                                  .candidate
                                                                                  ?.profileCompleteness ||
                                                                                  0) >=
                                                                              60
                                                                            ? "bg-yellow-500"
                                                                            : "bg-red-500"
                                                                    }`}
                                                                    style={{
                                                                        width: `${
                                                                            applicant
                                                                                .candidate
                                                                                ?.profileCompleteness ||
                                                                            0
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-600">
                                                                {applicant
                                                                    .candidate
                                                                    ?.profileCompleteness ||
                                                                    0}
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and Actions for Mobile */}
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    applicant.status
                                                )} ${
                                                    applicant.status === "hired"
                                                        ? "ring-2 ring-green-300"
                                                        : ""
                                                }`}
                                            >
                                                {formatStatus(applicant.status)}
                                                {applicant.status ===
                                                    "hired" && (
                                                    <Check className="h-3 w-3 ml-1" />
                                                )}
                                            </span>

                                            <div className="flex items-center space-x-1">
                                                <button
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                                    onClick={() =>
                                                        handleViewApplication(
                                                            applicant
                                                        )
                                                    }
                                                    title="View Application"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                                    onClick={() =>
                                                        handleViewResume(
                                                            applicant
                                                        )
                                                    }
                                                    title="View Resume"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                                                    onClick={() =>
                                                        handleScheduleInterview(
                                                            applicant
                                                        )
                                                    }
                                                    title="Schedule Interview"
                                                >
                                                    <CalendarPlus className="h-4 w-4" />
                                                </button>
                                                {applicant.status !== "hired" &&
                                                    applicant.status !==
                                                        "rejected" &&
                                                    canHireForJob(
                                                        applicant.jobId,
                                                        applicants
                                                    ) && (
                                                        <button
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded cursor-pointer disabled:opacity-50"
                                                            onClick={() =>
                                                                handleAcceptApplicant(
                                                                    applicant
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            title="Accept/Hire"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                {applicant.status !==
                                                    "rejected" &&
                                                    applicant.status !==
                                                        "hired" && (
                                                        <button
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer disabled:opacity-50"
                                                            onClick={() =>
                                                                handleRejectApplicant(
                                                                    applicant
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Application Details Modal */}
            <ApplicationModal />

            {/* Resume Viewer Modal */}
            {selectedResumeCandidate && (
                <ResumeViewer
                    candidateId={selectedResumeCandidate.id}
                    candidateName={selectedResumeCandidate.name}
                    isOpen={showResumeViewer}
                    onClose={() => {
                        setShowResumeViewer(false);
                        setSelectedResumeCandidate(null);
                    }}
                    onError={handleResumeError}
                />
            )}
        </div>
    );
};

export default ManageApplicants;
