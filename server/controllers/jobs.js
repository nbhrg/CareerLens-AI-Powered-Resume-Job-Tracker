const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const mongoose = require("mongoose");

// @desc    Get all jobs with optional filtering
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res) => {
    try {
        const {
            search,
            location,
            type,
            salary,
            page = 1,
            limit = 10,
        } = req.query;
        const query = { isActive: true };

        // Apply filters if provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { "company.name": { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { skills: { $in: [new RegExp(search, "i")] } },
            ];
        }

        if (location) {
            query.$or = query.$or || [];
            query.$or.push(
                { "location.city": { $regex: location, $options: "i" } },
                { "location.state": { $regex: location, $options: "i" } },
                { "location.country": { $regex: location, $options: "i" } }
            );

            // If "remote" is in the search, include remote jobs
            if (location.toLowerCase().includes("remote")) {
                query.$or.push({ "location.remote": true });
            }
        }

        if (type && type !== "all") {
            query.type = type;
        }

        if (salary) {
            const [min, max] = salary.split("-").map(Number);
            if (!isNaN(min) && !isNaN(max)) {
                query["salary.min"] = { $gte: min };
                query["salary.max"] = { $lte: max };
            }
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query
        const jobs = await Job.find(query)
            .populate("recruiter", "company")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Job.countDocuments(query);

        res.json({
            jobs,
            totalJobs: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error getting jobs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get a job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate(
            "recruiter",
            "company"
        );

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json(job);
    } catch (error) {
        console.error("Error getting job:", error);
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Job not found" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Candidates only)
exports.applyToJob = async (req, res) => {
    try {
        // console.log(
        //     "Apply to job - User:",
        //     req.user.id,
        //     "User Type:",
        //     req.userType
        // );
        // console.log("Apply to job - Job ID:", req.params.id);
        // console.log("Apply to job - Request body:", req.body);

        // Check if the user is a candidate
        if (req.userType !== "candidate") {
            return res
                .status(403)
                .json({ message: "Not authorized to apply for jobs" });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // console.log("Job found:", job.title);

        // Check if job is active
        if (!job.isActive) {
            return res.status(400).json({
                message: "This job is no longer accepting applications",
            });
        }

        // Check if already applied
        const alreadyApplied = job.applicants.some(
            (applicant) => applicant.candidateId.toString() === req.user.id
        );

        if (alreadyApplied) {
            // console.log("User already applied to this job");
            return res
                .status(400)
                .json({ message: "You have already applied to this job" });
        }

        // Add candidate to applicants
        job.applicants.push({
            candidateId: req.user.id,
            status: "applied",
            appliedAt: Date.now(),
        });

        // console.log("Added applicant to job, saving job...");
        await job.save();
        // console.log("Job saved successfully");

        // Update recruiter's totalApplicationsReceived stat
        const Recruiter = require("../models/Recruiter");
        const recruiter = await Recruiter.findById(job.recruiter);
        if (recruiter) {
            recruiter.stats.totalApplicationsReceived += 1;
            await recruiter.save();
        }

        // Also update the candidate's applications
        // console.log("Updating candidate applications...");
        const candidateUpdate = await Candidate.findByIdAndUpdate(req.user.id, {
            $push: {
                applications: {
                    jobId: job._id,
                    appliedDate: new Date(),
                    status: "applied",
                },
            },
        });

        res.json({ message: "Successfully applied to job", job });
    } catch (error) {
        console.error("Error applying to job:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Save a job (bookmark)
// @route   POST /api/jobs/:id/save
// @access  Private (Candidates only)
exports.saveJob = async (req, res) => {
    try {
        // Check if the user is a candidate
        if (req.userType !== "candidate") {
            return res
                .status(403)
                .json({ message: "Not authorized to save jobs" });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check if already saved
        const alreadySaved = job.savedBy.includes(req.user.id);
        if (alreadySaved) {
            return res.status(400).json({ message: "Job already saved" });
        }

        // Add user to savedBy array
        job.savedBy.push(req.user.id);
        await job.save();

        res.json({ message: "Job saved successfully" });
    } catch (error) {
        console.error("Error saving job:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Unsave a job (remove bookmark)
// @route   DELETE /api/jobs/:id/unsave
// @access  Private (Candidates only)
exports.unsaveJob = async (req, res) => {
    try {
        // Check if the user is a candidate
        if (req.userType !== "candidate") {
            return res
                .status(403)
                .json({ message: "Not authorized to unsave jobs" });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Remove user from savedBy array
        const index = job.savedBy.indexOf(req.user.id);
        if (index === -1) {
            return res.status(400).json({ message: "Job not saved by you" });
        }

        job.savedBy.splice(index, 1);
        await job.save();

        res.json({ message: "Job unsaved successfully" });
    } catch (error) {
        console.error("Error unsaving job:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all jobs saved by the user
// @route   GET /api/jobs/saved
// @access  Private (Candidates only)
exports.getSavedJobs = async (req, res) => {
    try {
        // Check if the user is a candidate
        if (req.userType !== "candidate") {
            return res
                .status(403)
                .json({ message: "Not authorized to view saved jobs" });
        }

        // Find jobs where the user's ID is in the savedBy array
        const savedJobs = await Job.find({
            savedBy: req.user.id,
            isActive: true,
        }).populate("recruiter", "company");

        res.json(savedJobs);
    } catch (error) {
        console.error("Error getting saved jobs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Recruiters only)
exports.createJob = async (req, res) => {
    try {
        // Check if the user is a recruiter
        if (req.userType !== "recruiter") {
            return res
                .status(403)
                .json({ message: "Not authorized to create jobs" });
        }

        const {
            title,
            description,
            type,
            salary,
            location,
            skills,
            company,
            perks,
            benefits,
            applicationDeadline,
            numberOfOpenings,
        } = req.body;

        // Create new job
        const newJob = new Job({
            title,
            description,
            type,
            salary,
            location,
            skills,
            recruiter: req.user.id,
            company,
            perks,
            benefits,
            applicationDeadline,
            numberOfOpenings,
            isActive: true,
        });

        const job = await newJob.save();

        // Update recruiter's jobPostings array and stats
        const Recruiter = require("../models/Recruiter");
        const recruiter = await Recruiter.findById(req.user.id);
        if (recruiter) {
            // Add job to recruiter's jobPostings array
            recruiter.jobPostings.push(job._id);

            // Update stats
            recruiter.stats.totalJobsPosted += 1;
            recruiter.stats.activeJobs += 1;

            // Update subscription usage if applicable
            if (recruiter.subscription.jobPostingLimit !== -1) {
                recruiter.subscription.jobPostingsUsed =
                    (recruiter.subscription.jobPostingsUsed || 0) + 1;
            }

            await recruiter.save();
        }

        res.status(201).json(job);
    } catch (error) {
        console.error("Error creating job:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid job data",
                errors: Object.values(error.errors).map((e) => e.message),
            });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Job owner only)
exports.updateJob = async (req, res) => {
    try {
        // Check if the user is a recruiter
        if (req.userType !== "recruiter") {
            return res
                .status(403)
                .json({ message: "Not authorized to update jobs" });
        }

        // Find the job
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check if the user is the job owner
        if (job.recruiter.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ message: "Not authorized to update this job" });
        }

        // Update fields
        const updateData = { ...req.body };
        delete updateData.applicants; // Don't allow updating applicants through this endpoint
        delete updateData.savedBy; // Don't allow updating savedBy through this endpoint

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json(updatedJob);
    } catch (error) {
        console.error("Error updating job:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid job data",
                errors: Object.values(error.errors).map((e) => e.message),
            });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Job owner only)
exports.deleteJob = async (req, res) => {
    try {
        // Check if the user is a recruiter
        if (req.userType !== "recruiter") {
            return res
                .status(403)
                .json({ message: "Not authorized to delete jobs" });
        }

        // Find the job
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check if the user is the job owner
        if (job.recruiter.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ message: "Not authorized to delete this job" });
        }

        // Instead of deleting, set isActive to false
        const wasActive = job.isActive;
        job.isActive = false;
        await job.save();

        // Update recruiter's stats if the job was previously active
        if (wasActive) {
            const Recruiter = require("../models/Recruiter");
            const recruiter = await Recruiter.findById(req.user.id);
            if (recruiter && recruiter.stats.activeJobs > 0) {
                recruiter.stats.activeJobs -= 1;
                await recruiter.save();
            }
        }

        res.json({ message: "Job successfully removed" });
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all jobs created by the recruiter
// @route   GET /api/jobs/recruiter/myjobs
// @access  Private (Recruiters only)
exports.getRecruiterJobs = async (req, res) => {
    try {
        // Check if the user is a recruiter
        if (req.userType !== "recruiter") {
            return res
                .status(403)
                .json({ message: "Not authorized to view recruiter jobs" });
        }

        const { status, page = 1, limit = 10 } = req.query;
        const query = { recruiter: req.user.id };

        // Filter by status if provided
        if (status) {
            if (status === "active") {
                query.isActive = true;
            } else if (status === "inactive") {
                query.isActive = false;
            }
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query
        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Job.countDocuments(query);

        res.json({
            jobs,
            totalJobs: total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error("Error getting recruiter jobs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get candidate's job applications
// @route   GET /api/jobs/applications
// @access  Private (Candidates only)
exports.getCandidateApplications = async (req, res) => {
    try {
        // Check if the user is a candidate
        if (req.userType !== "candidate") {
            return res
                .status(403)
                .json({ message: "Not authorized to view applications" });
        }

        const { status, page = 1, limit = 50 } = req.query;

        // Find all jobs where the candidate has applied
        const query = {
            "applicants.candidateId": req.user.id,
            isActive: true,
        };

        // Get jobs with applicants populated
        const jobs = await Job.find(query)
            .populate("recruiter", "company")
            .select(
                "title description salary location company createdAt applicants"
            )
            .sort({ "applicants.appliedAt": -1 });

        // Extract applications for this candidate
        let applications = [];

        jobs.forEach((job) => {
            const candidateApplication = job.applicants.find(
                (app) => app.candidateId.toString() === req.user.id
            );

            if (candidateApplication) {
                applications.push({
                    id: candidateApplication._id,
                    jobId: job._id,
                    position: job.title,
                    company:
                        job.company?.name ||
                        job.recruiter?.company?.name ||
                        "Unknown Company",
                    location: job.location?.city
                        ? `${job.location.city}, ${
                              job.location.state || job.location.country || ""
                          }`
                              .trim()
                              .replace(/,$/, "")
                        : job.location?.remote
                        ? "Remote"
                        : "Not specified",
                    appliedDate: candidateApplication.appliedAt,
                    status: candidateApplication.status,
                    salary:
                        job.salary?.min && job.salary?.max
                            ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                            : "Not disclosed",
                    jobDescription: job.description,
                });
            }
        });

        // Filter by status if provided
        if (status && status !== "all") {
            applications = applications.filter((app) => app.status === status);
        }

        // Sort by applied date (newest first)
        applications.sort(
            (a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)
        );

        // Pagination
        const skip = (page - 1) * limit;
        const paginatedApplications = applications.slice(
            skip,
            skip + parseInt(limit)
        );

        // Calculate statistics
        const stats = {
            total: applications.length,
            applied: applications.filter((app) => app.status === "applied")
                .length,
            interviewed: applications.filter(
                (app) => app.status === "interviewed"
            ).length,
            hired: applications.filter((app) => app.status === "hired").length,
            rejected: applications.filter((app) => app.status === "rejected")
                .length,
        };

        res.json({
            applications: paginatedApplications,
            stats,
            totalApplications: applications.length,
            currentPage: parseInt(page),
            totalPages: Math.ceil(applications.length / parseInt(limit)),
        });
    } catch (error) {
        console.error("Error getting applications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update application status of a candidate
// @route   PUT /api/jobs/:id/status
// @access  Private (Job owner only)
exports.updateApplicationStatus = async (req, res) => {
    try {
        // Check if the user is a recruiter
        if (req.userType !== "recruiter") {
            return res.status(403).json({
                message: "Not authorized to update application status",
            });
        }

        const { candidateId, status } = req.body;

        if (!candidateId || !status) {
            return res
                .status(400)
                .json({ message: "Candidate ID and status are required" });
        }

        // Validate status
        const validStatuses = ["applied", "interviewed", "hired", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Find the job
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check if the user is the job owner
        if (job.recruiter.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized to update this job's applications",
            });
        }

        // Find the applicant
        const applicantIndex = job.applicants.findIndex(
            (applicant) => applicant.candidateId.toString() === candidateId
        );

        if (applicantIndex === -1) {
            return res
                .status(404)
                .json({ message: "Candidate not found in job applicants" });
        }

        // Get the current status before updating
        const currentStatus = job.applicants[applicantIndex].status;

        // Prevent hiring already rejected candidates
        if (currentStatus === "rejected" && status === "hired") {
            return res.status(400).json({
                message: "Cannot hire a candidate who has been rejected",
            });
        }

        // Prevent rejecting already hired candidates (they should be revoked first)
        if (currentStatus === "hired" && status === "rejected") {
            // This is allowed as it represents revoking a hire
        }

        // Check if we can hire more candidates for this job
        if (status === "hired" && currentStatus !== "hired") {
            const currentHiredCount = job.applicants.filter(
                (app) => app.status === "hired"
            ).length;

            if (currentHiredCount >= job.numberOfOpenings) {
                return res.status(400).json({
                    message: "All positions for this job have been filled",
                });
            }
        }

        // Update the status
        job.applicants[applicantIndex].status = status;
        await job.save();

        // Also update the status in the candidate's applications array
        const Candidate = require("../models/Candidate");
        await Candidate.findOneAndUpdate(
            {
                _id: candidateId,
                "applications.jobId": job._id,
            },
            {
                $set: {
                    "applications.$.status": status,
                },
            }
        );

        // Update recruiter's totalHires count if status changed to/from "hired"
        const Recruiter = require("../models/Recruiter");
        if (status === "hired" && currentStatus !== "hired") {
            // Incrementing hire count
            const recruiter = await Recruiter.findById(job.recruiter);
            if (recruiter) {
                recruiter.stats.totalHires += 1;
                await recruiter.save();
            }
        } else if (currentStatus === "hired" && status !== "hired") {
            // Decrementing hire count (e.g., when a hired candidate is rejected)
            const recruiter = await Recruiter.findById(job.recruiter);
            if (recruiter && recruiter.stats.totalHires > 0) {
                recruiter.stats.totalHires -= 1;
                await recruiter.save();
            }
        }

        res.json({
            message: "Application status updated successfully",
            applicant: job.applicants[applicantIndex],
        });
    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all applicants for recruiter's jobs
// @route   GET /api/jobs/recruiter/applicants
// @access  Private (Recruiters only)
exports.getRecruiterApplicants = async (req, res) => {
    try {
        // Check if the user is a recruiter
        if (req.userType !== "recruiter") {
            return res
                .status(403)
                .json({ message: "Not authorized to view applicants" });
        }

        const { status, jobId, page = 1, limit = 50 } = req.query;
        const query = { recruiter: req.user.id, isActive: true };

        // Filter by specific job if provided
        if (jobId) {
            query._id = jobId;
        }

        // Get recruiter's jobs with applicants
        const jobs = await Job.find(query)
            .populate({
                path: "applicants.candidateId",
                select: "firstName lastName email phone dateOfBirth education experience skills profile profileCompleteness",
            })
            .select("title applicants createdAt numberOfOpenings");

        // Flatten all applicants from all jobs
        let allApplicants = [];

        jobs.forEach((job) => {
            job.applicants.forEach((applicant) => {
                if (applicant.candidateId) {
                    allApplicants.push({
                        id: applicant._id,
                        candidateId: applicant.candidateId._id,
                        jobId: job._id,
                        jobTitle: job.title,
                        numberOfOpenings: job.numberOfOpenings,
                        name: `${applicant.candidateId.firstName} ${applicant.candidateId.lastName}`,
                        email: applicant.candidateId.email,
                        phone: applicant.candidateId.phone,
                        status: applicant.status,
                        appliedDate: applicant.appliedAt,
                        candidate: applicant.candidateId,
                    });
                }
            });
        });

        // Filter by status if provided
        if (status && status !== "all") {
            allApplicants = allApplicants.filter(
                (applicant) => applicant.status === status
            );
        }

        // Sort by application date (newest first)
        allApplicants.sort(
            (a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)
        );

        // Pagination
        const skip = (page - 1) * limit;
        const paginatedApplicants = allApplicants.slice(
            skip,
            skip + parseInt(limit)
        );

        res.json({
            applicants: paginatedApplicants,
            totalApplicants: allApplicants.length,
            currentPage: parseInt(page),
            totalPages: Math.ceil(allApplicants.length / parseInt(limit)),
        });
    } catch (error) {
        console.error("Error getting recruiter applicants:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
