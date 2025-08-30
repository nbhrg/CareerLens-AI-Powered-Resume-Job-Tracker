const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true,
        },
        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recruiter",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Interview title is required"],
            trim: true,
        },
        description: {
            type: String,
            maxlength: [1000, "Description can't exceed 1000 characters"],
        },
        type: {
            type: String,
            enum: ["video", "phone", "in-person"],
            required: [true, "Interview type is required"],
        },
        scheduledDateTime: {
            type: Date,
            required: [true, "Interview date and time is required"],
            validate: {
                validator: function (value) {
                    return value > new Date();
                },
                message:
                    "Interview must be scheduled for a future date and time",
            },
        },
        duration: {
            type: Number, // Duration in minutes
            required: [true, "Interview duration is required"],
            min: [15, "Interview duration must be at least 15 minutes"],
            max: [480, "Interview duration cannot exceed 8 hours"],
        },
        location: {
            type: String,
            required: function () {
                return this.type === "in-person";
            },
        },
        meetingLink: {
            type: String,
            required: function () {
                return this.type === "video";
            },
            match: [/^https?:\/\/.+/, "Meeting link must be a valid URL"],
        },
        phoneNumber: {
            type: String,
            required: function () {
                return this.type === "phone";
            },
        },
        status: {
            type: String,
            enum: [
                "scheduled",
                "rescheduled",
                "completed",
                "cancelled",
                "no-show",
            ],
            default: "scheduled",
        },
        notes: {
            recruiterNotes: String,
            candidateNotes: String,
            interviewNotes: String,
        },
        feedback: {
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            comments: String,
            strengths: [String],
            weaknesses: [String],
            recommendation: {
                type: String,
                enum: ["hire", "reject", "maybe", "next-round"],
            },
        },
        reminders: {
            candidateReminded: {
                type: Boolean,
                default: false,
            },
            recruiterReminded: {
                type: Boolean,
                default: false,
            },
            lastReminderSent: Date,
        },
        rescheduledFrom: {
            type: Date,
        },
        rescheduledReason: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for interview end time
interviewSchema.virtual("endDateTime").get(function () {
    if (this.scheduledDateTime && this.duration) {
        return new Date(
            this.scheduledDateTime.getTime() + this.duration * 60000
        );
    }
    return null;
});

// Virtual for formatted duration
interviewSchema.virtual("formattedDuration").get(function () {
    if (this.duration) {
        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;
        if (hours > 0) {
            return `${hours}h ${minutes > 0 ? minutes + "m" : ""}`.trim();
        }
        return `${minutes}m`;
    }
    return null;
});

// Indexes for better query performance
interviewSchema.index({ job: 1, candidate: 1 });
interviewSchema.index({ recruiter: 1, scheduledDateTime: 1 });
interviewSchema.index({ candidate: 1, scheduledDateTime: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ scheduledDateTime: 1 });

// Pre-save middleware to update job applicant status
interviewSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const Job = mongoose.model("Job");
            await Job.updateOne(
                {
                    _id: this.job,
                    "applicants.candidateId": this.candidate,
                },
                {
                    $set: { "applicants.$.status": "interviewed" },
                }
            );
        } catch (error) {
            console.error("Error updating job applicant status:", error);
        }
    }
    next();
});

module.exports = mongoose.model("Interview", interviewSchema);
