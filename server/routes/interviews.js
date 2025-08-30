const express = require("express");
const router = express.Router();
const Interview = require("../models/Interview");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
const { protect } = require("../middleware/auth");

// @route   POST /api/interviews
// @desc    Schedule a new interview (Recruiter only)
// @access  Private
router.post("/", protect, async (req, res) => {
    try {
        const {
            jobId,
            candidateId,
            title,
            description,
            type,
            scheduledDateTime,
            duration,
            location,
            meetingLink,
            phoneNumber,
            notes,
        } = req.body;

        // Verify the recruiter owns this job
        const job = await Job.findById(jobId).populate("recruiter");
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.recruiter._id.toString() !== req.user.id) {
            return res
                .status(403)
                .json({
                    message:
                        "Not authorized to schedule interview for this job",
                });
        }

        // Verify candidate exists and has applied to this job
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        const hasApplied = job.applicants.some(
            (applicant) => applicant.candidateId.toString() === candidateId
        );
        if (!hasApplied) {
            return res
                .status(400)
                .json({ message: "Candidate has not applied to this job" });
        }

        // Check for scheduling conflicts
        const conflictingInterview = await Interview.findOne({
            $or: [{ candidate: candidateId }, { recruiter: req.user.id }],
            scheduledDateTime: {
                $gte: new Date(scheduledDateTime),
                $lt: new Date(
                    new Date(scheduledDateTime).getTime() + duration * 60000
                ),
            },
            status: { $in: ["scheduled", "rescheduled"] },
        });

        if (conflictingInterview) {
            return res.status(400).json({
                message: "Time slot conflicts with another scheduled interview",
            });
        }

        const interview = new Interview({
            job: jobId,
            candidate: candidateId,
            recruiter: req.user.id,
            title,
            description,
            type,
            scheduledDateTime: new Date(scheduledDateTime),
            duration,
            location: type === "in-person" ? location : undefined,
            meetingLink: type === "video" ? meetingLink : undefined,
            phoneNumber: type === "phone" ? phoneNumber : undefined,
            notes: {
                recruiterNotes: notes || "",
            },
        });

        await interview.save();

        // Populate the interview with job and candidate details
        const populatedInterview = await Interview.findById(interview._id)
            .populate("job", "title company")
            .populate("candidate", "firstName lastName email")
            .populate("recruiter", "firstName lastName email");

        res.status(201).json({
            message: "Interview scheduled successfully",
            interview: populatedInterview,
        });
    } catch (error) {
        console.error("Error scheduling interview:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

// @route   GET /api/interviews/recruiter
// @desc    Get all interviews for a recruiter
// @access  Private
router.get("/recruiter", protect, async (req, res) => {
    try {
        const { status, date } = req.query;

        let query = { recruiter: req.user.id };

        if (status && status !== "all") {
            query.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            query.scheduledDateTime = {
                $gte: startDate,
                $lt: endDate,
            };
        }

        const interviews = await Interview.find(query)
            .populate("job", "title company location")
            .populate("candidate", "firstName lastName email phone")
            .sort({ scheduledDateTime: 1 });

        res.json({ interviews });
    } catch (error) {
        console.error("Error fetching recruiter interviews:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

// @route   GET /api/interviews/candidate
// @desc    Get all interviews for a candidate
// @access  Private
router.get("/candidate", protect, async (req, res) => {
    try {
        const { status, date } = req.query;

        let query = { candidate: req.user.id };

        if (status && status !== "all") {
            query.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            query.scheduledDateTime = {
                $gte: startDate,
                $lt: endDate,
            };
        }

        const interviews = await Interview.find(query)
            .populate("job", "title company location description")
            .populate("recruiter", "firstName lastName email company.name")
            .sort({ scheduledDateTime: 1 });

        res.json({ interviews });
    } catch (error) {
        console.error("Error fetching candidate interviews:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

// @route   PUT /api/interviews/:id
// @desc    Update interview (reschedule, add notes, etc.)
// @access  Private
router.put("/:id", protect, async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Check if user is authorized (recruiter or candidate)
        const isRecruiter = interview.recruiter.toString() === req.user.id;
        const isCandidate = interview.candidate.toString() === req.user.id;

        if (!isRecruiter && !isCandidate) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const {
            scheduledDateTime,
            duration,
            location,
            meetingLink,
            phoneNumber,
            status,
            candidateNotes,
            recruiterNotes,
            rescheduledReason,
        } = req.body;

        // Handle rescheduling
        if (
            scheduledDateTime &&
            scheduledDateTime !== interview.scheduledDateTime.toISOString()
        ) {
            // Check for conflicts
            const conflictingInterview = await Interview.findOne({
                _id: { $ne: interview._id },
                $or: [
                    { candidate: interview.candidate },
                    { recruiter: interview.recruiter },
                ],
                scheduledDateTime: {
                    $gte: new Date(scheduledDateTime),
                    $lt: new Date(
                        new Date(scheduledDateTime).getTime() +
                            (duration || interview.duration) * 60000
                    ),
                },
                status: { $in: ["scheduled", "rescheduled"] },
            });

            if (conflictingInterview) {
                return res.status(400).json({
                    message:
                        "Time slot conflicts with another scheduled interview",
                });
            }

            interview.rescheduledFrom = interview.scheduledDateTime;
            interview.scheduledDateTime = new Date(scheduledDateTime);
            interview.status = "rescheduled";
            interview.rescheduledReason = rescheduledReason;
        }

        // Update other fields
        if (duration) interview.duration = duration;
        if (location) interview.location = location;
        if (meetingLink) interview.meetingLink = meetingLink;
        if (phoneNumber) interview.phoneNumber = phoneNumber;
        if (status) interview.status = status;

        // Update notes based on user role
        if (isCandidate && candidateNotes !== undefined) {
            interview.notes.candidateNotes = candidateNotes;
        }
        if (isRecruiter && recruiterNotes !== undefined) {
            interview.notes.recruiterNotes = recruiterNotes;
        }

        await interview.save();

        const updatedInterview = await Interview.findById(interview._id)
            .populate("job", "title company location")
            .populate("candidate", "firstName lastName email")
            .populate("recruiter", "firstName lastName email company.name");

        res.json({
            message: "Interview updated successfully",
            interview: updatedInterview,
        });
    } catch (error) {
        console.error("Error updating interview:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

// @route   DELETE /api/interviews/:id
// @desc    Cancel interview
// @access  Private
router.delete("/:id", protect, async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Check if user is authorized (recruiter or candidate)
        const isRecruiter = interview.recruiter.toString() === req.user.id;
        const isCandidate = interview.candidate.toString() === req.user.id;

        if (!isRecruiter && !isCandidate) {
            return res.status(403).json({ message: "Not authorized" });
        }

        interview.status = "cancelled";
        await interview.save();

        res.json({ message: "Interview cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling interview:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

// @route   POST /api/interviews/:id/feedback
// @desc    Add interview feedback (Recruiter only)
// @access  Private
router.post("/:id/feedback", protect, async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Check if user is the recruiter
        if (interview.recruiter.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ message: "Only recruiters can add feedback" });
        }

        const {
            rating,
            comments,
            strengths,
            weaknesses,
            recommendation,
            interviewNotes,
        } = req.body;

        interview.feedback = {
            rating,
            comments,
            strengths: strengths || [],
            weaknesses: weaknesses || [],
            recommendation,
        };

        if (interviewNotes) {
            interview.notes.interviewNotes = interviewNotes;
        }

        interview.status = "completed";
        await interview.save();

        // Update job applicant status based on recommendation
        if (recommendation === "hire") {
            await Job.updateOne(
                {
                    _id: interview.job,
                    "applicants.candidateId": interview.candidate,
                },
                {
                    $set: { "applicants.$.status": "hired" },
                }
            );
        } else if (recommendation === "reject") {
            await Job.updateOne(
                {
                    _id: interview.job,
                    "applicants.candidateId": interview.candidate,
                },
                {
                    $set: { "applicants.$.status": "rejected" },
                }
            );
        }

        res.json({
            message: "Feedback added successfully",
            interview,
        });
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

module.exports = router;
