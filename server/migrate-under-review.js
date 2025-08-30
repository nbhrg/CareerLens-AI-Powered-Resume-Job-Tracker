const mongoose = require("mongoose");
const Job = require("./models/Job");
const Candidate = require("./models/Candidate");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || "mongodb://localhost:27017/job-orbit"
        );
        console.log("MongoDB connected for migration");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

const migrateUnderReviewStatus = async () => {
    try {
        console.log("Starting migration to remove 'under-review' status...");

        // Update Job applicants with 'under-review' status to 'applied'
        const jobUpdateResult = await Job.updateMany(
            { "applicants.status": "under-review" },
            { $set: { "applicants.$.status": "applied" } }
        );

        console.log(
            `Updated ${jobUpdateResult.modifiedCount} job applicant records`
        );

        // Update Candidate applications with 'under-review' status to 'applied'
        const candidateUpdateResult = await Candidate.updateMany(
            { "applications.status": "under-review" },
            { $set: { "applications.$.status": "applied" } }
        );

        console.log(
            `Updated ${candidateUpdateResult.modifiedCount} candidate application records`
        );

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
};

const runMigration = async () => {
    await connectDB();
    await migrateUnderReviewStatus();
};

// Only run if this file is executed directly
if (require.main === module) {
    runMigration();
}

module.exports = { migrateUnderReviewStatus };
