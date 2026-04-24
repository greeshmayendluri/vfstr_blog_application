const { spawn } = require('child_process');

async function testPublishIT() {
    console.log("Starting server...");
    const server = spawn('node', ['server.js'], { cwd: __dirname, shell: true });

    server.stdout.on('data', data => console.log(`[Server]: ${data.toString().trim()}`));
    server.stderr.on('data', data => console.error(`[Server Error]: ${data.toString().trim()}`));

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        console.log("Registering IT user...");
        const email = `testit${Date.now()}@university.edu`;
        const pw = 'password123';

        const regRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'IT Student',
                universityEmail: email,
                password: pw,
                branch: 'IT',
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

        console.log("Attempting to publish post 1 under IT...");
        const postRes1 = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Welcome to IT Department',
                content: 'This is the first post for the Information Technology students.',
                category: 'General'
            })
        });

        if (!postRes1.ok) {
            throw new Error("Post 1 error: " + await postRes1.text());
        }

        const postData1 = await postRes1.json();
        console.log("Post 1 published successfully:");
        console.log(JSON.stringify(postData1, null, 2));

        console.log("Attempting to publish post 2 under IT...");
        const postRes2 = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'IT coding club recruitment',
                content: 'We are hiring new IT members for the coding club.',
                category: 'Events'
            })
        });

        if (!postRes2.ok) {
            throw new Error("Post 2 error: " + await postRes2.text());
        }

        const postData2 = await postRes2.json();
        console.log("Post 2 published successfully:");
        console.log(JSON.stringify(postData2, null, 2));

    } catch (err) {
        console.error("Error occurred:", err.message);
    } finally {
        console.log("Killing server...");
        server.kill();
    }
}

testPublishIT();
