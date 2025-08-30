/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
    Search,
    MapPin,
    DollarSign,
    Clock,
    Filter,
    Heart,
    ExternalLink,
    Loader,
    IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
import { jobsAPI } from "../../utils/api";
import { useAuth } from "../../context/useAuth";
import { Link } from "react-router-dom";

// Import API URL
const API_BASE_URL = "http://localhost:5000/api";

const JobBoard = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("all");
    const [salaryRange, setSalaryRange] = useState("all");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [sortBy, setSortBy] = useState("saved-first");
    const { user } = useAuth();

    // Fetch jobs from backend
    useEffect(() => {
        fetchJobs();
        if (user) {
            fetchSavedJobs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchJobs = async (filters, isLoadMore = false) => {
        setLoading(true);
        try {
            const currentPage = isLoadMore ? page + 1 : 1;
            if (!isLoadMore) {
                setPage(1);
            }

            const searchFilters = filters || {
                search: searchTerm,
                location,
                type: jobType !== "all" ? jobType : undefined,
                salary: salaryRange !== "all" ? salaryRange : undefined,
                page: currentPage,
                limit: 10,
            };

            // Just use the jobsAPI helper from our utils
            const responseData = await jobsAPI.getJobs(searchFilters);

            // responseData could either be just the jobs array or the full pagination object
            const newJobs = Array.isArray(responseData)
                ? responseData
                : responseData.jobs || [];
            const pages = responseData.totalPages || 1;
            const total = responseData.totalJobs || newJobs.length;

            if (isLoadMore && jobs.length > 0) {
                setJobs([...jobs, ...newJobs]);
            } else {
                setJobs(newJobs);
            }

            if (!isLoadMore) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }

            setPage(currentPage);
            setTotalPages(pages);
            setTotalJobs(total);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
            setError("Failed to load jobs. Please try again later.");
            toast.error("Could not load jobs");
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedJobs = async () => {
        try {
            const savedJobs = await jobsAPI.getSavedJobs();
            const savedIds = new Set(savedJobs.map((job) => job._id));
            setSavedJobIds(savedIds);
        } catch (err) {
            console.error("Failed to fetch saved jobs:", err);
        }
    };

    // Filter jobs based on search criteria
    const filteredJobs = jobs
        .filter((job) => {
            const matchesSearch =
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (job.company?.name &&
                    job.company.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()));
            const matchesLocation =
                location === "" ||
                (job.location?.city &&
                    job.location.city
                        .toLowerCase()
                        .includes(location.toLowerCase())) ||
                (job.location?.state &&
                    job.location.state
                        .toLowerCase()
                        .includes(location.toLowerCase())) ||
                (job.location?.country &&
                    job.location.country
                        .toLowerCase()
                        .includes(location.toLowerCase())) ||
                (job.location?.remote &&
                    location.toLowerCase().includes("remote"));
            const matchesType =
                jobType === "all" ||
                job.type.toLowerCase() === jobType.toLowerCase();

            return matchesSearch && matchesLocation && matchesType;
        })
        .sort((a, b) => {
            // Apply sorting based on selected sort option
            switch (sortBy) {
                case "saved-first": {
                    // Sort saved jobs first
                    const aIsSaved = savedJobIds.has(a._id);
                    const bIsSaved = savedJobIds.has(b._id);

                    if (aIsSaved && !bIsSaved) return -1;
                    if (!aIsSaved && bIsSaved) return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt); // Then by most recent
                }

                case "most-recent":
                    return new Date(b.createdAt) - new Date(a.createdAt);

                case "salary-high": {
                    const aSalaryMax = a.salary?.max || 0;
                    const bSalaryMax = b.salary?.max || 0;
                    return bSalaryMax - aSalaryMax;
                }

                case "salary-low": {
                    const aSalaryMin = a.salary?.min || Infinity;
                    const bSalaryMin = b.salary?.min || Infinity;
                    return aSalaryMin - bSalaryMin;
                }

                case "company-az": {
                    const aCompany = (a.company?.name || "").toLowerCase();
                    const bCompany = (b.company?.name || "").toLowerCase();
                    return aCompany.localeCompare(bCompany);
                }

                default:
                    return 0;
            }
        });

    // Handle job application
    const handleApply = async (job) => {
        if (!user) {
            toast.info("Please login to apply for jobs");
            return;
        }

        try {
            await jobsAPI.applyJob(job._id, {});
            toast.success(
                `Applied to "${job.title}" at ${
                    job.company?.name || "Company"
                }!`
            );
            fetchJobs(); // Refresh jobs to update status
        } catch (err) {
            console.error("Failed to apply:", err);
            toast.error("Failed to apply for job. Please try again.");
        }
    };

    // Handle saving a job
    const toggleSave = async (job) => {
        if (!user) {
            toast.info("Please login to save jobs");
            return;
        }

        const isJobSaved = savedJobIds.has(job._id);

        try {
            if (isJobSaved) {
                await jobsAPI.unsaveJob(job._id);
                savedJobIds.delete(job._id);
                setSavedJobIds(new Set(savedJobIds));
                toast.info(`Removed "${job.title}" from saved jobs`);
            } else {
                await jobsAPI.saveJob(job._id);
                setSavedJobIds(new Set(savedJobIds.add(job._id)));
                toast.success(`"${job.title}" saved to your list!`);
            }
        } catch (err) {
            console.error("Failed to toggle job save:", err);
            toast.error("Failed to update saved jobs. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
                <p className="text-gray-600 mt-2">
                    Discover your next opportunity
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                    {/* Search Term */}
                    <div className="lg:col-span-2">
                        <label
                            htmlFor="search"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Job Title or Company
                        </label>
                        <div className="relative">
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                id="search"
                                type="text"
                                placeholder="Search jobs..."
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Location
                        </label>
                        <div className="relative">
                            <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                id="location"
                                type="text"
                                placeholder="City, State"
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Job Type */}
                    <div>
                        <label
                            htmlFor="jobType"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Job Type
                        </label>
                        <select
                            id="jobType"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                        </select>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <button
                            onClick={() =>
                                fetchJobs({
                                    search: searchTerm,
                                    location,
                                    type: jobType,
                                })
                            }
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <Filter className="h-5 w-5 inline mr-2" />
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
                <p className="text-gray-600">
                    Showing {filteredJobs.length} job
                    {filteredJobs.length !== 1 ? "s" : ""}
                </p>
                <select
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="saved-first">Saved Jobs First</option>
                    <option value="most-recent">Most Recent</option>
                    <option value="salary-high">Salary: High to Low</option>
                    <option value="salary-low">Salary: Low to High</option>
                    <option value="company-az">Company A-Z</option>
                </select>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">
                            Loading jobs...
                        </span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-2">{error}</p>
                        <button
                            onClick={fetchJobs}
                            className="text-blue-500 hover:underline cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 mb-2">
                            No jobs match your search criteria
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setLocation("");
                                setJobType("all");
                            }}
                            className="text-blue-500 hover:underline cursor-pointer"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <div
                            key={job._id}
                            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div
                                        className="flex items-center 
                                    justify-between space-x-2 mb-2"
                                    >
                                        <div>
                                            <h3 className="text-xl font-semibold inline text-gray-900">
                                                {job.title}
                                            </h3>
                                            <span className="px-2 ml-5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {job.type}
                                            </span>
                                        </div>
                                        <div>
                                            <img
                                                className="logo"
                                                src={job.company.logo}
                                            ></img>
                                        </div>
                                    </div>

                                    <p className="text-lg text-gray-700 mb-2">
                                        {job.company?.name || "Company"}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
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
                                                {job.salary?.min &&
                                                job.salary?.max
                                                    ? `${
                                                          job.salary.currency ||
                                                          "INR"
                                                      } ${job.salary.min.toLocaleString(
                                                          "en-IN"
                                                      )} - ${job.salary.max.toLocaleString(
                                                          "en-IN"
                                                      )}`
                                                    : "Salary not specified"}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {new Date(
                                                    job.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4">
                                        {job.description.length > 200
                                            ? `${job.description.substring(
                                                  0,
                                                  200
                                              )}...`
                                            : job.description}
                                    </p>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {job.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={() => handleApply(job)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                            disabled={!user}
                                        >
                                            Apply Now
                                        </button>
                                        <button
                                            onClick={() => toggleSave(job)}
                                            className={`px-4 py-2 rounded-md border cursor-pointer ${
                                                savedJobIds.has(job._id)
                                                    ? "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                            disabled={!user}
                                        >
                                            <Heart
                                                className={`h-4 w-4 inline mr-1 ${
                                                    savedJobIds.has(job._id)
                                                        ? "fill-current"
                                                        : ""
                                                }`}
                                            />
                                            {savedJobIds.has(job._id)
                                                ? "Saved"
                                                : "Save"}
                                        </button>
                                        <Link
                                            to={`/jobs/${job._id}`}
                                            className="text-blue-600 hover:text-blue-500"
                                        >
                                            <ExternalLink className="h-4 w-4 inline mr-1" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Load More */}
            {filteredJobs.length > 0 && (
                <div className="text-center">
                    <button
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 cursor-pointer"
                        onClick={() => fetchJobs(null, true)}
                        disabled={loading || page >= totalPages}
                    >
                        {loading ? (
                            <>
                                <Loader className="h-4 w-4 animate-spin inline mr-2" />
                                Loading...
                            </>
                        ) : page >= totalPages ? (
                            "No More Jobs"
                        ) : (
                            "Load More Jobs"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default JobBoard;
