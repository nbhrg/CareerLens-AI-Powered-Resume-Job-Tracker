const bcrypt = require("bcryptjs");

const hash = "$2b$12$qpA9518ikVGKACUc.HDxEu9oa9KEsBa2tuvuibdSk7HB9PQKntD3i";

async function crackPasswordOptimized() {
    console.log("🔍 Starting optimized password cracking...");

    // Common patterns to try first
    const patterns = [
        // Simple numbers
        ...Array.from({ length: 100 }, (_, i) => `BhuvanGoyal${i + 1}`),
        // Special years
        "BhuvanGoyal2024",
        "BhuvanGoyal2023",
        "BhuvanGoyal2022",
        "BhuvanGoyal2021",
        "BhuvanGoyal123",
        "BhuvanGoyal1234",
        "BhuvanGoyal12345",
        "BhuvanGoyal@123",
        "BhuvanGoyal#123",
        "BhuvanGoyal!123",
        // Birth years (common patterns)
        "BhuvanGoyal1995",
        "BhuvanGoyal1996",
        "BhuvanGoyal1997",
        "BhuvanGoyal1998",
        "BhuvanGoyal1999",
        "BhuvanGoyal2000",
        "BhuvanGoyal2001",
        "BhuvanGoyal2002",
        "BhuvanGoyal2003",
        // Simple variations
        "BhuvanGoyal",
        "bhuvangoyal",
        "BHUVANGOYAL",
        "BhuvanGoyal466",
        "BhuvanGoyal007",
        "BhuvanGoyal786",
    ];

    console.log(`Testing ${patterns.length} common patterns first...`);

    for (let i = 0; i < patterns.length; i++) {
        if (i % 10 === 0) {
            console.log(`Progress: ${i}/${patterns.length} patterns tested...`);
        }

        const candidate = patterns[i];
        const isMatch = await bcrypt.compare(candidate, hash);

        if (isMatch) {
            console.log(`🎉 Password found: ${candidate}`);
            return candidate;
        }
    }

    console.log("❌ Common patterns failed. Trying extended range...");

    // If common patterns fail, try larger range
    for (let i = 101; i <= 1000; i++) {
        if (i % 50 === 0) {
            console.log(`Extended search: ${i}/1000...`);
        }

        const candidate = `BhuvanGoyal${i}`;
        const isMatch = await bcrypt.compare(candidate, hash);

        if (isMatch) {
            console.log(`🎉 Password found: ${candidate}`);
            return candidate;
        }
    }

    console.log("❌ No match found in the given range.");
    return null;
}

// Add Ctrl+C handling
process.on("SIGINT", () => {
    console.log("\n🛑 Process interrupted by user");
    process.exit(0);
});

console.time("Password cracking time");
crackPasswordOptimized()
    .then((result) => {
        console.timeEnd("Password cracking time");
        if (result) {
            console.log(`✅ Final result: ${result}`);
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
