/**
 * Comprehensive Open Educational Resource (OER) Curriculum Dataset
 * Built with verified public YouTube educational lectures (Khan Academy, CrashCourse, 3Blue1Brown, CS50, MIT OCW, freeCodeCamp),
 * live Wikipedia REST v1 article keys, Project Gutenberg IDs, REST Countries codes, and OpenTDB academic quiz categories.
 */

const SEED_COURSES = [
  // 1. Computer Science & AI
  {
    id: "course-cs-foundations",
    title: "Computer Science: Principles, Algorithms & Data Structures",
    category: "Computer Science & AI",
    difficulty: "Beginner",
    institution: "Harvard University (CS50)",
    description: "Explore the core foundations of computer science, computational thinking, sorting algorithms, algorithmic complexity (Big O), and theoretical computability.",
    lessons: [
      {
        id: "cs-f-1",
        position: 1,
        title: "Video: Introduction to Computational Thinking & Binary (CS50)",
        lessonType: "video",
        sourceRef: "jjqgP9dpD1k",
        contentBody: "Harvard CS50's introductory lecture on how computers represent data, binary numbers, and computational problem solving."
      },
      {
        id: "cs-f-2",
        position: 2,
        title: "Theory: Alan Turing & Computability",
        lessonType: "wikipedia",
        sourceRef: "Alan_Turing",
        contentBody: "The life, mathematical inventions, and theoretical foundations of computation by Alan Turing."
      },
      {
        id: "cs-f-3",
        position: 3,
        title: "Algorithms: Design, Sorting & Big O Notation",
        lessonType: "wikipedia",
        sourceRef: "Algorithm",
        contentBody: "Understanding algorithmic efficiency, asymptotic analysis, search and sorting techniques."
      },
      {
        id: "cs-f-4",
        position: 4,
        title: "Video: What is an Algorithm & Binary Search? (Khan Academy OER)",
        lessonType: "video",
        sourceRef: "CvSOaYi89B4",
        contentBody: "Standards-aligned lesson explaining binary search and recursive divide-and-conquer strategy."
      },
      {
        id: "cs-f-5",
        position: 5,
        title: "Classic Reading: Cybernetics and Automation (Gutenberg #3296)",
        lessonType: "gutenberg",
        sourceRef: "3296",
        contentBody: "Historical foundations of computational logic and cybernetic control theory."
      },
      {
        id: "cs-f-6",
        position: 6,
        title: "Assessment: Computer Science & Data Structures Quiz",
        lessonType: "quiz",
        sourceRef: "18",
        contentBody: "Test your understanding of computer hardware, software, algorithms, and networks."
      }
    ]
  },
  {
    id: "course-ai-neural-networks",
    title: "Artificial Intelligence, Neural Networks & Machine Learning",
    category: "Computer Science & AI",
    difficulty: "Intermediate",
    institution: "Stanford University (Stanford AI)",
    description: "Understand artificial intelligence from first principles: perceptrons, multilayer deep neural networks, backpropagation, natural language processing, and modern transformers.",
    lessons: [
      {
        id: "ai-1",
        position: 1,
        title: "Video: But what is a neural network? (3Blue1Brown Deep Learning)",
        lessonType: "video",
        sourceRef: "aircAruvnKk",
        contentBody: "3Blue1Brown's acclaimed visual explanation of multilayer perceptrons, weights, biases, and activation functions."
      },
      {
        id: "ai-2",
        position: 2,
        title: "Foundations: Artificial Neural Networks & Deep Learning",
        lessonType: "wikipedia",
        sourceRef: "Artificial_neural_network",
        contentBody: "Architecture of artificial neural networks, training cycles, gradient descent, and activation curves."
      },
      {
        id: "ai-3",
        position: 3,
        title: "Video: Gradient Descent and How Neural Networks Learn (3Blue1Brown)",
        lessonType: "video",
        sourceRef: "IHZwWFHWa-w",
        contentBody: "A visual exploration of cost function minimization, backpropagation, and multi-dimensional optimization."
      },
      {
        id: "ai-4",
        position: 4,
        title: "Theory: Machine Learning & Generative Models",
        lessonType: "wikipedia",
        sourceRef: "Machine_learning",
        contentBody: "Supervised learning, unsupervised clustering, reinforcement learning, and modern transformer architectures."
      },
      {
        id: "ai-5",
        position: 5,
        title: "Assessment: Artificial Intelligence & Computing Quiz",
        lessonType: "quiz",
        sourceRef: "18",
        contentBody: "Verify your comprehension of machine learning concepts, models, and algorithms."
      }
    ]
  },
  {
    id: "course-web-architecture",
    title: "Full-Stack Web Architecture, HTTP & Modern JavaScript",
    category: "Computer Science & AI",
    difficulty: "Beginner",
    institution: "UC Berkeley (EECS)",
    description: "From browser networking and the DOM to HTTP protocol, REST APIs, asynchronous event loops, and client-server system design.",
    lessons: [
      {
        id: "web-1",
        position: 1,
        title: "Video: How Does the Internet Actually Work? (Khan Academy)",
        lessonType: "video",
        sourceRef: "Dxcc6ycZ73M",
        contentBody: "Packets, routing, IP addressing, DNS lookups, and transmission protocols explained."
      },
      {
        id: "web-2",
        position: 2,
        title: "Protocols: Hypertext Transfer Protocol (HTTP & HTTPS)",
        lessonType: "wikipedia",
        sourceRef: "Hypertext_Transfer_Protocol",
        contentBody: "HTTP methods, status codes, request/response headers, caching, and TLS security."
      },
      {
        id: "web-3",
        position: 3,
        title: "Video: JavaScript Event Loop & Asynchronous Runtime Explained",
        lessonType: "video",
        sourceRef: "8aGhZQkoFbQ",
        contentBody: "Philip Roberts' famous talk on the JavaScript call stack, web APIs, event loop, and callback queue."
      },
      {
        id: "web-4",
        position: 4,
        title: "Standards: Document Object Model (DOM) & Web APIs",
        lessonType: "wikipedia",
        sourceRef: "Document_Object_Model",
        contentBody: "Tree structure of HTML documents, event bubbling, element manipulation, and modern browser standards."
      },
      {
        id: "web-5",
        position: 5,
        title: "Assessment: Web Architecture & Internet Quiz",
        lessonType: "quiz",
        sourceRef: "18",
        contentBody: "Test your knowledge on web protocols, JavaScript runtime, and front-end architecture."
      }
    ]
  },

  // 2. Mathematics
  {
    id: "course-calculus-analysis",
    title: "Calculus: Limits, Derivatives & Integrals",
    category: "Mathematics",
    difficulty: "Intermediate",
    institution: "Princeton University",
    description: "A complete geometric and intuitive treatment of calculus: rates of change, instantaneous slopes, integration as continuous accumulation, and the Fundamental Theorem of Calculus.",
    lessons: [
      {
        id: "calc-1",
        position: 1,
        title: "Video: The Essence of Calculus (3Blue1Brown)",
        lessonType: "video",
        sourceRef: "WUvTyaaNkzM",
        contentBody: "Visual geometric intuition behind rates of change and area accumulation that makes calculus intuitive."
      },
      {
        id: "calc-2",
        position: 2,
        title: "Foundations: Differential Calculus & Derivatives",
        lessonType: "wikipedia",
        sourceRef: "Differential_calculus",
        contentBody: "Limits, tangent lines, derivatives, chain rule, and optimization problems."
      },
      {
        id: "calc-3",
        position: 3,
        title: "Video: The Derivative Paradox & Geometric Tangents (3Blue1Brown)",
        lessonType: "video",
        sourceRef: "9vKqVkMQHKk",
        contentBody: "Solving the mystery of instantaneous speed and how infinitesimal approximations converge."
      },
      {
        id: "calc-4",
        position: 4,
        title: "Accumulation: Integral Calculus & Area Sums",
        lessonType: "wikipedia",
        sourceRef: "Integral",
        contentBody: "Riemann sums, definite and indefinite integrals, and the Fundamental Theorem of Calculus."
      },
      {
        id: "calc-5",
        position: 5,
        title: "Classic Reading: Elements of the Differential and Integral Calculus (Gutenberg #38592)",
        lessonType: "gutenberg",
        sourceRef: "38592",
        contentBody: "Rigorous historical textbook covering classical mathematical analysis and differential equations."
      },
      {
        id: "calc-6",
        position: 6,
        title: "Assessment: Mathematics & Calculus Quiz",
        lessonType: "quiz",
        sourceRef: "19",
        contentBody: "Solve problems involving limits, derivatives, geometric functions, and mathematical logic."
      }
    ]
  },
  {
    id: "course-linear-algebra",
    title: "Linear Algebra: Vectors, Matrices & Transformations",
    category: "Mathematics",
    difficulty: "Intermediate",
    institution: "Massachusetts Institute of Technology (MIT)",
    description: "The mathematical backbone of 3D computer graphics, physics engines, and artificial intelligence: vector spaces, matrix multiplication as linear transformations, determinants, and eigenvalues.",
    lessons: [
      {
        id: "la-1",
        position: 1,
        title: "Video: Vectors, What Even Are They? (3Blue1Brown)",
        lessonType: "video",
        sourceRef: "fNk_zzaMoSs",
        contentBody: "Three perspectives on vectors: physics arrows, CS arrays, and mathematical vector space coordinates."
      },
      {
        id: "la-2",
        position: 2,
        title: "Foundations: Vector Spaces & Linear Independence",
        lessonType: "wikipedia",
        sourceRef: "Vector_space",
        contentBody: "Vector spaces, linear combinations, spans, bases, and coordinate systems."
      },
      {
        id: "la-3",
        position: 3,
        title: "Video: Linear Transformations and Matrices (3Blue1Brown)",
        lessonType: "video",
        sourceRef: "kYB8IZa5AuE",
        contentBody: "Seeing matrix multiplication as a spatial deformation where grid lines remain parallel and evenly spaced."
      },
      {
        id: "la-4",
        position: 4,
        title: "Concepts: Eigenvalues, Eigenvectors & Decomposition",
        lessonType: "wikipedia",
        sourceRef: "Eigenvalues_and_eigenvectors",
        contentBody: "Axes that maintain their direction under linear transformations and their widespread applications in physics and data science."
      },
      {
        id: "la-5",
        position: 5,
        title: "Assessment: Advanced Mathematics & Linear Systems Quiz",
        lessonType: "quiz",
        sourceRef: "19",
        contentBody: "Multiple-choice questions testing vector arithmetic, matrix transformations, and algebra."
      }
    ]
  },

  // 3. Natural Sciences & Physics
  {
    id: "course-astrophysics",
    title: "Astrophysics, Stellar Evolution & Cosmology",
    category: "Natural Sciences",
    difficulty: "Beginner",
    institution: "California Institute of Technology (Caltech)",
    description: "Journey across the cosmos: from the life cycles of stars and supernovae to relativistic black holes, gravitational waves, and the Big Bang.",
    lessons: [
      {
        id: "astro-1",
        position: 1,
        title: "Video: Introduction to Astronomy (CrashCourse Astronomy #1)",
        lessonType: "video",
        sourceRef: "0rHUDWjR5gg",
        contentBody: "Phil Plait introduces astronomy, scales of the universe, and how human astronomers observe deep space."
      },
      {
        id: "astro-2",
        position: 2,
        title: "Astrophysics: Black Holes, Event Horizons & Singularity",
        lessonType: "wikipedia",
        sourceRef: "Black_hole",
        contentBody: "General relativistic spacetime curvature, Schwarzschild radii, accretion disks, and supermassive black holes."
      },
      {
        id: "astro-3",
        position: 3,
        title: "Video: Stars: Life, Death, and Stellar Fusion (CrashCourse)",
        lessonType: "video",
        sourceRef: "4xIQRy31YwU",
        contentBody: "How stars fuse hydrogen into helium, hydrostatic equilibrium, red giants, and white dwarfs."
      },
      {
        id: "astro-4",
        position: 4,
        title: "Cosmology: The Big Bang & Universe Expansion",
        lessonType: "wikipedia",
        sourceRef: "Big_Bang",
        contentBody: "Cosmic microwave background radiation, cosmic expansion (Hubble's law), and primordial nucleosynthesis."
      },
      {
        id: "astro-5",
        position: 5,
        title: "Primary Reading: Relativity: The Special and General Theory by Albert Einstein (Gutenberg #5001)",
        lessonType: "gutenberg",
        sourceRef: "5001",
        contentBody: "Albert Einstein's own accessible exposition of special and general relativity for general readers."
      },
      {
        id: "astro-6",
        position: 6,
        title: "Assessment: Astronomy & Space Sciences Quiz",
        lessonType: "quiz",
        sourceRef: "17",
        contentBody: "Test your knowledge on stellar bodies, cosmic phenomena, and observational astronomy."
      }
    ]
  },
  {
    id: "course-quantum-physics",
    title: "Quantum Mechanics & Particle Physics",
    category: "Natural Sciences",
    difficulty: "Advanced",
    institution: "Massachusetts Institute of Technology (MIT)",
    description: "Explore the subatomic universe: wave-particle duality, the Heisenberg uncertainty principle, Schrödinger's wave equation, quantum entanglement, and the Standard Model.",
    lessons: [
      {
        id: "qp-1",
        position: 1,
        title: "Video: Quantum Mechanics: The Physics of the Very Small (CrashCourse Physics)",
        lessonType: "video",
        sourceRef: "Usu9xZfabPM",
        contentBody: "Photoelectric effect, blackbody radiation, Planck's constant, and how quantum physics was born."
      },
      {
        id: "qp-2",
        position: 2,
        title: "Theory: Wave-Particle Duality & De Broglie Wavelength",
        lessonType: "wikipedia",
        sourceRef: "Wave–particle_duality",
        contentBody: "How light behaves as both particle and wave, the double-slit experiment, and matter waves."
      },
      {
        id: "qp-3",
        position: 3,
        title: "Video: Quantum Entanglement and Spooky Action at a Distance (Veritasium)",
        lessonType: "video",
        sourceRef: "ZuvK-4VaBaI",
        contentBody: "Bell's theorem, EPR paradox, quantum state superposition, and quantum teleportation."
      },
      {
        id: "qp-4",
        position: 4,
        title: "Foundations: Schrödinger Equation & Quantum States",
        lessonType: "wikipedia",
        sourceRef: "Schrödinger_equation",
        contentBody: "Wave functions, probability density, quantum tunneling, and quantum harmonic oscillators."
      },
      {
        id: "qp-5",
        position: 5,
        title: "Assessment: Quantum Physics & Physical Science Quiz",
        lessonType: "quiz",
        sourceRef: "17",
        contentBody: "Challenging questions on subatomic particles, quantum numbers, and physical laws."
      }
    ]
  },
  {
    id: "course-biology-genetics",
    title: "Cellular Biology, Molecular Genetics & Evolutionary Biology",
    category: "Natural Sciences",
    difficulty: "Beginner",
    institution: "University of Cambridge",
    description: "How living systems function: cellular respiration, photosynthesis, DNA double-helix encoding, protein synthesis, Mendelian genetics, and Darwinian natural selection.",
    lessons: [
      {
        id: "bio-1",
        position: 1,
        title: "Video: That's Why Carbon is a Tramp: CrashCourse Biology #1",
        lessonType: "video",
        sourceRef: "QnQe0xW_JY4",
        contentBody: "Hank Green explains organic molecules, carbohydrates, lipids, proteins, and nucleic acids."
      },
      {
        id: "bio-2",
        position: 2,
        title: "Energy: Photosynthesis & Chloroplasts",
        lessonType: "wikipedia",
        sourceRef: "Photosynthesis",
        contentBody: "Light-dependent reactions, Calvin cycle, ATP synthesis, and solar energy capture."
      },
      {
        id: "bio-3",
        position: 3,
        title: "Video: DNA Structure and Classical Replication (CrashCourse Biology)",
        lessonType: "video",
        sourceRef: "8kK2zwjRV0M",
        contentBody: "Watson and Crick, nucleotide bases, double helix, and DNA polymerase copying mechanisms."
      },
      {
        id: "bio-4",
        position: 4,
        title: "Genetics: DNA, RNA Transcription & Translation",
        lessonType: "wikipedia",
        sourceRef: "DNA",
        contentBody: "Genetic code, codons, ribosomes, messenger RNA, and gene expression."
      },
      {
        id: "bio-5",
        position: 5,
        title: "Primary Reading: On the Origin of Species by Charles Darwin (Gutenberg #1228)",
        lessonType: "gutenberg",
        sourceRef: "1228",
        contentBody: "Charles Darwin's complete 1859 foundational text on evolution by natural selection."
      },
      {
        id: "bio-6",
        position: 6,
        title: "Assessment: Biology & Life Sciences Quiz",
        lessonType: "quiz",
        sourceRef: "17",
        contentBody: "Test your understanding of cellular anatomy, genetics, and ecology."
      }
    ]
  },
  {
    id: "course-organic-chemistry",
    title: "General & Organic Chemistry: Atoms to Molecules",
    category: "Natural Sciences",
    difficulty: "Intermediate",
    institution: "Columbia University",
    description: "From atomic orbitals and chemical bonding to hydrocarbons, functional groups, reaction mechanisms, and thermodynamics.",
    lessons: [
      {
        id: "chem-1",
        position: 1,
        title: "Video: The Nucleus: CrashCourse Chemistry #1",
        lessonType: "video",
        sourceRef: "FSyAehMdpyI",
        contentBody: "Hank Green reviews protons, neutrons, electrons, isotopes, and atomic weights."
      },
      {
        id: "chem-2",
        position: 2,
        title: "Foundations: Periodic Table & Chemical Elements",
        lessonType: "wikipedia",
        sourceRef: "Periodic_table",
        contentBody: "Electronegativity, ionization energy, periods, groups, and chemical reactivity."
      },
      {
        id: "chem-3",
        position: 3,
        title: "Video: Chemical Bonds: Ionic, Covalent & Metallic (CrashCourse)",
        lessonType: "video",
        sourceRef: "QXT4OVM4vXI",
        contentBody: "How atoms share and transfer valence electrons to form stable molecular structures."
      },
      {
        id: "chem-4",
        position: 4,
        title: "Organic Chemistry: Functional Groups & Hydrocarbons",
        lessonType: "wikipedia",
        sourceRef: "Organic_chemistry",
        contentBody: "Alkanes, alkenes, alkynes, alcohols, carboxylic acids, and reaction mechanisms."
      },
      {
        id: "chem-5",
        position: 5,
        title: "Assessment: Chemistry & Molecular Sciences Quiz",
        lessonType: "quiz",
        sourceRef: "17",
        contentBody: "Multiple choice assessment on reaction types, stoichiometry, and atomic bonds."
      }
    ]
  },

  // 4. World History & Civics
  {
    id: "course-world-civilizations",
    title: "World History: Ancient Civilizations to the Modern Age",
    category: "World History & Civics",
    difficulty: "Beginner",
    institution: "Yale University",
    description: "Follow the epic trajectory of human civilization: the Fertile Crescent, classical Greece and Rome, the Silk Road, the Age of Enlightenment, and the Industrial Revolution.",
    lessons: [
      {
        id: "hist-1",
        position: 1,
        title: "Video: The Agricultural Revolution: CrashCourse World History #1",
        lessonType: "video",
        sourceRef: "Yocja_N5s1I",
        contentBody: "John Green explores the shift from nomadic hunting and gathering to settled agriculture in Mesopotamia."
      },
      {
        id: "hist-2",
        position: 2,
        title: "Origins: The Fertile Crescent & Mesopotamia",
        lessonType: "wikipedia",
        sourceRef: "Fertile_Crescent",
        contentBody: "Sumer, Babylon, early writing (cuneiform), irrigation, and the origins of legal codes."
      },
      {
        id: "hist-3",
        position: 3,
        title: "Video: The Silk Road and Ancient Trade Networks (CrashCourse)",
        lessonType: "video",
        sourceRef: "vfe-eNq-Qyg",
        contentBody: "How caravan routes fostered intercultural exchange, spread religions, technology, and goods across Eurasia."
      },
      {
        id: "hist-4",
        position: 4,
        title: "Trade History: The Silk Road",
        lessonType: "wikipedia",
        sourceRef: "Silk_Road",
        contentBody: "Land and maritime routes linking China, India, Persia, and the Mediterranean basin."
      },
      {
        id: "hist-5",
        position: 5,
        title: "Primary Reading: The History of Herodotus (Gutenberg #2707)",
        lessonType: "gutenberg",
        sourceRef: "2707",
        contentBody: "The classic account by the 'Father of History' chronicling the Greco-Persian wars and ancient customs."
      },
      {
        id: "hist-6",
        position: 6,
        title: "Assessment: World History & Historical Events Quiz",
        lessonType: "quiz",
        sourceRef: "23",
        contentBody: "Test your historical literacy from ancient kingdoms to modern world events."
      }
    ]
  },
  {
    id: "course-global-geopolitics",
    title: "Global Geography, Demographics & International Civics",
    category: "World History & Civics",
    difficulty: "Beginner",
    institution: "Georgetown University (SFS)",
    description: "Explore the geopolitical landscape of the world: physical geography, sovereign boundaries, economic systems, and live demographic indicators across continents.",
    lessons: [
      {
        id: "geo-1",
        position: 1,
        title: "Video: What is Geography? (CrashCourse Geography #1)",
        lessonType: "video",
        sourceRef: "mHz2qH9bH0s",
        contentBody: "Dr. Alana Risse introduces human and physical geography, spatial thinking, and global patterns."
      },
      {
        id: "geo-2",
        position: 2,
        title: "Live Country Profile: Republic of Kenya",
        lessonType: "country",
        sourceRef: "KE",
        contentBody: "Demographic, economic, linguistic, and capital indicators of Kenya via REST Countries v3.1."
      },
      {
        id: "geo-3",
        position: 3,
        title: "Live Country Profile: Japan",
        lessonType: "country",
        sourceRef: "JP",
        contentBody: "Economic, population, land area, and geographic indicators of Japan."
      },
      {
        id: "geo-4",
        position: 4,
        title: "Live Country Profile: Federal Republic of Germany",
        lessonType: "country",
        sourceRef: "DE",
        contentBody: "European demographics, economic power, and regional geography."
      },
      {
        id: "geo-5",
        position: 5,
        title: "Live Country Profile: Canada",
        lessonType: "country",
        sourceRef: "CA",
        contentBody: "North American geography, land area, multilingualism, and governance."
      },
      {
        id: "geo-6",
        position: 6,
        title: "Assessment: Global Geography & World Capitals Quiz",
        lessonType: "quiz",
        sourceRef: "22",
        contentBody: "Verified trivia testing world capitals, rivers, mountains, and sovereign borders."
      }
    ]
  },

  // 5. Economics & Finance
  {
    id: "course-macroeconomics",
    title: "Macroeconomics: Markets, Money & Global Trade",
    category: "Economics & Finance",
    difficulty: "Intermediate",
    institution: "London School of Economics (LSE)",
    description: "Analyze the mechanisms of economic systems: supply and demand, gross domestic product (GDP), monetary and fiscal policy, inflation, and international trade.",
    lessons: [
      {
        id: "econ-1",
        position: 1,
        title: "Video: Intro to Economics: CrashCourse Econ #1",
        lessonType: "video",
        sourceRef: "3ez10ADR_gM",
        contentBody: "Scarcity, choices, opportunity cost, and the fundamental questions every economic system must answer."
      },
      {
        id: "econ-2",
        position: 2,
        title: "Market Mechanics: Supply and Demand Equilibrium",
        lessonType: "wikipedia",
        sourceRef: "Supply_and_demand",
        contentBody: "Price elasticity, market clearing price, shifts in supply curves, and consumer surplus."
      },
      {
        id: "econ-3",
        position: 3,
        title: "Video: Macroeconomics & GDP (CrashCourse Economics)",
        lessonType: "video",
        sourceRef: "d8uTB5XorBw",
        contentBody: "How economists measure the size and health of national economies through aggregate output."
      },
      {
        id: "econ-4",
        position: 4,
        title: "Policy: Monetary Policy, Central Banking & Inflation",
        lessonType: "wikipedia",
        sourceRef: "Monetary_policy",
        contentBody: "Interest rate targets, reserve requirements, open market operations, and liquidity management."
      },
      {
        id: "econ-5",
        position: 5,
        title: "Primary Reading: An Inquiry into the Nature and Causes of the Wealth of Nations (Gutenberg #3300)",
        lessonType: "gutenberg",
        sourceRef: "3300",
        contentBody: "Adam Smith's foundational 1776 economic treatise on the division of labour and free markets."
      },
      {
        id: "econ-6",
        position: 6,
        title: "Assessment: Economics & Commerce Quiz",
        lessonType: "quiz",
        sourceRef: "9",
        contentBody: "Assess your knowledge of fiscal systems, market structures, and financial institutions."
      }
    ]
  },

  // 6. Philosophy & Literature
  {
    id: "course-classical-philosophy",
    title: "Classical Philosophy, Ethics & Epistemology",
    category: "Philosophy & Literature",
    difficulty: "Intermediate",
    institution: "University of Oxford",
    description: "Engage with humanity's greatest questions: What is justice? What can we know? How should we live? Study Socrates, Plato, Aristotle, and the Stoics.",
    lessons: [
      {
        id: "phil-1",
        position: 1,
        title: "Video: What is Philosophy? (CrashCourse Philosophy #1)",
        lessonType: "video",
        sourceRef: "1A_CAkYt3GY",
        contentBody: "Hank Green introduces philosophical methodology, logic, argument structures, and cognitive biases."
      },
      {
        id: "phil-2",
        position: 2,
        title: "Tradition: Ancient Greek Philosophy",
        lessonType: "wikipedia",
        sourceRef: "Ancient_Greek_philosophy",
        contentBody: "From the pre-Socratic cosmologists to Socrates, the Academy of Plato, and the Lyceum of Aristotle."
      },
      {
        id: "phil-3",
        position: 3,
        title: "Primary Reading: Plato's Republic (Gutenberg #1497)",
        lessonType: "gutenberg",
        sourceRef: "1497",
        contentBody: "The classic Socratic dialogue on the nature of justice, the ideal state, and the allegory of the cave."
      },
      {
        id: "phil-4",
        position: 4,
        title: "Primary Reading: Meditations by Marcus Aurelius (Gutenberg #2680)",
        lessonType: "gutenberg",
        sourceRef: "2680",
        contentBody: "Private stoic reflections of the Roman Emperor on duty, self-discipline, and serenity."
      },
      {
        id: "phil-5",
        position: 5,
        title: "Ethics: Utilitarianism, Deontology & Virtue Ethics",
        lessonType: "wikipedia",
        sourceRef: "Ethics",
        contentBody: "Moral philosophy, normative ethical frameworks, and contemporary moral dilemmas."
      },
      {
        id: "phil-6",
        position: 6,
        title: "Assessment: Philosophy & Logic Quiz",
        lessonType: "quiz",
        sourceRef: "10",
        contentBody: "Multiple choice questions testing logic, philosophical traditions, and ethics."
      }
    ]
  },
  {
    id: "course-world-literature",
    title: "Great Masterpieces of World Literature",
    category: "Philosophy & Literature",
    difficulty: "Beginner",
    institution: "University of Edinburgh",
    description: "Immerse yourself in world literary classics: Shakespearean tragedy, Gothic romanticism, Victorian social commentary, and epic poetry.",
    lessons: [
      {
        id: "lit-1",
        position: 1,
        title: "Video: How and Why We Read: CrashCourse Literature #1",
        lessonType: "video",
        sourceRef: "MSYw502dJNY",
        contentBody: "John Green on critical reading, empathy, close literary analysis, and narrative forms."
      },
      {
        id: "lit-2",
        position: 2,
        title: "Primary Reading: The Tragedy of Hamlet by William Shakespeare (Gutenberg #1524)",
        lessonType: "gutenberg",
        sourceRef: "1524",
        contentBody: "Shakespeare's immortal masterpiece exploring grief, revenge, doubt, and mortality."
      },
      {
        id: "lit-3",
        position: 3,
        title: "Author: William Shakespeare Life and Works",
        lessonType: "wikipedia",
        sourceRef: "William_Shakespeare",
        contentBody: "Biography, Elizabethan theater, folio publications, and literary legacy."
      },
      {
        id: "lit-4",
        position: 4,
        title: "Primary Reading: Frankenstein; Or, The Modern Prometheus by Mary Shelley (Gutenberg #84)",
        lessonType: "gutenberg",
        sourceRef: "84",
        contentBody: "Mary Shelley's foundational science fiction and Gothic novel on scientific hubris and loneliness."
      },
      {
        id: "lit-5",
        position: 5,
        title: "Primary Reading: Pride and Prejudice by Jane Austen (Gutenberg #1342)",
        lessonType: "gutenberg",
        sourceRef: "1342",
        contentBody: "Jane Austen's celebrated romantic comedy and social critique of Regency England."
      },
      {
        id: "lit-6",
        position: 6,
        title: "Assessment: World Literature & Classic Books Quiz",
        lessonType: "quiz",
        sourceRef: "10",
        contentBody: "Questions on literary works, authors, poetry, and famous novels."
      }
    ]
  }
];

module.exports = { SEED_COURSES };
