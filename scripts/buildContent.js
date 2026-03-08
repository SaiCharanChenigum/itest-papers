const fs = require("fs")
const path = require("path")
const PDFDocument = require("pdfkit")

const BASE = path.join(__dirname, "..", "public", "content")

const syllabus = {
  ICSE: {
    Class9: {
      Chemistry: [
        "The Language of Chemistry",
        "Chemical Changes and Reactions",
        "Water",
        "Atomic Structure and Chemical Bonding",
        "The Periodic Table",
        "Hydrogen",
        "Gas Laws",
        "Atmospheric Pollution",
        "Practical Chemistry"
      ],
      Biology: [
        "Introducing Biology",
        "Cell: The Unit of Life",
        "Tissues",
        "The Flower",
        "Pollination and Fertilization",
        "Seeds – Structure and Germination",
        "Respiration in Plants",
        "Five Kingdom Classification",
        "Economic Importance of Bacteria and Fungi",
        "Nutrition",
        "Digestive System",
        "Skeleton – Movement and Locomotion",
        "Skin",
        "Respiratory System",
        "Hygiene",
        "Diseases",
        "Aids to Health",
        "Health Organisations",
        "Waste Management"
      ]
    },
    Class10: {
      Chemistry: [
        "Periodic Table",
        "Chemical Bonding",
        "Acids Bases and Salts",
        "Analytical Chemistry",
        "Mole Concept",
        "Electrolysis",
        "Metallurgy",
        "Hydrogen Chloride",
        "Ammonia",
        "Nitric Acid",
        "Sulphuric Acid",
        "Organic Chemistry"
      ],
      Biology: [
        "Cell Structure",
        "Chromosomes",
        "Genetics",
        "Absorption by Roots",
        "Transpiration",
        "Photosynthesis",
        "Chemical Coordination",
        "Circulatory System",
        "Excretory System",
        "Nervous System",
        "Sense Organs",
        "Endocrine System",
        "Reproductive System",
        "Human Evolution",
        "Population",
        "Pollution"
      ]
    }
  }
}

function ensure(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function makePDF(filePath) {
  const doc = new PDFDocument()
  doc.pipe(fs.createWriteStream(filePath))
  doc.end()
}

function run() {
  for (const board in syllabus) {
    for (const cls in syllabus[board]) {
      for (const subject in syllabus[board][cls]) {
        for (const type of ["Notes", "TestPapers"]) {
          const folder = path.join(BASE, board, cls, subject, type)
          ensure(folder)

          syllabus[board][cls][subject].forEach((topic, i) => {
            const fileName =
              String(i + 1).padStart(2, "0") +
              "-" +
              topic.replace(/[^a-z0-9]/gi, "_") +
              ".pdf"

            const filePath = path.join(folder, fileName)

            if (!fs.existsSync(filePath)) {
              makePDF(filePath)
            }
          })
        }
      }
    }
  }

  console.log("✅ All ICSE PDFs and folders created")
}

run()
