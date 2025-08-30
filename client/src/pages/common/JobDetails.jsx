/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    DollarSign,
    IndianRupee,
    Clock,
    Building,
    Globe,
    Users,
    Heart,
    Calendar,
    Briefcase,
    Loader,
    Tag,
    Gift,
    Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { jobsAPI } from "../../utils/api";
import { useAuth } from "../../context/useAuth";

const JobDetails = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const { user, isCandidate } = useAuth();

    // Debug logging to help troubleshoot
    // console.log("JobDetails Debug:", {
    //     user,
    //     isCandidate: isCandidate(),
    //     userRole: user?.role,
    //     isAuthenticated: !!user,
    // });

    useEffect(() => {
        fetchJobDetails();
        if (user && isCandidate()) {
            checkIfJobIsSaved();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const data = await jobsAPI.getJob(id);
            setJob(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching job details:", err);
            setError(
                "Failed to load job details. The job may not exist or has been removed."
            );
            toast.error("Could not load job details");
        } finally {
            setLoading(false);
        }
    };

    const checkIfJobIsSaved = async () => {
        try {
            const savedJobs = await jobsAPI.getSavedJobs();
            const jobIsSaved = savedJobs.some(
                (savedJob) => savedJob._id === id
            );
            setIsSaved(jobIsSaved);
        } catch (err) {
            console.error("Error checking if job is saved:", err);
        }
    };

    const handleSaveJob = async () => {
        if (!user) {
            toast.info("Please login as a candidate to save jobs");
            return;
        }

        if (!isCandidate()) {
            toast.info("Only candidates can save jobs");
            return;
        }

        try {
            if (isSaved) {
                await jobsAPI.unsaveJob(id);
                setIsSaved(false);
                toast.info("Job removed from saved jobs");
            } else {
                await jobsAPI.saveJob(id);
                setIsSaved(true);
                toast.success("Job saved successfully");
            }
        } catch (err) {
            console.error("Error saving/unsaving job:", err);
            toast.error("Failed to update saved jobs");
        }
    };

    const handleApplyJob = async (e) => {
        e.preventDefault();

        // console.log("Handle Apply Job - User:", user);
        // console.log("Handle Apply Job - Is Candidate:", isCandidate());

        if (!user) {
            toast.info("Please login as a candidate to apply for jobs");
            return;
        }

        if (!isCandidate()) {
            toast.info("Only candidates can apply for jobs");
            return;
        }

        try {
            setIsApplying(true);
            // console.log(
            //     "Applying to job:",
            //     id
            // );

            const response = await jobsAPI.applyJob(id, {});
            // console.log("Apply job response:", response);

            toast.success("Application submitted successfully");
            fetchJobDetails(); // Refresh job details to update application status
        } catch (err) {
            console.error("Error applying for job:", err);
            toast.error(err.message || "Failed to submit application");
        } finally {
            setIsApplying(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const hasApplied = () => {
        if (!user || !job) return false;
        return job.applicants?.some(
            (applicant) => applicant.candidateId === user.id
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-600">Loading job details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {error}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        The job you're looking for might have been removed or is
                        no longer active.
                    </p>
                    <Link
                        to="/candidate/jobs"
                        className="inline-flex items-center text-blue-600 hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Job Board
                    </Link>
                </div>
            </div>
        );
    }

    if (!job) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Link */}
            <div className="mb-6">
                <Link
                    to="/candidate/jobs"
                    className="inline-flex items-center text-gray-600 hover:text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Job Board
                </Link>
            </div>

            {/* Job Header */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="p-6 border-b">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <div className="mb-4">
                                <img
                                    src={
                                        job.company?.logo ||
                                        "https://via.placeholder.com/64x64/e5e7eb/6b7280?text=?"
                                    }
                                    alt={job.company?.name || "Company Logo"}
                                    className="h-10 w-auto "
                                />
                            </div>
                            <div className="flex items-center mr-10 space-x-2 mb-2">
                                <h1 className="text-3xl font-bold mr-10 text-gray-900 w-4/5">
                                    {job.title}
                                </h1>
                                <span className="px-2 w-1/5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {job.type}
                                </span>
                            </div>
                            <p className="text-xl text-gray-700 mb-1">
                                {job.company?.name ||
                                    "Company Name Not Provided"}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                        {job.location?.remote
                                            ? "Remote"
                                            : [
                                                  job.location?.city,
                                                  job.location?.state,
                                                  job.location?.country,
                                              ]
                                                  .filter(Boolean)
                                                  .join(", ") ||
                                              "Location not specified"}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <IndianRupee className="h-4 w-4" />
                                    <span>
                                        {job.salary?.min && job.salary?.max
                                            ? `${
                                                  job.salary.currency || "USD"
                                              } ${job.salary.min.toLocaleString(
                                                  "en-IN"
                                              )} - ${job.salary.max.toLocaleString(
                                                  "en-IN"
                                              )}`
                                            : "Salary not specified"}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {job.applicationDeadline
                                            ? `Deadline: ${formatDate(
                                                  job.applicationDeadline
                                              )}`
                                            : "No application deadline"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={handleSaveJob}
                                disabled={!user || !isCandidate()}
                                className={`inline-flex items-center justify-center px-4 py-2 rounded-md cursor-pointer ${
                                    isSaved
                                        ? "bg-red-50 text-red-700 border border-red-300 hover:bg-red-100"
                                        : "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100"
                                }`}
                            >
                                <Heart
                                    className={`h-4 w-4 mr-2 ${
                                        isSaved ? "fill-current" : ""
                                    }`}
                                />
                                {isSaved ? "Saved" : "Save Job"}
                            </button>
                            {hasApplied() ? (
                                <button
                                    disabled
                                    className="inline-flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 border border-green-300 rounded-md cursor-default"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Applied
                                </button>
                            ) : (
                                <a
                                    href="#apply-section"
                                    className={`inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                                        !user || !isCandidate()
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    onClick={(e) => {
                                        if (!user || !isCandidate()) {
                                            e.preventDefault();
                                            toast.info(
                                                "Please login as a candidate to apply"
                                            );
                                        }
                                    }}
                                >
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    Apply Now
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Posted on {formatDate(job.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Job Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Job Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Job Description */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Job Description
                        </h2>
                        <div className="prose max-w-none text-gray-700">
                            {job.description
                                .split("\n")
                                .map((paragraph, index) => (
                                    <p key={index} className="mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                        </div>
                    </div>

                    {/* Skills Required */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl mb-5 font-semibold text-gray-900">
                            Skills Required
                        </h2>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {job.skills && job.skills.length > 0 ? (
                                job.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-600">
                                    No specific skills mentioned
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Apply Section */}
                    {user && isCandidate() && !hasApplied() && (
                        <div
                            id="apply-section"
                            className="bg-white shadow rounded-lg p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Apply for this Job
                            </h2>
                            <form onSubmit={handleApplyJob}>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center cursor-pointer"
                                    disabled={isApplying}
                                >
                                    {isApplying ? (
                                        <>
                                            <Loader className="h-4 w-4 animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Briefcase className="h-4 w-4 mr-2" />
                                            Submit Application
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Company Info */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Company Information
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <Building className="h-5 w-5 text-gray-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Company Name
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {job.company?.name || "Not provided"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Globe className="h-5 w-5 text-gray-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Website
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {job.company?.website ? (
                                            <a
                                                href={job.company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {job.company.website}
                                            </a>
                                        ) : (
                                            "Not provided"
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Tag className="h-5 w-5 text-gray-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Industry
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {job.company?.industry ||
                                            "Not provided"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Users className="h-5 w-5 text-gray-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Company Size
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {job.company?.size || "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Job Details
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Job Type
                                </p>
                                <p className="text-sm text-gray-600 capitalize">
                                    {job.type || "Not specified"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Number of Openings
                                </p>
                                <p className="text-sm text-gray-600">
                                    {job.numberOfOpenings || "1"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Application Deadline
                                </p>
                                <p className="text-sm text-gray-600">
                                    {formatDate(job.applicationDeadline)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Perks & Benefits */}
                    {(job.perks?.length > 0 || job.benefits?.length > 0) && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Perks & Benefits
                            </h2>

                            {job.perks?.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Perks
                                    </p>
                                    <ul className="space-y-2">
                                        {job.perks.map((perk, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start"
                                            >
                                                <Gift className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                                <span className="text-sm text-gray-600">
                                                    {perk}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {job.benefits?.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Benefits
                                    </p>
                                    <ul className="space-y-2">
                                        {job.benefits.map((benefit, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start"
                                            >
                                                <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                                                <span className="text-sm text-gray-600">
                                                    {benefit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
