const assert = require("assert");
const { createServer } = require("./server");

async function runImprovementTests() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    console.log("1. Authenticating as Demo Learner...");
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "learner@openlearn.org", password: "password123" })
    });
    assert.strictEqual(loginRes.status, 200);
    const { token: learnerToken, user: learnerUser } = await loginRes.json();
    const authHeader = { Authorization: `Bearer ${learnerToken}`, "Content-Type": "application/json" };

    console.log("2. Fetching course and lesson to test notes & discussions...");
    const coursesRes = await fetch(`${baseUrl}/api/courses`, { headers: authHeader });
    const { courses } = await coursesRes.json();
    const targetCourse = courses[0];
    const courseDetailRes = await fetch(`${baseUrl}/api/courses/${targetCourse.id}`, { headers: authHeader });
    const { course } = await courseDetailRes.json();
    const targetLesson = course.lessons[0];

    console.log("3. Testing Timestamped Lecture Notes...");
    const addNoteRes = await fetch(`${baseUrl}/api/lessons/${targetLesson.id}/notes`, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({
        courseId: course.id,
        timestampSeconds: 125,
        timestampLabel: "02:05",
        content: "Important insight on algorithm time complexity"
      })
    });
    assert.strictEqual(addNoteRes.status, 201);
    const { note } = await addNoteRes.json();
    assert.strictEqual(note.timestampLabel, "02:05");
    console.log(`   ✓ Created note ID: ${note.id} with timestamp [${note.timestampLabel}]`);

    const listNotesRes = await fetch(`${baseUrl}/api/lessons/${targetLesson.id}/notes`, { headers: authHeader });
    const { notes } = await listNotesRes.json();
    assert.ok(notes.some((n) => n.id === note.id));
    console.log(`   ✓ Loaded ${notes.length} notes for lesson`);

    console.log("4. Testing Lesson Discussions...");
    const addDiscRes = await fetch(`${baseUrl}/api/lessons/${targetLesson.id}/discussions`, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ courseId: course.id, content: "Can someone explain the recursive base condition?" })
    });
    assert.strictEqual(addDiscRes.status, 201);
    const { discussion } = await addDiscRes.json();
    assert.ok(discussion.id);

    const listDiscRes = await fetch(`${baseUrl}/api/lessons/${targetLesson.id}/discussions`, { headers: authHeader });
    const { discussions } = await listDiscRes.json();
    assert.ok(discussions.some((d) => d.id === discussion.id));
    console.log(`   ✓ Loaded ${discussions.length} discussion comments`);

    console.log("5. Testing Course Reviews & Ratings...");
    const addRevRes = await fetch(`${baseUrl}/api/courses/${course.id}/reviews`, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ rating: 5, comment: "Exemplary curriculum with authentic university problem sets!" })
    });
    assert.strictEqual(addRevRes.status, 201);
    const { review } = await addRevRes.json();
    assert.strictEqual(review.rating, 5);

    const listRevRes = await fetch(`${baseUrl}/api/courses/${course.id}/reviews`);
    const { reviews } = await listRevRes.json();
    assert.ok(reviews.some((r) => r.id === review.id));
    console.log(`   ✓ Loaded ${reviews.length} course reviews (Average: 5.0)`);

    console.log("6. Testing Certificate of Completion & Public Verification...");
    // Complete all lessons in targetCourse for this learner to earn certificate
    for (const l of course.lessons) {
      await fetch(`${baseUrl}/api/lessons/${l.id}/toggle-complete`, { method: "POST", headers: authHeader });
    }

    const certClaimRes = await fetch(`${baseUrl}/api/courses/${course.id}/certificate`, {
      method: "POST",
      headers: authHeader
    });
    assert.strictEqual(certClaimRes.status, 200);
    const { certificate } = await certClaimRes.json();
    assert.ok(certificate.id);
    assert.ok(certificate.verificationHash);
    assert.strictEqual(certificate.recipientName, learnerUser.name);
    console.log(`   ✓ Issued Certificate ID: ${certificate.id}`);
    console.log(`   ✓ Verification Hash: ${certificate.verificationHash}`);

    // Test Public Verification without auth
    const verifyRes = await fetch(`${baseUrl}/api/certificates/${certificate.id}`);
    assert.strictEqual(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.valid, true);
    assert.strictEqual(verifyData.certificate.verificationHash, certificate.verificationHash);
    console.log(`   ✓ Public Verification passed for: ${verifyData.certificate.recipientName} (${verifyData.certificate.institution})`);

    console.log("\nALL IMPROVEMENT FEATURES VERIFIED 100% SUCCESSFULLY!");
  } finally {
    server.close();
  }
}

runImprovementTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
