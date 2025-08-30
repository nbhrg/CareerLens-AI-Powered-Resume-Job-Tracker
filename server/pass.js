const bcrypt = require("bcryptjs");

const hash = "$2b$12$qpA9518ikVGKACUc.HDxEu9oa9KEsBa2tuvuibdSk7HB9PQKntD3i";

async function crackPassword() {
    console.log("🔍 Starting password cracking...");
    console.log("Testing passwords in format: BhuvanGoyal[1-1000]");

    for (let i = 1; i <= 1000; i++) {
        // Show progress every 10 attempts
        if (i % 10 === 0) {
            console.log(`Progress: ${i}/1000 passwords tested...`);
        }

        const candidate = `BhuvanGoyal${i}`;
        const isMatch = await bcrypt.compare(candidate, hash);

        if (isMatch) {
            console.log(`🎉 Password found: ${candidate}`);
            return;
        }
    }
    console.log("❌ No match found in the given range.");
}

// Add error handling and time tracking
console.time("Password cracking time");
crackPassword()
    .then(() => {
        console.timeEnd("Password cracking time");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
