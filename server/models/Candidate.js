const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const candidateSchema = new mongoose.Schema(
    {
        // Personal Information
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            maxlength: [50, "First name cannot exceed 50 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            maxlength: [50, "Last name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Don't include password in queries by default
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            match: [
                /^\+?[\d\s\-\(\)]{10,}$/,
                "Please enter a valid phone number",
            ],
        },
        dateOfBirth: {
            type: Date,
            required: [true, "Date of birth is required"],
            validate: {
                validator: function (value) {
                    const today = new Date();
                    const birthDate = new Date(value);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDifference =
                        today.getMonth() - birthDate.getMonth();

                    if (
                        monthDifference < 0 ||
                        (monthDifference === 0 &&
                            today.getDate() < birthDate.getDate())
                    ) {
                        age--;
                    }

                    return age >= 18;
                },
                message:
                    "You must be at least 18 years old to register as a candidate",
            },
        },

        // Address Information
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },

        // Professional Information
        experience: {
            type: Number,
            default: 0,
            min: [0, "Experience cannot be negative"],
        },
        skills: [
            {
                type: String,
                trim: true,
            },
        ],
        education: [
            {
                degree: String,
                institution: String,
                graduationYear: Number,
                grade: String,
            },
        ],

        // Resume and Portfolio
        resume: {
            filename: String,
            originalName: String,
            path: String,
            size: Number,
            uploadDate: {
                type: Date,
                default: Date.now,
            },
        },
        portfolioUrl: {
            type: String,
            match: [/^https?:\/\/.+/, "Portfolio URL must be a valid URL"],
        },
        linkedinUrl: {
            type: String,
            match: [
                /^https?:\/\/(www\.)?linkedin\.com\/.+/,
                "LinkedIn URL must be a valid LinkedIn profile URL",
            ],
        },

        // Job Preferences
        preferredJobType: {
            type: String,
            enum: [
                "full-time",
                "part-time",
                "contract",
                "internship",
                "remote",
            ],
            default: "full-time",
        },
        expectedSalary: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: "USD",
            },
        },
        preferredLocations: [String],

        // Application Tracking
        applications: [
            {
                jobId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Job",
                },
                appliedDate: {
                    type: Date,
                    default: Date.now,
                },
                status: {
                    type: String,
                    enum: [
                        "applied",
                        "under-review",
                        "interviewed",
                        "hired",
                        "rejected",
                    ],
                    default: "applied",
                },
            },
        ],

        // Account Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,

        // Profile Completion
        profileCompleteness: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for full name
candidateSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
candidateSchema.virtual("age").get(function () {
    if (this.dateOfBirth) {
        return Math.floor(
            (Date.now() - this.dateOfBirth.getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
        );
    }
    return null;
});

// Pre-save middleware to hash password
candidateSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        this.password = await bcrypt.hash(this.password, rounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to calculate profile completeness
candidateSchema.pre("save", function (next) {
    let completeness = 0;

    // Define fields with their weights (must add up to 100)
    const fieldWeights = {
        firstName: 8, // 8%
        lastName: 8, // 8%
        email: 8, // 8% (always present but counted)
        phone: 8, // 8%
        dateOfBirth: 8, // 8%
        "address.city": 5, // 5%
        "address.country": 5, // 5%
        "address.street": 3, // 3%
        experience: 8, // 8%
        skills: 15, // 15%
        education: 15, // 15%
        preferredJobType: 5, // 5%
        portfolioUrl: 2, // 2%
        linkedinUrl: 2, // 2%
        // Total: 100%
    };

    // Calculate completeness based on field weights
    Object.keys(fieldWeights).forEach((field) => {
        const weight = fieldWeights[field];

        if (field.includes(".")) {
            // Handle nested fields like address.city
            const [parent, child] = field.split(".");
            if (
                this[parent] &&
                this[parent][child] &&
                this[parent][child].toString().trim()
            ) {
                completeness += weight;
            }
        } else {
            // Handle direct fields
            if (this[field] !== undefined && this[field] !== null) {
                if (Array.isArray(this[field])) {
                    // For arrays, check if they have content
                    if (this[field].length > 0) {
                        completeness += weight;
                    }
                } else if (typeof this[field] === "string") {
                    // For strings, check if they're not empty after trim
                    if (this[field].trim()) {
                        completeness += weight;
                    }
                } else if (typeof this[field] === "number") {
                    // For numbers, include 0 as valid (experience can be 0)
                    completeness += weight;
                } else {
                    // For other types (boolean, objects), just check if they exist
                    completeness += weight;
                }
            }
        }
    });

    // Ensure completeness never exceeds 100
    this.profileCompleteness = Math.min(Math.round(completeness), 100);
    next();
});

// Instance method to compare password
candidateSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password reset token
candidateSchema.methods.createPasswordResetToken = function () {
    const resetToken = require("crypto").randomBytes(32).toString("hex");

    this.passwordResetToken = require("crypto")
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Indexes for better query performance
// Note: email index is already created by unique: true in schema
candidateSchema.index({ "applications.jobId": 1 });
candidateSchema.index({ skills: 1 });
candidateSchema.index({ preferredLocations: 1 });
candidateSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Candidate", candidateSchema);
