async function testLogin() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                universityEmail: 'blogapis@gmail.com',
                password: 'password123'
            })
        });

        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Token received:", data.token ? "Yes" : "No");
    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}
testLogin();
