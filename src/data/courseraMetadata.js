/**
 * Coursera-Style Academic Metadata & Specializations Dataset
 * Enriches courses with university seals, skills badges, star ratings,
 * "What you will learn" learning outcomes, week-by-week syllabi, and multi-course specializations.
 */

export const SPECIALIZATIONS = [
  {
    id: "spec-cs-ai",
    title: "Computer Science & Artificial Intelligence Foundations Specialization",
    institution: "Harvard & Stanford AI Consortium",
    description: "Launch your career in modern computing. Master computational thinking, algorithm design, deep neural networks, and transformer architectures.",
    courseIds: ["course-cs-foundations", "course-ai-neural-networks"],
    skills: ["Algorithms", "Python", "Deep Learning", "Data Structures", "Neural Networks", "Big O Complexity"],
    rating: 4.9,
    reviewsCount: 32400,
    studentsEnrolled: "185,000+",
    duration: "2 Months at 6 hrs/week",
    level: "Beginner to Intermediate"
  },
  {
    id: "spec-applied-math",
    title: "Mathematics & Theoretical Physics Specialization",
    institution: "MIT & Caltech Academic Initiative",
    description: "Rigorous mathematical foundations for engineering, quantum mechanics, and scientific machine learning.",
    courseIds: ["course-linear-algebra", "course-calculus-analysis", "course-diff-equations", "course-physics-mechanics"],
    skills: ["Linear Algebra", "Vector Spaces", "Multivariable Calculus", "Differential Equations", "Classical Mechanics"],
    rating: 4.9,
    reviewsCount: 41200,
    studentsEnrolled: "220,000+",
    duration: "3 Months at 8 hrs/week",
    level: "Intermediate"
  },
  {
    id: "spec-governance-econ",
    title: "Global Economics, Geopolitics & Constitutional Law Specialization",
    institution: "LSE, Oxford & Yale Consortium",
    description: "Understand the macroeconomic mechanisms, trade networks, constitutional doctrines, and philosophical ethics governing the modern world.",
    courseIds: ["course-microeconomics", "course-macroeconomics", "course-global-geography", "course-law-governance"],
    skills: ["Microeconomics", "Fiscal Policy", "International Trade", "Constitutional Law", "Moral Philosophy"],
    rating: 4.8,
    reviewsCount: 28900,
    studentsEnrolled: "140,000+",
    duration: "3 Months at 5 hrs/week",
    level: "All Levels"
  },
  {
    id: "spec-natural-sciences",
    title: "Cosmology, Genetics & Biophysics Specialization",
    institution: "Caltech, Edinburgh & Princeton Consortium",
    description: "Explore the fabric of spacetime, the genetic blueprint of life, and fundamental electromagnetic fields.",
    courseIds: ["course-astrophysics", "course-genetics-biology", "course-electromagnetism"],
    skills: ["Astrophysics", "General Relativity", "CRISPR & DNA", "Electromagnetism", "Quantum Foundations"],
    rating: 4.9,
    reviewsCount: 19800,
    studentsEnrolled: "95,000+",
    duration: "2 Months at 6 hrs/week",
    level: "Intermediate"
  }
];

export const COURSE_DETAILS_MAP = {
  "course-cs-foundations": {
    rating: 4.9,
    reviewsCount: "18,450",
    studentsEnrolled: "142,000+",
    duration: "4 Weeks (4–6 hours/week)",
    level: "Beginner Level • No prior programming required",
    skills: ["Computational Thinking", "C / Python Syntax", "Data Structures", "Sorting Algorithms", "Big O Complexity"],
    instructor: {
      name: "Prof. David J. Malan",
      role: "Gordon McKay Professor of the Practice of Computer Science",
      department: "School of Engineering and Applied Sciences",
      institution: "Harvard University"
    },
    whatYouWillLearn: [
      "Develop a deep understanding of computational thinking and algorithmic problem solving.",
      "Understand memory allocation, pointers, binary representations, and stack vs heap architectures.",
      "Analyze sorting, searching, and tree traversal algorithms with Big O notation.",
      "Read historical cybernetic logic and apply concepts to modern software engineering."
    ],
    weeks: [
      { week: 1, title: "Week 1: Computational Thinking, Binary & Logic Gates", duration: "3h 15m", lessonsCount: 2 },
      { week: 2, title: "Week 2: Computability, Turing Machines & Algorithm Design", duration: "3h 45m", lessonsCount: 2 },
      { week: 3, title: "Week 3: Recursive Search, Cybernetics & Sorting Methods", duration: "4h 10m", lessonsCount: 2 }
    ]
  },
  "course-ai-neural-networks": {
    rating: 4.9,
    reviewsCount: "24,800",
    studentsEnrolled: "186,000+",
    duration: "4 Weeks (5–8 hours/week)",
    level: "Intermediate • Basic linear algebra recommended",
    skills: ["Neural Networks", "Deep Learning", "Backpropagation", "Transformer Models", "AI Ethics"],
    instructor: {
      name: "Grant Sanderson & Stanford AI Faculty",
      role: "Visiting Lecturer in Mathematics & Neural Systems",
      department: "Stanford Artificial Intelligence Laboratory (SAIL)",
      institution: "Stanford University"
    },
    whatYouWillLearn: [
      "Build a geometric intuition for high-dimensional gradient descent and backpropagation.",
      "Understand the internal linear algebra transformations inside multilayer perceptrons.",
      "Trace the historical evolution of perceptrons through modern Transformer self-attention.",
      "Evaluate algorithmic bias, alignment, and ethical constraints in AI deployment."
    ],
    weeks: [
      { week: 1, title: "Week 1: Anatomy of a Neural Network & Activation Functions", duration: "3h 30m", lessonsCount: 2 },
      { week: 2, title: "Week 2: Gradient Descent, Calculus of Backpropagation & Loss", duration: "4h 00m", lessonsCount: 2 },
      { week: 3, title: "Week 3: Transformer Architectures, NLP & Responsible AI", duration: "3h 45m", lessonsCount: 2 }
    ]
  },
  "course-linear-algebra": {
    rating: 4.9,
    reviewsCount: "29,100",
    studentsEnrolled: "210,000+",
    duration: "4 Weeks (4–6 hours/week)",
    level: "Beginner to Intermediate",
    skills: ["Vector Spaces", "Matrix Transformations", "Eigenvalues & Eigenvectors", "Dot & Cross Products"],
    instructor: {
      name: "Prof. Gilbert Strang (MIT OCW)",
      role: "Professor of Mathematics",
      department: "Department of Mathematics",
      institution: "Massachusetts Institute of Technology"
    },
    whatYouWillLearn: [
      "Visualize matrices as linear coordinate space transformations rather than simple tables of numbers.",
      "Master determinants, null spaces, column spaces, and rank-nullity theorems.",
      "Compute eigenvalues and eigenvectors and apply them to dynamical systems and PCA.",
      "Bridge pure mathematical definitions with computational vector graphics."
    ],
    weeks: [
      { week: 1, title: "Week 1: Vectors, Linear Combinations & Span", duration: "3h 00m", lessonsCount: 2 },
      { week: 2, title: "Week 2: Matrix Multiplications, Inverses & Determinants", duration: "3h 30m", lessonsCount: 2 },
      { week: 3, title: "Week 3: Eigenvalues, Diagonalization & Spectral Theorem", duration: "4h 00m", lessonsCount: 2 }
    ]
  },
  "course-calculus-analysis": {
    rating: 4.8,
    reviewsCount: "17,600",
    studentsEnrolled: "118,000+",
    duration: "4 Weeks (5–7 hours/week)",
    level: "Intermediate",
    skills: ["Differential Calculus", "Integral Calculus", "Taylor Series", "Optimization", "Chain Rule"],
    instructor: {
      name: "MIT Mathematics Faculty",
      role: "Faculty in Pure & Applied Analysis",
      department: "Department of Mathematics",
      institution: "Massachusetts Institute of Technology"
    },
    whatYouWillLearn: [
      "Understand the epsilon-delta foundation of limits and continuity.",
      "Derive derivatives geometrically through tangent secants and the Fundamental Theorem of Calculus.",
      "Formulate Taylor series approximations for transcendental and exponential functions.",
      "Apply optimization techniques to physics and machine learning loss surfaces."
    ],
    weeks: [
      { week: 1, title: "Week 1: Limits, Tangents & The Geometric Derivative", duration: "3h 15m", lessonsCount: 2 },
      { week: 2, title: "Week 2: Integration, Riemann Sums & Accumulation Functions", duration: "3h 45m", lessonsCount: 2 },
      { week: 3, title: "Week 3: Taylor Polynomials, Power Series & Multivariable Gradients", duration: "4h 15m", lessonsCount: 2 }
    ]
  }
};

/**
 * Fallback generator for courses not explicitly in COURSE_DETAILS_MAP
 */
export function getCourseDetails(course) {
  if (!course) return null;
  const existing = COURSE_DETAILS_MAP[course.id];
  if (existing) return existing;

  // Sensible Coursera-style defaults based on course metadata
  const defaultSkills = [
    `${course.category} Principles`,
    "Critical Analysis",
    "Conceptual Modeling",
    "Practical Problem Solving"
  ];

  return {
    rating: 4.8,
    reviewsCount: "12,800",
    studentsEnrolled: "78,000+",
    duration: "4 Weeks (3–5 hours/week)",
    level: `${course.difficulty || "Beginner"} Level • Shareable Certificate`,
    skills: defaultSkills,
    instructor: {
      name: course.instructorName || "OpenLearn Academic Faculty",
      role: "Lead Course Director & Research Scholar",
      department: `${course.category} Department`,
      institution: course.institution || "Open Educational Resources Consortium"
    },
    whatYouWillLearn: [
      `Master core foundations and theorems in ${course.title}.`,
      `Engage with primary sources, video lectures, and peer-reviewed literature.`,
      `Synthesize complex academic concepts into actionable methodologies.`,
      `Complete interactive checkpoints and earn a verifiable credential from ${course.institution || "OpenLearn"}.`
    ],
    weeks: [
      { week: 1, title: "Week 1: Core Theorems & Historical Foundations", duration: "2h 45m", lessonsCount: 2 },
      { week: 2, title: "Week 2: Methodological Frameworks & Key Mechanisms", duration: "3h 15m", lessonsCount: 2 },
      { week: 3, title: "Week 3: Practical Applications, Primary Texts & Assessment", duration: "3h 30m", lessonsCount: 2 }
    ]
  };
}
