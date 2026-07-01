import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create admin user
  const adminEmail = "admin@quimbielle.tn"
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  
  if (!existing) {
    const passwordHash = await bcrypt.hash("admin123", 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        passwordHash,
        isAdmin: true,
      }
    })
    console.log("✓ Admin user created: admin@quimbielle.tn / admin123")
  } else {
    console.log("✓ Admin user already exists")
  }

  // Create default user
  const userEmail = "user@quimbielle.tn"
  const existingUser = await prisma.user.findUnique({ where: { email: userEmail } })

  if (!existingUser) {
    const passwordHash = await bcrypt.hash("user123", 10)
    await prisma.user.create({
      data: {
        email: userEmail,
        name: "Utilisateur Test",
        passwordHash,
        isAdmin: false,
      }
    })
    console.log("✓ Test user created: user@quimbielle.tn / user123")
  } else {
    console.log("✓ Test user already exists")
  }

  // Create default Kambiale template
  const existingTemplate = await prisma.formTemplate.findFirst({
    where: { name: "Lettre de Change — Kambiale" }
  })

  if (!existingTemplate) {
    await prisma.formTemplate.create({
      data: {
        name: "Lettre de Change — Kambiale",
        imageUrl: "/kambiale.png",
        paperWidthCm: 17.5,
        paperHeightCm: 11.5,
        fieldDefinitions: [
          { key: "signatureTire",   label: "Signature du tiré",           left: 2.0,  top: 13.0, width: 23.0, height: 17.0 },
          { key: "echeance1",       label: "Échéance",                    left: 47.0, top: 13.0, width: 9.0,  height: 4.5  },
          { key: "lieuA",           label: "A (lieu)",                    left: 75.5, top: 13.0, width: 12.0, height: 4.5  },
          { key: "ribTire",         label: "RIB ou RIP du Tiré",          left: 27.0, top: 22.5, width: 47.0, height: 4.5  },
          { key: "montant1",        label: "Montant (chiffres)",          left: 75.0, top: 23.5, width: 23.0, height: 5.5  },
          { key: "tireur",          label: "Tireur",                      left: 2.0,  top: 32.0, width: 23.0, height: 12.5 },
          { key: "ordrePayer",      label: "Payer à l'ordre de",          left: 27.0, top: 32.5, width: 47.0, height: 5.5  },
          { key: "protestable",     label: "Protestable (Oui/Non)",       left: 49.5, top: 35.5, width: 10.0, height: 4.0  },
          { key: "montant2",        label: "Montant (chiffres) — droite", left: 75.0, top: 32.0, width: 23.0, height: 5.5  },
          { key: "montantLettre",   label: "Montant en lettres (FR)",     left: 2.0,  top: 44.0, width: 96.0, height: 4.5  },
          { key: "montantLettreAr", label: "Montant en lettres (AR)",     left: 2.0,  top: 48.0, width: 96.0, height: 4.0  },
          { key: "lieuCreation",    label: "Lieu de création",            left: 2.0,  top: 51.0, width: 15.0, height: 5.0  },
          { key: "dateCreation",    label: "Date de création",            left: 18.0, top: 51.0, width: 17.0, height: 5.0  },
          { key: "echeance2",       label: "Échéance (bas)",              left: 36.0, top: 51.0, width: 17.0, height: 5.0  },
          { key: "nomCedant",       label: "Nom du cédant",               left: 55.0, top: 51.0, width: 22.0, height: 5.0  },
          { key: "codesReserves",   label: "Codes réservés",              left: 79.0, top: 51.0, width: 19.0, height: 5.0  },
          { key: "ribTireur",       label: "RIB ou RIP du Tireur",        left: 2.0,  top: 60.5, width: 42.0, height: 7.0  },
          { key: "valeurEn",        label: "Valeur en",                   left: 45.0, top: 60.5, width: 16.0, height: 4.0  },
          { key: "qte",             label: "Quantité",                    left: 62.0, top: 60.5, width: 19.0, height: 4.0  },
          { key: "domiciliation",   label: "Domiciliation",               left: 82.0, top: 60.5, width: 16.0, height: 9.0  },
          { key: "nomAdresseTire",  label: "Nom et adresse du Tiré",      left: 45.0, top: 65.0, width: 37.0, height: 12.0 },
          { key: "acceptation",     label: "Acceptation",                 left: 2.0,  top: 71.5, width: 21.0, height: 11.0 },
          { key: "aval",            label: "Aval",                        left: 23.0, top: 71.5, width: 20.0, height: 11.0 },
          { key: "signatureTireur", label: "Signature du tireur",         left: 82.0, top: 78.0, width: 16.0, height: 7.0  },
        ]
      }
    })
    console.log("✓ Default Kambiale template created")
  } else {
    console.log("✓ Template already exists")
  }

  console.log("Seeding complete!")
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())