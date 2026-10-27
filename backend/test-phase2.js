const assert = require("assert");
const { createServer } = require("./server");

async function runPhase2Tests() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    console.log("1. Logging in as Learner and Instructor...");
    const learnerLogin = await (
      await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "learner@openlearn.org", password: "password123" })
      })
    ).json();
    const learnerToken = learnerLogin.token;

    const instructorLogin = await (
      await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "instructor@openlearn.org", password: "password123" })
      })
    ).json();
    const instructorToken = instructorLogin.token;

    console.log("2. Testing GET /api/courses with Learner auth...");
    const coursesRes = await fetch(`${baseUrl}/api/courses`, {
      headers: { Authorization: `Bearer ${learnerToken}` }
    });
    assert.strictEqual(coursesRes.status, 200);
    const { courses } = await coursesRes.json();
    assert.ok(courses.length >= 4, "Should return seeded courses");
    const csCourse = courses.find((c) => c.id === "course-cs-foundations");
    assert.ok(csCourse.isEnrolled, "Demo learner should be enrolled in CS Foundations");
    console.log(`   ✓ Loaded ${courses.length} courses. CS Foundations enrolled=${csCourse.isEnrolled}`);

    console.log("3. Testing GET /api/courses/:id with lessons...");
    const singleCourseRes = await fetch(`${baseUrl}/api/courses/course-cs-foundations`, {
      headers: { Authorization: `Bearer ${learnerToken}` }
    });
    assert.strictEqual(singleCourseRes.status, 200);
    const { course } = await singleCourseRes.json();
    assert.ok(course.lessons.length >= 4, "Should have lessons");
    assert.ok(course.institution, "Course should have institution");
    console.log(`   ✓ Loaded course "${course.title}" from "${course.institution}" with ${course.lessons.length} lessons`);

    console.log("4. Testing POST /api/lessons/:id/toggle-complete...");
    const firstLessonId = course.lessons[0].id;
    const toggleRes = await fetch(`${baseUrl}/api/lessons/${firstLessonId}/toggle-complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${learnerToken}` }
    });
    assert.strictEqual(toggleRes.status, 200);
    const { progress } = await toggleRes.json();
    assert.strictEqual(typeof progress.completed, "boolean");
    console.log(`   ✓ Lesson ${firstLessonId} completed=${progress.completed}, course progress=${progress.progressPercent}%`);

    console.log("5. Testing POST /api/courses/:id/enroll on a new course...");
    const enrollRes = await fetch(`${baseUrl}/api/courses/course-world-civics/enroll`, {
      method: "POST",
      headers: { Authorization: `Bearer ${learnerToken}` }
    });
    assert.strictEqual(enrollRes.status, 200);
    const enrollData = await enrollRes.json();
    assert.strictEqual(enrollData.course.isEnrolled, true);
    console.log("   ✓ Enrolled learner in Global Geography, Civics & Trade History");

    console.log("6. Testing POST /api/quizzes/attempts...");
    const quizRes = await fetch(`${baseUrl}/api/quizzes/attempts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${learnerToken}`
      },
      body: JSON.stringify({
        courseId: "course-cs-foundations",
        categoryName: "Science: Computers",
        score: 4,
        totalQuestions: 5
      })
    });
    assert.strictEqual(quizRes.status, 201);
    const quizData = await quizRes.json();
    assert.strictEqual(quizData.attempt.score, 4);
    console.log("   ✓ Recorded quiz attempt: 4/5");

    console.log("7. Testing POST & GET /api/bookmarks...");
    const bmkRes = await fetch(`${baseUrl}/api/bookmarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${learnerToken}`
      },
      body: JSON.stringify({
        resourceType: "gutenberg",
        title: "Plato's Republic",
        sourceRef: "1497",
        metadata: { author: "Plato" }
      })
    });
    assert.strictEqual(bmkRes.status, 201);
    const bmkData = await bmkRes.json();
    assert.ok(bmkData.bookmark.id);
    console.log("   ✓ Saved OER bookmark:", bmkData.bookmark.title);

    console.log("8. Testing Instructor POST /api/courses & POST /api/courses/:id/lessons...");
    const createCourseRes = await fetch(`${baseUrl}/api/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instructorToken}`
      },
      body: JSON.stringify({
        title: "Astrophysics & Cosmology",
        category: "Physics",
        difficulty: "Intermediate",
        description: "Explore stellar evolution, relativity, and black holes via OER APIs.",
        lessons: [
          {
            title: "Black Holes & Event Horizons",
            lessonType: "wikipedia",
            sourceRef: "Black_hole",
            contentBody: "Relativistic astrophysics overview."
          }
        ]
      })
    });
    assert.strictEqual(createCourseRes.status, 201);
    const createdCourse = (await createCourseRes.json()).course;
    assert.strictEqual(createdCourse.lessons.length, 1);

    const addLessonRes = await fetch(`${baseUrl}/api/courses/${createdCourse.id}/lessons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instructorToken}`
      },
      body: JSON.stringify({
        title: "Relativity: The Special and General Theory (Einstein #5001)",
        lessonType: "gutenberg",
        sourceRef: "5001",
        contentBody: "Albert Einstein's classic work on relativity."
      })
    });
    assert.strictEqual(addLessonRes.status, 201);
    console.log(`   ✓ Instructor created course "${createdCourse.title}" and added Gutenberg lesson #5001`);

    // Clean up temporary test course so DB stays clean
    await fetch(`${baseUrl}/api/courses/${createdCourse.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${instructorToken}` }
    });

    console.log("9. Testing GET /api/dashboard for Learner...");
    const dashRes = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${learnerToken}` }
    });
    assert.strictEqual(dashRes.status, 200);
    const dashData = await dashRes.json();
    assert.ok(dashData.stats.enrolledCoursesCount >= 3);
    assert.ok(dashData.stats.quizzesTakenCount >= 1);
    console.log("   ✓ Learner dashboard stats:", dashData.stats);

    console.log("\nALL PHASE 2 TESTS PASSED SUCCESSFULLY!");
  } finally {
    server.close();
  }
}

runPhase2Tests().catch((err) => {
  console.error("Phase 2 Test Failed:", err);
  process.exit(1);
});
