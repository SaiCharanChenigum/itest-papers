const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  console.log('🗑️  Cleaning existing data...')
  await prisma.content.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleaned existing data')

  // ============================================
  // CREATE SUBJECTS
  // ============================================
  console.log('📚 Creating subjects...')

  const biology9 = await prisma.subject.create({
    data: {
      name: 'Biology',
      class: 9,
      description: 'ICSE Class 9 Biology - Complete course covering cell biology, plant and animal tissues, and more',
      imageUrl: '/subjects/biology-9.jpg',
      isActive: true,
    },
  })

  const chemistry9 = await prisma.subject.create({
    data: {
      name: 'Chemistry',
      class: 9,
      description: 'ICSE Class 9 Chemistry - Comprehensive study of matter, atoms, molecules, and chemical reactions',
      imageUrl: '/subjects/chemistry-9.jpg',
      isActive: true,
    },
  })

  const biology10 = await prisma.subject.create({
    data: {
      name: 'Biology',
      class: 10,
      description: 'ICSE Class 10 Biology - In-depth study of human biology, reproduction, genetics, and evolution',
      imageUrl: '/subjects/biology-10.jpg',
      isActive: true,
    },
  })

  const chemistry10 = await prisma.subject.create({
    data: {
      name: 'Chemistry',
      class: 10,
      description: 'ICSE Class 10 Chemistry - Advanced concepts in acids, bases, salts, metals, and organic chemistry',
      imageUrl: '/subjects/chemistry-10.jpg',
      isActive: true,
    },
  })

  console.log('✅ Created 4 subjects (Biology & Chemistry for Class 9 & 10)')

  // ============================================
  // CLASS 9 BIOLOGY CHAPTERS
  // ============================================
  console.log('📖 Creating Class 9 Biology chapters...')

  const bio9chapters = await Promise.all([
    prisma.chapter.create({
      data: {
        title: 'The Cell - The Basic Unit of Life',
        description: 'Introduction to cell structure, organelles, and their functions',
        order: 1,
        subjectId: biology9.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Plant and Animal Tissues',
        description: 'Study of different types of plant and animal tissues',
        order: 2,
        subjectId: biology9.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Digestive System',
        description: 'Human digestive system and nutrition',
        order: 3,
        subjectId: biology9.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Respiratory System',
        description: 'Breathing and respiration in humans and plants',
        order: 4,
        subjectId: biology9.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Circulatory System',
        description: 'Blood circulation, heart, and blood vessels',
        order: 5,
        subjectId: biology9.id,
      },
    }),
  ])

  // ============================================
  // CLASS 9 CHEMISTRY CHAPTERS
  // ============================================
  console.log('📖 Creating Class 9 Chemistry chapters...')

  const chem9chapters = await Promise.all([
    prisma.chapter.create({
      data: {
        title: 'Matter and Its Composition',
        description: 'Properties of matter, elements, compounds, and mixtures',
        order: 1,
        subjectId: chemistry9.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Atomic Structure',
        description: 'Structure of atom, electrons, protons, and neutrons',
        order: 2,
        subjectId: chemistry9.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Chemical Changes and Reactions',
        description: 'Types of chemical reactions and equations',
        order: 3,
        subjectId: chemistry9.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Acids, Bases and Salts',
        description: 'Properties and uses of acids, bases, and salts',
        order: 4,
        subjectId: chemistry9.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Mole Concept and Stoichiometry',
        description: 'Understanding moles, molecular mass, and chemical calculations',
        order: 5,
        subjectId: chemistry9.id,
      },
    }),
  ])

  // ============================================
  // CLASS 10 BIOLOGY CHAPTERS
  // ============================================
  console.log('📖 Creating Class 10 Biology chapters...')

  const bio10chapters = await Promise.all([
    prisma.chapter.create({
      data: {
        title: 'Human Reproductive System',
        description: 'Male and female reproductive systems and their functions',
        order: 1,
        subjectId: biology10.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Genetics - The Study of Heredity',
        description: 'Mendels laws, inheritance patterns, and genetic disorders',
        order: 2,
        subjectId: biology10.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Evolution',
        description: 'Theories of evolution, natural selection, and adaptation',
        order: 3,
        subjectId: biology10.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'The Nervous System',
        description: 'Structure and function of the nervous system',
        order: 4,
        subjectId: biology10.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'The Endocrine System',
        description: 'Hormones and glands in the human body',
        order: 5,
        subjectId: biology10.id,
      },
    }),
  ])

  // ============================================
  // CLASS 10 CHEMISTRY CHAPTERS
  // ============================================
  console.log('📖 Creating Class 10 Chemistry chapters...')

  const chem10chapters = await Promise.all([
    prisma.chapter.create({
      data: {
        title: 'Periodic Properties and Variations',
        description: 'Modern periodic table and periodic trends',
        order: 1,
        subjectId: chemistry10.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Chemical Bonding',
        description: 'Ionic, covalent, and metallic bonding',
        order: 2,
        subjectId: chemistry10.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Study of Acids, Bases and Salts',
        description: 'pH scale, indicators, and salt preparation',
        order: 3,
        subjectId: chemistry10.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Metals and Non-Metals',
        description: 'Properties, reactivity series, and extraction of metals',
        order: 4,
        subjectId: chemistry10.id,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Organic Chemistry',
        description: 'Hydrocarbons, functional groups, and nomenclature',
        order: 5,
        subjectId: chemistry10.id,
      },
    }),
  ])

  console.log('✅ Created 20 chapters total')

  // ============================================
  // CREATE CONTENT (NOTES, TEST PAPERS, SOLUTIONS)
  // ============================================
  console.log('📄 Creating content items...')

  // Class 9 Biology Content
  for (const chapter of bio9chapters) {
    await prisma.content.createMany({
      data: [
        {
          title: `${chapter.title} - Complete Notes`,
          description: 'Comprehensive notes covering all topics',
          type: 'NOTES',
          fileUrl: `/content/ICSE/Class9/Biology/${chapter.title.replace(/\s+/g, '_')}/notes.pdf`,
          isFree: chapter.order === 1, // First chapter free
          order: 1,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Test Paper`,
          description: 'Practice test paper with MCQs and descriptive questions',
          type: 'TEST_PAPER',
          fileUrl: `/content/ICSE/Class9/Biology/${chapter.title.replace(/\s+/g, '_')}/test_paper.pdf`,
          isFree: false,
          order: 2,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Solutions`,
          description: 'Detailed solutions to test paper questions',
          type: 'SOLUTION',
          fileUrl: `/content/ICSE/Class9/Biology/${chapter.title.replace(/\s+/g, '_')}/solutions.pdf`,
          isFree: false,
          order: 3,
          chapterId: chapter.id,
        },
      ],
    })
  }

  // Class 9 Chemistry Content
  for (const chapter of chem9chapters) {
    await prisma.content.createMany({
      data: [
        {
          title: `${chapter.title} - Complete Notes`,
          description: 'Comprehensive notes covering all topics',
          type: 'NOTES',
          fileUrl: `/content/ICSE/Class9/Chemistry/${chapter.title.replace(/\s+/g, '_')}/notes.pdf`,
          isFree: chapter.order === 1, // First chapter free
          order: 1,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Test Paper`,
          description: 'Practice test paper with MCQs and descriptive questions',
          type: 'TEST_PAPER',
          fileUrl: `/content/ICSE/Class9/Chemistry/${chapter.title.replace(/\s+/g, '_')}/test_paper.pdf`,
          isFree: false,
          order: 2,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Solutions`,
          description: 'Detailed solutions to test paper questions',
          type: 'SOLUTION',
          fileUrl: `/content/ICSE/Class9/Chemistry/${chapter.title.replace(/\s+/g, '_')}/solutions.pdf`,
          isFree: false,
          order: 3,
          chapterId: chapter.id,
        },
      ],
    })
  }

  // Class 10 Biology Content
  for (const chapter of bio10chapters) {
    await prisma.content.createMany({
      data: [
        {
          title: `${chapter.title} - Complete Notes`,
          description: 'Comprehensive notes covering all topics',
          type: 'NOTES',
          fileUrl: `/content/ICSE/Class10/Biology/${chapter.title.replace(/\s+/g, '_')}/notes.pdf`,
          isFree: chapter.order === 1, // First chapter free
          order: 1,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Test Paper`,
          description: 'Practice test paper with MCQs and descriptive questions',
          type: 'TEST_PAPER',
          fileUrl: `/content/ICSE/Class10/Biology/${chapter.title.replace(/\s+/g, '_')}/test_paper.pdf`,
          isFree: false,
          order: 2,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Solutions`,
          description: 'Detailed solutions to test paper questions',
          type: 'SOLUTION',
          fileUrl: `/content/ICSE/Class10/Biology/${chapter.title.replace(/\s+/g, '_')}/solutions.pdf`,
          isFree: false,
          order: 3,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Sample Paper`,
          description: 'Board exam pattern sample paper',
          type: 'SAMPLE_PAPER',
          fileUrl: `/content/ICSE/Class10/Biology/${chapter.title.replace(/\s+/g, '_')}/sample_paper.pdf`,
          isFree: false,
          order: 4,
          chapterId: chapter.id,
        },
      ],
    })
  }

  // Class 10 Chemistry Content
  for (const chapter of chem10chapters) {
    await prisma.content.createMany({
      data: [
        {
          title: `${chapter.title} - Complete Notes`,
          description: 'Comprehensive notes covering all topics',
          type: 'NOTES',
          fileUrl: `/content/ICSE/Class10/Chemistry/${chapter.title.replace(/\s+/g, '_')}/notes.pdf`,
          isFree: chapter.order === 1, // First chapter free
          order: 1,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Test Paper`,
          description: 'Practice test paper with MCQs and descriptive questions',
          type: 'TEST_PAPER',
          fileUrl: `/content/ICSE/Class10/Chemistry/${chapter.title.replace(/\s+/g, '_')}/test_paper.pdf`,
          isFree: false,
          order: 2,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Solutions`,
          description: 'Detailed solutions to test paper questions',
          type: 'SOLUTION',
          fileUrl: `/content/ICSE/Class10/Chemistry/${chapter.title.replace(/\s+/g, '_')}/solutions.pdf`,
          isFree: false,
          order: 3,
          chapterId: chapter.id,
        },
        {
          title: `${chapter.title} - Sample Paper`,
          description: 'Board exam pattern sample paper',
          type: 'SAMPLE_PAPER',
          fileUrl: `/content/ICSE/Class10/Chemistry/${chapter.title.replace(/\s+/g, '_')}/sample_paper.pdf`,
          isFree: false,
          order: 4,
          chapterId: chapter.id,
        },
      ],
    })
  }

  const contentCount = await prisma.content.count()
  console.log(`✅ Created ${contentCount} content items`)

  console.log('🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log('  - 4 Subjects (Biology & Chemistry for Class 9 & 10)')
  console.log('  - 20 Chapters (5 per subject)')
  console.log(`  - ${contentCount} Content Items (Notes, Test Papers, Solutions, Sample Papers)`)
  console.log('  - First chapter of each subject is FREE for preview')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
