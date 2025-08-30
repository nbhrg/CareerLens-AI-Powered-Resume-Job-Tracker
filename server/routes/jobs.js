const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const jobController = require("../controllers/jobs");

// Public routes
router.get("/", jobController.getAllJobs);

// Candidate authenticated routes - Place specific routes BEFORE wildcard routes
router.get("/saved", protect, jobController.getSavedJobs);
router.get("/applications", protect, jobController.getCandidateApplications);

// Recruiter authenticated routes - Place specific routes BEFORE wildcard routes
router.get("/recruiter/myjobs", protect, jobController.getRecruiterJobs);
router.get(
    "/recruiter/applicants",
    protect,
    jobController.getRecruiterApplicants
);

// Routes with parameter must come AFTER specific routes
router.get("/:id", jobController.getJobById);
router.post("/:id/apply", protect, jobController.applyToJob);
router.post("/:id/save", protect, jobController.saveJob);
router.delete("/:id/unsave", protect, jobController.unsaveJob);

// Recruiter authenticated routes
router.post("/", protect, jobController.createJob);
router.put("/:id", protect, jobController.updateJob);
router.delete("/:id", protect, jobController.deleteJob);
router.put("/:id/status", protect, jobController.updateApplicationStatus);

module.exports = router;
