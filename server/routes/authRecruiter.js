const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
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
} = require("../controllers/authRecruiter");
const { protect } = require("../middleware/auth");

// Validation rules
const registerValidation = [
    body("firstName")
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage(
            "First name is required and must be less than 50 characters"
        ),
    body("lastName")
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage(
            "Last name is required and must be less than 50 characters"
        ),
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
    body("phone")
        .matches(/^\+?[\d\s\-\(\)]{10,}$/)
        .withMessage("Please provide a valid phone number"),
    body("dateOfBirth")
        .isISO8601()
        .withMessage("Please provide a valid date of birth")
        .custom((value) => {
            const age = Math.floor(
                (Date.now() - new Date(value).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
            );
            if (age < 18) {
                throw new Error("You must be at least 18 years old");
            }
            if (age > 100) {
                throw new Error("Please provide a valid date of birth");
            }
            return true;
        }),
    body("position")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage(
            "Position is required and must be less than 100 characters"
        ),
    body("department")
        .optional()
        .isIn([
            "HR",
            "Engineering",
            "Sales",
            "Marketing",
            "Operations",
            "Finance",
            "Other",
        ])
        .withMessage("Invalid department"),
    body("company.name")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage(
            "Company name is required and must be less than 100 characters"
        ),
    body("company.industry")
        .isIn([
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
        ])
        .withMessage("Please select a valid industry"),
    body("company.size")
        .isIn(["1-10", "11-50", "51-200", "201-1000", "1001-5000", "5000+"])
        .withMessage("Please select a valid company size"),
    body("company.website")
        .optional()
        .isURL()
        .withMessage("Company website must be a valid URL"),
    body("company.description")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Company description cannot exceed 1000 characters"),
    body("company.address.city")
        .trim()
        .notEmpty()
        .withMessage("Company city is required"),
    body("company.address.state")
        .trim()
        .notEmpty()
        .withMessage("Company state is required"),
    body("company.address.country")
        .trim()
        .notEmpty()
        .withMessage("Company country is required"),
];

const loginValidation = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
    body("firstName")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("First name must be less than 50 characters"),
    body("lastName")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("Last name must be less than 50 characters"),
    body("phone")
        .optional()
        .matches(/^\+?[\d\s\-\(\)]{10,}$/)
        .withMessage("Please provide a valid phone number"),
    body("position")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Position must be less than 100 characters"),
    body("department")
        .optional()
        .isIn([
            "HR",
            "Engineering",
            "Sales",
            "Marketing",
            "Operations",
            "Finance",
            "Other",
        ])
        .withMessage("Invalid department"),
    body("company.name")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Company name must be less than 100 characters"),
    body("company.industry")
        .optional()
        .isIn([
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
        ])
        .withMessage("Please select a valid industry"),
    body("company.size")
        .optional()
        .isIn(["1-10", "11-50", "51-200", "201-1000", "1001-5000", "5000+"])
        .withMessage("Please select a valid company size"),
    body("company.website")
        .optional()
        .isURL()
        .withMessage("Company website must be a valid URL"),
    body("company.description")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Company description cannot exceed 1000 characters"),
];

const changePasswordValidation = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            "New password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error(
                    "New password must be different from current password"
                );
            }
            return true;
        }),
];

const subscriptionValidation = [
    body("plan")
        .isIn(["free", "basic", "premium", "enterprise"])
        .withMessage("Invalid subscription plan"),
];

// Public routes
router.post("/register", registerValidation, registerRecruiter);
router.post("/login", loginValidation, loginRecruiter);

// Reset password validation
const resetPasswordValidation = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
];

router.post("/reset-password", resetPasswordValidation, resetPassword);

// Protected routes (require authentication)
router.use(protect); // Apply auth middleware to all routes below

router.get("/me", getCurrentRecruiter);
router.put("/profile", updateProfileValidation, updateRecruiterProfile);
router.put("/password", changePasswordValidation, changePassword);
router.put("/subscription", subscriptionValidation, updateSubscription);
router.delete("/account", deactivateAccount);
router.get("/dashboard", getDashboardStats);
router.get("/verification", getVerificationStatus);

module.exports = router;
