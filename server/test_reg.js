async function testReg() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'blog apis',
                universityEmail: 'blogapis@gmail.com',
                password: 'password123',
                branch: 'MECH'
            })
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response:", text);
    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}
testReg();
