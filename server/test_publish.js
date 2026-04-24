const { spawn } = require('child_process');

async function testPublish() {
    console.log("Starting server...");
    const server = spawn('node', ['server.js'], { cwd: __dirname, shell: true });

    server.stdout.on('data', data => console.log(`[Server]: ${data.toString().trim()}`));
    server.stderr.on('data', data => console.error(`[Server Error]: ${data.toString().trim()}`));

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        console.log("Registering user...");
        const email = `test${Date.now()}@university.edu`;
        const pw = 'password123';

        const regRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Setup User',
                universityEmail: email,
                password: pw,
                branch: 'CSE',
            })
        });

        if (!regRes.ok && regRes.status !== 400) {
            throw new Error("Reg error: " + await regRes.text());
        }

        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                universityEmail: email,
                password: pw
            })
        });

        if (!loginRes.ok) throw new Error("Login failed: " + await loginRes.text());
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Token obtained:", token ? "Yes" : "No");

        console.log("Attempting to publish post 'cts interview experience' to category 'Placements'...");
        const postRes = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'cts interview experience',
                content: 'My interview at CTS went well.',
                category: 'Placements'
            })
        });

        if (!postRes.ok) {
            throw new Error("Post error: " + await postRes.text());
        }

        const postData = await postRes.json();
        console.log("Post published successfully:");
        console.log(JSON.stringify(postData, null, 2));
    } catch (err) {
        console.error("Error occurred:", err.message);
    } finally {
        console.log("Killing server...");
        server.kill();
    }
}

testPublish();
