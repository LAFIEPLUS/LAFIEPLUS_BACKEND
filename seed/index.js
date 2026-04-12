import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";
import HealthArticle from "../src/models/HealthArticle.js";
import HealthFacility from "../src/models/HealthFacility.js";

const MONGO_URI = process.env.MONGODB_URI;

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding...\n");

  await Promise.all([
    User.deleteMany({}),
    HealthArticle.deleteMany({}),
    HealthFacility.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  const password = await bcrypt.hash("Password123!", 12);

  // ─── Users ────────────────────────────────────────────────────────
  const admin = await User.create({
    name: "Admin User",
    email: "admin@lafieplus.com",
    password: "Password123!",
    role: "admin",
    isVerified: true,
    isActive: true,
  });

  const partner1 = await User.create({
    name: "Dr. Amara Nwosu",
    email: "dr.amara@lafieplus.com",
    phone: "+2348001234567",
    password: "Password123!",
    role: "partner",
    isVerified: true,
    isActive: true,
    partnerInfo: {
      organizationName: "Lagos Maternal Health Centre",
      contactPerson: "Dr. Amara Nwosu",
      specialty: "maternal",
      bio: "OB/GYN specialist with 10 years of experience in maternal and reproductive health.",
      isAvailable: true,
      consultationCount: 0,
    },
  });

  const partner2 = await User.create({
    name: "Dr. Kwame Asante",
    email: "dr.kwame@lafieplus.com",
    phone: "+2348009876543",
    password: "Password123!",
    role: "partner",
    isVerified: true,
    isActive: true,
    partnerInfo: {
      organizationName: "Accra General Practice",
      contactPerson: "Dr. Kwame Asante",
      specialty: "general",
      bio: "General practitioner specialising in primary care and preventive health.",
      isAvailable: true,
      consultationCount: 0,
    },
  });

  const partner3 = await User.create({
    name: "Dr. Ngozi Okafor",
    email: "dr.ngozi@lafieplus.com",
    phone: "+2348005556666",
    password: "Password123!",
    role: "partner",
    isVerified: true,
    isActive: true,
    partnerInfo: {
      organizationName: "Youth Wellness Initiative",
      contactPerson: "Dr. Ngozi Okafor",
      specialty: "adolescent",
      bio: "Adolescent health specialist with a focus on mental wellbeing and youth development.",
      isAvailable: true,
      consultationCount: 0,
    },
  });

  const user1 = await User.create({
    name: "Fatima Bello",
    email: "fatima@example.com",
    phone: "+2348011111111",
    password: "Password123!",
    role: "user",
    isVerified: true,
    isActive: true,
    healthProfile: {
      age: 28,
      gender: "female",
      maternalStatus: "pregnant",
      healthPreferences: ["maternal"],
      locale: "en",
    },
    privacySettings: { shareAnonymousData: true, receiveAlerts: true },
  });

  const user2 = await User.create({
    name: "Emeka Obi",
    email: "emeka@example.com",
    phone: "+2348022222222",
    password: "Password123!",
    role: "user",
    isVerified: true,
    isActive: true,
    healthProfile: {
      age: 34,
      gender: "male",
      healthPreferences: ["preventive", "general"],
      locale: "en",
    },
  });

  console.log(`Seeded 6 users (1 admin, 3 partners, 2 users)`);

  // ─── Health Articles ──────────────────────────────────────────────
  const articles = [
    {
      title: "Antenatal care: what to expect during your pregnancy",
      slug: "antenatal-care-what-to-expect",
      body: `Antenatal care (ANC) is the care you receive from health professionals during pregnancy. Regular visits help ensure the health of both mother and baby.\n\n## Why antenatal care matters\n\nRegular antenatal visits allow health workers to monitor your blood pressure, check your baby's growth, screen for infections, and provide vital supplements like iron and folic acid.\n\n## How many visits should you have?\n\nThe WHO recommends at least 8 antenatal contacts during pregnancy. Your first visit should happen as early as possible — ideally before 12 weeks.\n\n## What happens at each visit?\n\n- Blood pressure measurement\n- Weight and fundal height check\n- Urine and blood tests\n- Fetal heartbeat check\n- Tetanus immunisation\n- Nutritional counselling\n- Birth planning discussion\n\n## Warning signs to watch for\n\nContact your health provider immediately if you experience severe headache, blurred vision, heavy bleeding, reduced fetal movement, or severe abdominal pain.`,
      summary: "Everything you need to know about antenatal care visits during your pregnancy.",
      category: "maternal",
      locale: "en",
      tags: ["pregnancy", "antenatal", "maternal health", "ANC"],
      status: "published",
      authorId: admin._id,
    },
    {
      title: "Understanding postnatal care for mother and baby",
      slug: "postnatal-care-mother-and-baby",
      body: `The postnatal period — the first six weeks after childbirth — is a critical time for both mother and newborn. Proper care during this time reduces complications and supports recovery.\n\n## Care for the mother\n\n- Attend all postnatal check-ups (at 24 hours, 1 week, and 6 weeks)\n- Watch for signs of postpartum depression: persistent sadness, loss of interest, difficulty bonding with baby\n- Maintain good nutrition and hydration, especially if breastfeeding\n- Rest whenever possible\n\n## Care for the newborn\n\n- Exclusive breastfeeding for the first 6 months\n- Keep the umbilical cord stump clean and dry\n- Ensure vaccinations are up to date (BCG, Hepatitis B, OPV)\n- Watch for danger signs: fever, difficulty breathing, poor feeding, jaundice\n\n## When to seek help\n\nSeek immediate care if the baby has a temperature above 38°C, stops feeding, or you notice any unusual symptoms in yourself or the baby.`,
      summary: "Essential postnatal care guidance for new mothers and their newborns.",
      category: "maternal",
      locale: "en",
      tags: ["postnatal", "newborn", "breastfeeding", "maternal health"],
      status: "published",
      authorId: admin._id,
    },
    {
      title: "Malaria prevention in children under five",
      slug: "malaria-prevention-children-under-five",
      body: `Malaria remains one of the leading causes of illness and death in children under five in sub-Saharan Africa. However, it is largely preventable.\n\n## Prevention measures\n\n**Insecticide-Treated Nets (ITNs):** Sleep under a long-lasting insecticide-treated net every night. Hang it properly and replace it every 3 years.\n\n**Indoor Residual Spraying (IRS):** Allow health workers to spray the inside walls of your home with insecticide.\n\n**Seasonal Malaria Chemoprevention (SMC):** Monthly preventive treatment is available for children aged 3–59 months in high-burden areas.\n\n**Eliminate breeding sites:** Remove standing water around your home — old tyres, pots, and containers.\n\n## Recognising malaria in children\n\nSymptoms include: fever (often above 38.5°C), chills, sweating, vomiting, and headache. Children may also show unusual sleepiness or difficulty breathing.\n\n## Treatment\n\nIf you suspect malaria, test and treat immediately. Do not wait. Complete the full course of treatment as prescribed — stopping early leads to drug resistance.`,
      summary: "How to protect your young child from malaria using proven prevention strategies.",
      category: "preventive",
      locale: "en",
      tags: ["malaria", "children", "prevention", "ITN"],
      status: "published",
      authorId: admin._id,
    },
    {
      title: "Mental health in adolescents: recognising the signs",
      slug: "mental-health-adolescents-recognising-signs",
      body: `Adolescence is a period of significant physical, emotional, and social change. Mental health challenges are common but often go unrecognised and untreated.\n\n## Common mental health conditions in adolescents\n\n- **Depression:** Persistent low mood, loss of interest, changes in sleep and appetite\n- **Anxiety disorders:** Excessive worry, panic attacks, avoidance behaviours\n- **Substance use disorders:** Experimentation that escalates to dependency\n- **Eating disorders:** Unhealthy relationships with food and body image\n\n## Warning signs to watch for\n\n- Withdrawal from friends, family, and activities they once enjoyed\n- Significant changes in sleep or appetite\n- Declining academic performance\n- Persistent irritability or mood swings\n- Talk of hopelessness, worthlessness, or self-harm\n- Giving away prized possessions\n\n## How to respond\n\nListen without judgment. Avoid dismissing their feelings with phrases like "you'll get over it." Encourage them to speak to a trusted adult or health professional. For crisis situations, seek professional help immediately.\n\n## Getting support\n\nMental health is just as important as physical health. Reach out to a health partner through Lafieplus for guidance on where to seek help in your area.`,
      summary: "How to identify mental health challenges in teenagers and how to respond effectively.",
      category: "adolescent",
      locale: "en",
      tags: ["mental health", "adolescent", "depression", "anxiety", "teenagers"],
      status: "published",
      authorId: admin._id,
    },
    {
      title: "Hand washing: your first line of defence against infection",
      slug: "hand-washing-first-line-of-defence",
      body: `Proper hand washing is one of the most effective ways to prevent the spread of infectious diseases including diarrhoea, cholera, typhoid, and respiratory infections.\n\n## When to wash your hands\n\n- Before preparing or eating food\n- After using the toilet\n- After caring for a sick person\n- After handling animals\n- After coughing, sneezing, or blowing your nose\n- Before and after treating a wound\n\n## The correct technique (20 seconds)\n\n1. Wet hands with clean running water\n2. Apply soap\n3. Lather and scrub all surfaces — back of hands, between fingers, under nails\n4. Rinse thoroughly under running water\n5. Dry with a clean cloth or air dry\n\n## When soap and water are not available\n\nUse an alcohol-based hand sanitiser with at least 60% alcohol. Rub it over all surfaces of your hands until dry.\n\n## Teaching children\n\nMake hand washing a routine habit. Sing a short song (about 20 seconds) to help children wash for the right amount of time.`,
      summary: "The correct hand washing technique and why it matters for preventing disease.",
      category: "preventive",
      locale: "en",
      tags: ["hygiene", "hand washing", "infection prevention", "diarrhoea"],
      status: "published",
      authorId: admin._id,
    },
    {
      title: "Family planning options: choosing what is right for you",
      slug: "family-planning-options",
      body: `Family planning allows individuals and couples to decide the number and spacing of their children. Access to contraception improves health outcomes for women and children.\n\n## Short-acting methods\n\n- **Combined oral contraceptive pill:** Taken daily; highly effective when used correctly\n- **Progestogen-only pill (mini-pill):** Suitable for breastfeeding mothers\n- **Condoms (male and female):** The only method that also protects against STIs\n- **Emergency contraception:** Must be taken within 72 hours of unprotected sex\n\n## Long-acting reversible contraception (LARC)\n\n- **Intrauterine device (IUD/coil):** Effective for 5–10 years; can be removed at any time\n- **Hormonal implant:** Small rod inserted under the skin of the upper arm; effective for 3 years\n- **Injectable contraceptive:** Given every 1–3 months\n\n## Permanent methods\n\n- **Tubal ligation (female sterilisation)**\n- **Vasectomy (male sterilisation)**\n\n## Getting advice\n\nSpeak to a health partner or visit your nearest clinic to discuss which method is most suitable for your health needs, lifestyle, and future plans.`,
      summary: "An overview of contraception options to help you make an informed family planning decision.",
      category: "maternal",
      locale: "en",
      tags: ["family planning", "contraception", "reproductive health", "maternal health"],
      status: "published",
      authorId: admin._id,
    },
  ];

  const createdArticles = await HealthArticle.insertMany(articles);
  console.log(`Seeded ${createdArticles.length} health articles`);

  // ─── Health Facilities (Lagos, Nigeria) ───────────────────────────
  const facilities = [
    {
      name: "Lagos Island General Hospital",
      type: "hospital",
      location: { type: "Point", coordinates: [3.3958, 6.4551] },
      address: "1 Broad Street, Lagos Island, Lagos",
      phone: "+2341234567",
      email: "info@ligh.gov.ng",
      services: ["emergency", "maternity", "surgery", "paediatrics", "laboratory", "radiology"],
      operatingHours: "24/7",
      isActive: true,
      addedBy: admin._id,
    },
    {
      name: "Surulere Health Centre",
      type: "clinic",
      location: { type: "Point", coordinates: [3.3604, 6.4968] },
      address: "15 Bode Thomas Street, Surulere, Lagos",
      phone: "+2347890123",
      services: ["antenatal", "immunisation", "family planning", "general outpatient", "HIV testing"],
      operatingHours: {
        mon: "8am-5pm", tue: "8am-5pm", wed: "8am-5pm",
        thu: "8am-5pm", fri: "8am-4pm", sat: "9am-1pm",
      },
      isActive: true,
      addedBy: admin._id,
    },
    {
      name: "Medplus Pharmacy Ikeja",
      type: "pharmacy",
      location: { type: "Point", coordinates: [3.3515, 6.5955] },
      address: "12 Oba Akran Avenue, Ikeja, Lagos",
      phone: "+2348012345678",
      services: ["pharmacy", "blood pressure check", "diabetes screening", "malaria testing"],
      operatingHours: {
        mon: "8am-9pm", tue: "8am-9pm", wed: "8am-9pm",
        thu: "8am-9pm", fri: "8am-9pm", sat: "9am-8pm", sun: "10am-6pm",
      },
      isActive: true,
      addedBy: admin._id,
    },
    {
      name: "Eko Hospital",
      type: "hospital",
      location: { type: "Point", coordinates: [3.3792, 6.4490] },
      address: "31 Mobolaji Bank Anthony Way, Victoria Island, Lagos",
      phone: "+2341236789",
      email: "info@ekohospitals.com",
      website: "https://ekohospitals.com",
      services: ["emergency", "cardiology", "oncology", "maternity", "ICU", "radiology", "laboratory"],
      operatingHours: "24/7",
      isActive: true,
      addedBy: admin._id,
    },
    {
      name: "Ajeromi Community Health Worker",
      type: "chw",
      location: { type: "Point", coordinates: [3.3212, 6.4684] },
      address: "Ajeromi-Ifelodun LGA, Lagos",
      phone: "+2348099887766",
      services: ["community health", "immunisation", "health education", "referrals", "malaria treatment"],
      operatingHours: "Mon-Fri 8am-4pm",
      isActive: true,
      addedBy: admin._id,
    },
    {
      name: "Medilag Diagnostic Centre",
      type: "lab",
      location: { type: "Point", coordinates: [3.3891, 6.5244] },
      address: "University of Lagos, Yaba, Lagos",
      phone: "+2348055544433",
      services: ["blood tests", "urinalysis", "malaria testing", "HIV testing", "pregnancy test", "imaging"],
      operatingHours: {
        mon: "7am-6pm", tue: "7am-6pm", wed: "7am-6pm",
        thu: "7am-6pm", fri: "7am-5pm", sat: "8am-2pm",
      },
      isActive: true,
      addedBy: admin._id,
    },
  ];

  const createdFacilities = await HealthFacility.insertMany(facilities);
  console.log(`Seeded ${createdFacilities.length} health facilities`);

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║         SEED COMPLETE ✅                 ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log("║  Password for all accounts: Password123! ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log("║  Admin:    admin@lafieplus.com           ║");
  console.log("║  Partner1: dr.amara@lafieplus.com        ║");
  console.log("║  Partner2: dr.kwame@lafieplus.com        ║");
  console.log("║  Partner3: dr.ngozi@lafieplus.com        ║");
  console.log("║  User1:    fatima@example.com            ║");
  console.log("║  User2:    emeka@example.com             ║");
  console.log("╚══════════════════════════════════════════╝\n");

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
