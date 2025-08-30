const mongoose = require("mongoose");
const Candidate = require("./models/Candidate");

async function fixProfileCompleteness() {
    try {
        // Connect to MongoDB - replace with your actual MongoDB URI
        const mongoUri = "mongodb://localhost:27017/job-orbit"; // Update this with your actual MongoDB URI

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Connected to MongoDB");

        // Find all candidates with profileCompleteness > 100 or invalid values
        const candidates = await Candidate.find({
            $or: [
                { profileCompleteness: { $gt: 100 } },
                { profileCompleteness: { $lt: 0 } },
                { profileCompleteness: { $exists: false } },
            ],
        });

        console.log(`Found ${candidates.length} candidates to fix`);

        for (const candidate of candidates) {
            console.log(
                `Fixing candidate: ${candidate.firstName} ${candidate.lastName} (${candidate.email}) - Current: ${candidate.profileCompleteness}%`
            );

            // Save the candidate to trigger the pre-save middleware
            await candidate.save();

            console.log(`Updated to: ${candidate.profileCompleteness}%`);
        }

        console.log("Profile completeness fix completed");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error fixing profile completeness:", error);
        process.exit(1);
    }
}

// Run the fix
fixProfileCompleteness();
