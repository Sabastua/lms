const assert = require("assert");
const { createServer } = require("./server");

async function runPhase1Tests() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    console.log("1. Testing GET /api/health & SQLite Schema Seeding...");
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, "ok");
    assert.ok(healthData.stats.coursesCount >= 4, "Should seed at least 4 OER courses");
    assert.ok(healthData.stats.lessonsCount >= 14, "Should seed course lessons");
    console.log("   ✓ Health check & seeded stats:", healthData.stats);

    console.log("2. Testing POST /api/auth/login with seeded Instructor account...");
    const loginInstRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "instructor@openlearn.org",
        password: "password123"
      })
    });
    assert.strictEqual(loginInstRes.status, 200);
    const instAuth = await loginInstRes.json();
    assert.ok(instAuth.token, "Should return JWT token");
    assert.strictEqual(instAuth.user.role, "instructor");
    console.log("   ✓ Instructor logged in:", instAuth.user.name, `(${instAuth.user.role})`);

    console.log("3. Testing POST /api/auth/login with seeded Learner account...");
    const loginLearnerRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "learner@openlearn.org",
        password: "password123"
      })
    });
    assert.strictEqual(loginLearnerRes.status, 200);
    const learnerAuth = await loginLearnerRes.json();
    assert.strictEqual(learnerAuth.user.role, "learner");
    console.log("   ✓ Learner logged in:", learnerAuth.user.name, `(${learnerAuth.user.role})`);

    console.log("4. Testing GET /api/auth/me with Bearer token...");
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${learnerAuth.token}` }
    });
    assert.strictEqual(meRes.status, 200);
    const meData = await meRes.json();
    assert.strictEqual(meData.user.email, "learner@openlearn.org");
    console.log("   ✓ Verified /api/auth/me token authentication");

    console.log("5. Testing POST /api/auth/register for a new user...");
    const uniqueEmail = `student_${Date.now()}@openlearn.org`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Sam Macharia",
        email: uniqueEmail,
        password: "securepassword",
        role: "learner",
        bio: "Exploring OER APIs"
      })
    });
    assert.strictEqual(regRes.status, 201);
    const regData = await regRes.json();
    assert.strictEqual(regData.user.email, uniqueEmail);
    assert.ok(regData.token);
    console.log("   ✓ Registered new learner:", regData.user.email);

    console.log("\nALL PHASE 1 TESTS PASSED SUCCESSFULLY!");
  } finally {
    server.close();
  }
}

runPhase1Tests().catch((err) => {
  console.error("Phase 1 Test Failed:", err);
  process.exit(1);
});
