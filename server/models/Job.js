const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Job description is required"],
            maxlength: [3000, "Description can't exceed 3000 characters"],
        },
        type: {
            type: String,
            enum: [
                "full-time",
                "part-time",
                "contract",
                "internship",
                "remote",
            ],
            required: [true, "Job type is required"],
        },
        salary: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: "USD",
            },
        },
        location: {
            city: String,
            state: String,
            country: String,
            remote: {
                type: Boolean,
                default: false,
            },
        },
        skills: [String],
        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recruiter",
            required: true,
        },
        company: {
            name: String,
            logo: String,
            website: String,
            industry: String,
            size: String,
        },
        perks: [String],
        benefits: [String],
        applicationDeadline: Date,
        numberOfOpenings: {
            type: Number,
            default: 1,
            min: 1,
        },
        applicants: [
            {
                candidateId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Candidate",
                },
                status: {
                    type: String,
                    enum: ["applied", "interviewed", "hired", "rejected"],
                    default: "applied",
                },
                appliedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        savedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Candidate",
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create text index on title and description only, not on the skills array
jobSchema.index({ title: "text", description: "text" });
// Create a separate index on skills for filtering
jobSchema.index({ skills: 1 });

module.exports = mongoose.model("Job", jobSchema);
