const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const recruiterSchema = new mongoose.Schema(
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
                    "You must be at least 18 years old to register as a recruiter",
            },
        },

        // Company Information
        company: {
            name: {
                type: String,
                required: [true, "Company name is required"],
                trim: true,
                maxlength: [100, "Company name cannot exceed 100 characters"],
            },
            industry: {
                type: String,
                required: [true, "Company industry is required"],
                enum: [
                    "Technology",
                    "Healthcare",
                    "Finance",
                    "Education",
                    "Manufacturing",
                    "Retail",
                    "Construction",
                    "Transportation",
                    "Media",
                    "Government",
                    "Non-profit",
                    "Consulting",
                    "Real Estate",
                    "Hospitality",
                    "Other",
                ],
            },
            size: {
                type: String,
                enum: [
                    "1-10",
                    "11-50",
                    "51-200",
                    "201-1000",
                    "1001-5000",
                    "5000+",
                ],
                required: [true, "Company size is required"],
            },
            website: {
                type: String,
                match: [
                    /^https?:\/\/.+/,
                    "Company website must be a valid URL",
                ],
            },
            description: {
                type: String,
                maxlength: [
                    1000,
                    "Company description cannot exceed 1000 characters",
                ],
            },
            address: {
                street: String,
                city: {
                    type: String,
                    required: [true, "Company city is required"],
                },
                state: {
                    type: String,
                    required: [true, "Company state is required"],
                },
                pincode: String,
                country: {
                    type: String,
                    required: [true, "Company country is required"],
                },
            },
            logo: {
                type: String,
            },
        },

        // Professional Information
        position: {
            type: String,
            required: [true, "Your position in the company is required"],
            trim: true,
            maxlength: [100, "Position cannot exceed 100 characters"],
        },
        department: {
            type: String,
            enum: [
                "HR",
                "Engineering",
                "Sales",
                "Marketing",
                "Operations",
                "Finance",
                "Other",
            ],
            default: "HR",
        },

        // Job Postings
        jobPostings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Job",
            },
        ],

        // Hiring Statistics
        stats: {
            totalJobsPosted: {
                type: Number,
                default: 0,
            },
            activeJobs: {
                type: Number,
                default: 0,
            },
            totalApplicationsReceived: {
                type: Number,
                default: 0,
            },
            totalHires: {
                type: Number,
                default: 0,
            },
        },

        // Account Information
        isActive: {
            type: Boolean,
            default: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isCompanyVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,

        // Subscription/Plan Information
        subscription: {
            plan: {
                type: String,
                enum: ["free", "basic", "premium", "enterprise", "pro"],
                default: "free",
            },
            startDate: Date,
            endDate: Date,
            jobPostLimit: {
                type: Number,
                default: 3, // Free plan limit
            },
        },

        // Profile Completion
        profileCompleteness: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // Communication Preferences
        notifications: {
            emailAlerts: {
                type: Boolean,
                default: true,
            },
            applicationNotifications: {
                type: Boolean,
                default: true,
            },
            marketingEmails: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for full name
recruiterSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for company display name
recruiterSchema.virtual("companyDisplayName").get(function () {
    return this.company?.name || "Company Name Not Set";
});

// Pre-save middleware to hash password
recruiterSchema.pre("save", async function (next) {
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
recruiterSchema.pre("save", function (next) {
    let completeness = 0;
    const fields = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "position",
        "company.name",
        "company.industry",
        "company.size",
        "company.city",
    ];

    fields.forEach((field) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            if (this[parent] && this[parent][child])
                completeness += 100 / fields.length;
        } else {
            if (this[field]) completeness += 100 / fields.length;
        }
    });

    this.profileCompleteness = Math.round(completeness);
    next();
});

// Pre-save middleware to set subscription limits based on plan
recruiterSchema.pre("save", function (next) {
    if (this.isModified("subscription.plan")) {
        switch (this.subscription.plan) {
            case "free":
                this.subscription.jobPostingLimit = 3;
                break;
            case "basic":
                this.subscription.jobPostingLimit = 15;
                break;
            case "premium":
                this.subscription.jobPostingLimit = 50;
                break;
            case "enterprise":
                this.subscription.jobPostingLimit = -1; // Unlimited
                break;
        }
    }
    next();
});

// Instance method to compare password
recruiterSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if can post more jobs
recruiterSchema.methods.canPostJob = function () {
    if (this.subscription.jobPostingLimit === -1) return true; // Unlimited
    return (
        this.subscription.jobPostingsUsed < this.subscription.jobPostingLimit
    );
};

// Instance method to increment job posting count
recruiterSchema.methods.incrementJobPosting = function () {
    this.subscription.jobPostingsUsed += 1;
    this.stats.totalJobsPosted += 1;
    this.stats.activeJobs += 1;
};

// Instance method to generate password reset token
recruiterSchema.methods.createPasswordResetToken = function () {
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
recruiterSchema.index({ "company.name": 1 });
recruiterSchema.index({ "company.industry": 1 });
recruiterSchema.index({ "company.address.city": 1 });
recruiterSchema.index({ createdAt: -1 });
recruiterSchema.index({ isCompanyVerified: 1 });

module.exports = mongoose.model("Recruiter", recruiterSchema);
