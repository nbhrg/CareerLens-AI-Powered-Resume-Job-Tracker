const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Recruiter = require("../models/Recruiter");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
};

// Send token response
const sendTokenResponse = (recruiter, statusCode, res) => {
    const token = generateToken(recruiter._id);

    // Remove password from output
    recruiter.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        data: {
            recruiter,
        },
    });
};

// @desc    Register recruiter
// @route   POST /api/auth/recruiter/register
// @access  Public
const registerRecruiter = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            dateOfBirth,
            position,
            department,
            company,
        } = req.body;

        // Validate age (must be 18 or older)
        if (dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();

            if (
                monthDifference < 0 ||
                (monthDifference === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }

            if (age < 18) {
                return res.status(400).json({
                    success: false,
                    message:
                        "You must be at least 18 years old to register as a recruiter",
                });
            }
        }

        // Check if recruiter already exists
        const existingRecruiter = await Recruiter.findOne({ email });
        if (existingRecruiter) {
            return res.status(409).json({
                success: false,
                message: "Recruiter with this email already exists",
            });
        }

        // Create recruiter
        const recruiter = await Recruiter.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            dateOfBirth,
            position,
            department: department || "HR",
            company: {
                name: company.name,
                industry: company.industry,
                size: company.size,
                website: company.website,
                description: company.description,
                address: company.address,
            },
        });

        sendTokenResponse(recruiter, 201, res);
    } catch (error) {
        console.error("Register recruiter error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
};

// @desc    Login recruiter
// @route   POST /api/auth/recruiter/login
// @access  Public
const loginRecruiter = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Check for recruiter
        const recruiter = await Recruiter.findOne({ email }).select(
            "+password"
        );
        if (!recruiter) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Check if account is active
        if (!recruiter.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "Account has been deactivated. Please contact support.",
            });
        }

        // Check password
        const isMatch = await recruiter.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        sendTokenResponse(recruiter, 200, res);
    } catch (error) {
        console.error("Login recruiter error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login",
        });
    }
};

// @desc    Get current recruiter
// @route   GET /api/auth/recruiter/me
// @access  Private
const getCurrentRecruiter = async (req, res, next) => {
    try {
        const recruiter = await Recruiter.findById(req.user.id);

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                recruiter,
            },
        });
    } catch (error) {
        console.error("Get current recruiter error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// @desc    Update recruiter profile
// @route   PUT /api/auth/recruiter/profile
// @access  Private
const updateRecruiterProfile = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const allowedFields = [
            "firstName",
            "lastName",
            "phone",
            "position",
            "department",
            "company",
            "notifications",
        ];

        const updateData = {};
        Object.keys(req.body).forEach((key) => {
            if (allowedFields.includes(key)) {
                updateData[key] = req.body[key];
            }
        });

        const recruiter = await Recruiter.findByIdAndUpdate(
            req.user.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                recruiter,
            },
        });
    } catch (error) {
        console.error("Update recruiter profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during profile update",
        });
    }
};

// @desc    Change recruiter password
// @route   PUT /api/auth/recruiter/password
// @access  Private
const changePassword = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get recruiter with password
        const recruiter = await Recruiter.findById(req.user.id).select(
            "+password"
        );

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found",
            });
        }

        // Check current password
        const isMatch = await recruiter.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Update password
        recruiter.password = newPassword;
        await recruiter.save();

        sendTokenResponse(recruiter, 200, res);
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during password change",
        });
    }
};

// @desc    Reset password (forgot password)
// @route   POST /api/auth/recruiter/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { email, newPassword } = req.body;

        // Check if recruiter exists
        const recruiter = await Recruiter.findOne({
            email: email.toLowerCase(),
        });

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "No recruiter found with this email address",
            });
        }

        // Check if account is active
        if (!recruiter.isActive) {
            return res.status(400).json({
                success: false,
                message: "This account has been deactivated",
            });
        }

        // Update password
        recruiter.password = newPassword;
        await recruiter.save();

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during password reset",
        });
    }
};

// @desc    Update subscription plan
// @route   PUT /api/auth/recruiter/subscription
// @access  Private
const updateSubscription = async (req, res, next) => {
    try {
        const { plan } = req.body;

        if (!["free", "basic", "premium", "enterprise"].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription plan",
            });
        }

        const recruiter = await Recruiter.findByIdAndUpdate(
            req.user.id,
            {
                "subscription.plan": plan,
                "subscription.startDate": new Date(),
                "subscription.endDate": new Date(
                    Date.now() + 365 * 24 * 60 * 60 * 1000
                ), // 1 year
            },
            { new: true }
        );

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                recruiter,
            },
        });
    } catch (error) {
        console.error("Update subscription error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during subscription update",
        });
    }
};

// @desc    Deactivate recruiter account
// @route   DELETE /api/auth/recruiter/account
// @access  Private
const deactivateAccount = async (req, res, next) => {
    try {
        const recruiter = await Recruiter.findByIdAndUpdate(
            req.user.id,
            { isActive: false },
            { new: true }
        );

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Account has been deactivated successfully",
        });
    } catch (error) {
        console.error("Deactivate account error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during account deactivation",
        });
    }
};

// @desc    Get recruiter dashboard stats
// @route   GET /api/auth/recruiter/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
    try {
        const recruiter = await Recruiter.findById(req.user.id).populate(
            "jobPostings"
        );

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found",
            });
        }

        const stats = {
            totalJobsPosted: recruiter.stats.totalJobsPosted,
            activeJobs: recruiter.stats.activeJobs,
            totalApplicationsReceived:
                recruiter.stats.totalApplicationsReceived,
            totalHires: recruiter.stats.totalHires,
            profileCompleteness: recruiter.profileCompleteness,
            subscriptionPlan: recruiter.subscription.plan,
            jobPostingLimit: recruiter.subscription.jobPostingLimit,
            jobPostingsUsed: recruiter.subscription.jobPostingsUsed,
            canPostMoreJobs: recruiter.canPostJob(),
            isCompanyVerified: recruiter.isCompanyVerified,
        };

        res.status(200).json({
            success: true,
            data: {
                stats,
            },
        });
    } catch (error) {
        console.error("Get dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// @desc    Get company verification status
// @route   GET /api/auth/recruiter/verification
// @access  Private
const getVerificationStatus = async (req, res, next) => {
    try {
        const recruiter = await Recruiter.findById(req.user.id);

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                isEmailVerified: recruiter.isEmailVerified,
                isCompanyVerified: recruiter.isCompanyVerified,
                verificationRequirements: {
                    emailVerification: recruiter.isEmailVerified
                        ? "Completed"
                        : "Pending",
                    companyVerification: recruiter.isCompanyVerified
                        ? "Completed"
                        : "Pending",
                    profileCompletion: `${recruiter.profileCompleteness}%`,
                },
            },
        });
    } catch (error) {
        console.error("Get verification status error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = {
    registerRecruiter,
    loginRecruiter,
    getCurrentRecruiter,
    updateRecruiterProfile,
    changePassword,
    resetPassword,
    updateSubscription,
    deactivateAccount,
    getDashboardStats,
    getVerificationStatus,
};
