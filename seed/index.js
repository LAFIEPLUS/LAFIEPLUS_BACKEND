import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../src/models/User.js";
import HealthArticle from "../src/models/HealthArticle.js";
import HealthFacility from "../src/models/HealthFacility.js";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("❌ MONGODB_URI not set in .env"); process.exit(1); }

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  await Promise.all([
    UserModel.deleteMany({}),
    HealthArticle.deleteMany({}),
    HealthFacility.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  const usersData = [
    {
      name: "Admin User",
      email: "admin@lafieplus.com",
      password: "Admin1234!",
      role: "admin",
      isActive: true,
    },
    {
      name: "Dr. Amara Osei",
      email: "partner1@lafieplus.com",
      phone: "+233201000001",
      password: "Partner1234!",
      role: "partner",
      isActive: true,
      partnerInfo: {
        specialty: "General Medicine",
        bio: "Experienced GP with 10 years in community health across Ghana.",
        isAvailable: true,
        consultationCount: 0,
      },
    },
    {
      name: "Nurse Fatima Diallo",
      email: "partner2@lafieplus.com",
      phone: "+233201000002",
      password: "Partner1234!",
      role: "partner",
      isActive: true,
      partnerInfo: {
        specialty: "Maternal & Child Health",
        bio: "Specialist in antenatal and postnatal care with 8 years experience.",
        isAvailable: true,
        consultationCount: 0,
      },
    },
    {
      name: "Ama Mensah",
      email: "user1@lafieplus.com",
      phone: "+233201000003",
      password: "User1234!",
      role: "user",
      isActive: true,
      healthProfile: { age: 27, gender: "female", maternalStatus: "pregnant" },
    },
    {
      name: "Kofi Asante",
      email: "user2@lafieplus.com",
      phone: "+233201000004",
      password: "User1234!",
      role: "user",
      isActive: true,
      healthProfile: { age: 34, gender: "male", maternalStatus: "none" },
    },
  ];

  const createdUsers = [];
  for (const data of usersData) {
    const u = await UserModel.create(data);
    createdUsers.push(u);
  }
  const adminDoc = createdUsers[0];
  console.log(`👤 Seeded ${createdUsers.length} users`);

  const articles = [
    {
      isDeleted: false,  // ← add this to each article
      title: "Understanding Malaria Prevention",
      slug: "understanding-malaria-prevention",
      summary: "Key steps to protect yourself and your family from malaria in West Africa.",
      body: `Malaria remains one of the most common illnesses in West Africa. Using insecticide-treated nets (ITNs) every night is the single most effective prevention method. Indoor residual spraying and antimalarial prophylaxis are recommended for high-risk groups.\n\nEliminating stagnant water near your home reduces mosquito breeding sites. If you develop fever, chills, or headache within 2 weeks of potential exposure, seek testing immediately.`,
      category: "preventive",
      tags: ["malaria", "prevention", "mosquito"],
      locale: "en",
      status: "published",
      authorId: adminDoc._id,
    },
    {
      isDeleted: false,  // ← add this to each article
      title: "Antenatal Care: What to Expect",
      slug: "antenatal-care-what-to-expect",
      summary: "A complete guide to antenatal visits and why they matter for mother and baby.",
      body: `Antenatal care visits are essential for monitoring both mother and baby's health. The WHO recommends at least 8 ANC contacts during pregnancy.\n\nKey checks include blood pressure, fetal growth, blood tests, and tetanus vaccination. Early registration before 12 weeks gives the best outcomes.`,
      category: "maternal",
      tags: ["pregnancy", "antenatal", "maternal health"],
      locale: "en",
      status: "published",
      authorId: adminDoc._id,
    },
    {
      isDeleted: false,  // ← add this to each article
      title: "Adolescent Sexual & Reproductive Health",
      slug: "adolescent-sexual-reproductive-health",
      summary: "Clear, factual information for young people about reproductive health.",
      body: `Good sexual and reproductive health starts with accurate information. Adolescents should understand puberty, safe relationships, and how to make informed decisions.\n\nHPV vaccination is recommended for girls aged 9-14. STIs often have no symptoms — regular testing is important if sexually active.`,
      category: "adolescent",
      tags: ["adolescent", "reproductive health", "SRH"],
      locale: "en",
      status: "published",
      authorId: adminDoc._id,
    },
  ];

  await HealthArticle.insertMany(articles);
  console.log(`📚 Seeded ${articles.length} articles`);

  const facilities = [
    {
      name: "Korle Bu Teaching Hospital",
      type: "hospital",
      address: "Guggisberg Ave, Korle Bu, Accra, Ghana",
      phone: "+233302674212",
      location: { type: "Point", coordinates: [-0.2279, 5.5363] },
      services: ["Emergency", "Maternity", "Surgery", "Paediatrics"],
      operatingHours: "24 hours",
      isActive: true,
      addedBy: adminDoc._id,
    },
    {
      name: "Achimota Hospital",
      type: "hospital",
      address: "Achimota Road, Accra, Ghana",
      phone: "+233302401257",
      location: { type: "Point", coordinates: [-0.2169, 5.6037] },
      services: ["General OPD", "Maternity", "Laboratory"],
      operatingHours: "24 hours",
      isActive: true,
      addedBy: adminDoc._id,
    },
    {
      name: "Ridge Hospital",
      type: "clinic",
      address: "Castle Road, Ridge, Accra, Ghana",
      phone: "+233302665401",
      location: { type: "Point", coordinates: [-0.1919, 5.5603] },
      services: ["General OPD", "Maternity", "Antenatal Clinic"],
      operatingHours: "Mon-Fri 8am-5pm, Sat 8am-2pm",
      isActive: true,
      addedBy: adminDoc._id,
    },
    {
      name: "Kaneshie Polyclinic",
      type: "clinic",
      address: "Kaneshie Market Road, Accra, Ghana",
      phone: "+233302221234",
      location: { type: "Point", coordinates: [-0.235, 5.565] },
      services: ["General OPD", "Child Welfare", "Pharmacy"],
      operatingHours: "Mon-Fri 7:30am-4:30pm",
      isActive: true,
      addedBy: adminDoc._id,
    },
    {
      name: "Mediq Pharmacy — Osu",
      type: "pharmacy",
      address: "Oxford Street, Osu, Accra, Ghana",
      phone: "+233302770099",
      location: { type: "Point", coordinates: [-0.1756, 5.5571] },
      services: ["Prescription dispensing", "OTC medications"],
      operatingHours: "Mon-Sat 8am-9pm",
      isActive: true,
      addedBy: adminDoc._id,
    },
  ];

  await HealthFacility.insertMany(facilities);
  console.log(`🏥 Seeded ${facilities.length} facilities`);

  console.log("\n🎉 Seed complete!\n");
  console.log("  Admin    → admin@lafieplus.com      / Admin1234!");
  console.log("  Partner  → partner1@lafieplus.com   / Partner1234!");
  console.log("  Partner  → partner2@lafieplus.com   / Partner1234!");
  console.log("  User     → user1@lafieplus.com      / User1234!");
  console.log("  User     → user2@lafieplus.com      / User1234!\n");

  await mongoose.disconnect();
}

seed().catch((e) => { console.error("Seed failed:", e); process.exit(1); });