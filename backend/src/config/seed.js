
import "dotenv/config";
import mongoose from "mongoose";
import Judge from "../models/Judge.js";
import Startup from "../models/Startup.js";
import Evaluation from "../models/Evaluation.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

await Judge.deleteMany({});
await Startup.deleteMany({});
await Evaluation.deleteMany({});

const judgeData = [
  { name: "Mr. Padvnavayam", email: "judge1@khumb.in", passwordHash: "judge@123", designation: "Judge-Ideathon" },
  { name: "Mr. Gautam", email: "judge2@khumb.in", passwordHash: "judge@123", designation: "Judge-Ideathon" },
  { name: "Mr. Jaykumar", email: "judge3@khumb.in", passwordHash: "judge@123", designation: "Judge-Ideathon" },
  { name: "Riten co founder", email: "judge4@khumb.in", passwordHash: "judge@123", designation: "Judge-Ideathon" },
  { name: "Dr. Anirban Dutta", email: "judge5@khumb.in", passwordHash: "judge@123", designation: "Judge-Ideathon" },
  { name: "Kathamirta manik", email: "judge6@khumb.in", passwordHash: "judge@123", designation: "Judge-Ideathon" },
];

const judges = [];
for (const data of judgeData) {
  judges.push(await Judge.create(data));
}
console.log(` Seeded ${judges.length} judges (password: judge@123 for all)`);

// ── 30 Startups ───────────────────────────────────────────────────────────────
const categories = ["CleanTech", "FinTech", "HealthTech", "EdTech", "AgriTech", "DeepTech", "SocialImpact"];
const startupNames = [
  { teamName: "Vastra", founders: "Shubhanshu Gupta" },
  { teamName: "Nutrisoak", founders: "Abhimanyu Polagani" },
  { teamName: "SOL9X", founders: "Abhinav Aggrawal" },
  { teamName: "KSHATRALABS", founders: "Rishav Dev Mishra" },
  { teamName: "AgriSaarthi", founders: "Abhay Singh" },
  { teamName: "Hydroloop system", founders: "Ankit singh" },
  { teamName: "ATSFY TECHNOLOGIES", founders: "AYAN PAL, RUMA SAHA PAL, ARIANI KAIPENG" },
  { teamName: "Robustrix IT solutions private limited", founders: "Rakesh singh" },
  { teamName: "Tripura Explorer- A Smart Tourist Guide", founders: "Bibhas Paul" },
  { teamName: "BSWT", founders: "Kanagaraj devaraj" },
  { teamName: "MittiAmrit", founders: "Bikram Chakraborty, Arpita Choudhury, Biplot Chakraborty" },
  { teamName: "RedBloom Indoor Farms", founders: "Bikram Chakraborty, Biplot Chakraborty, Arpita Choudhury" },
  { teamName: "Trichar", founders: "Debasis Das" },
  { teamName: "Tripura Bamboo Composite", founders: "Aluk Debbarma, Dr. Kalyan Gayen, Dr. Tridib Kr. Bhowmick" },
  { teamName: "Vigil Vave", founders: "Deepak Behera" },
  { teamName: "Jumbo Bioworks", founders: "Dhruvaraj Nikkam" },
  { teamName: "Ashwagandha Consulting LLP", founders: "Dr. D. Dutta" },
  { teamName: "TOXISENSE", founders: "NITUL KALITA" },
  { teamName: "Grambasket", founders: "NUTHALAPATI NARENDRA" },
  { teamName: "Cruisehead", founders: "Saubaan Ahmad Siddiqui" },
  { teamName: "North East Spice Co.", founders: "Gopal Mazumdar" },
  { teamName: "Das Innovation Systems", founders: "Gourab Das" },
  { teamName: "Lemmino", founders: "Sayak Gupta" },
  { teamName: "SolarZ, more", founders: "Harsh Patel" },
  { teamName: "CalSci", founders: "shoubhik saha" },
  { teamName: "BLACKBOX", founders: "MEKA HEMANTH KUMAR" },
  { teamName: "ColdReach Health Systems", founders: "Mr. Pankaj Kumar Verma and Dr. Neeraj Kumar Vidhyarthi" },
  { teamName: "FodderWave Systems", founders: "Dr. Neeraj Kumar Vidhyarthi, Mr. Rishi Sharma and Mr. Saksham Pandey" },
  { teamName: "Digibility", founders: "Amit Gupta" },
  { teamName: "Irenova", founders: "Ipsita Das and Satyanarayana Chilumula" },
  { teamName: "Kadaikodi Tech Private Limited", founders: "R T Deepika" },
  { teamName: "MushBloom & Bite", founders: "Shiv Das" },
  { teamName: "PrakritiPure Biotech Private Limited", founders: "Dr. Kalyan Gayen, Dr. Tridib Kumar Bhowmick, Dr. Anirban Dutta, Mrs. Suvra Gayen, Mrs. Morin Dutta" },
  { teamName: "PINNANCLE BUILDERS", founders: "KJGYANAM" },
  { teamName: "smart wedges", founders: "VIKAS JHA" },
  { teamName: "Apni vidya", founders: "Koushik Roy" },
  { teamName: "LM Flux Farms", founders: "Lotusshree Borah, Dr. Madhusmita Borah" },
  { teamName: "MADS Biotechonyx", founders: "ABHISHEK DHEEVEN THAMARAI KANNAN" },
  { teamName: "Tarraki.ai", founders: "Jatin Mishra" },
  { teamName: "PTP NOZZLE", founders: "Perike Olive" },
  { teamName: "Myflat care", founders: "Pankaj Kushwaha" },
  { teamName: "SkyCatcher", founders: "Pragyaan Gaur" },
  { teamName: "ReLife", founders: "Pragyan Deep Handique" },
  { teamName: "Agriculture based on fruits", founders: "Partha Pratim Saha" },
  { teamName: "iCurious AI", founders: "Dr Rajan Kumar" },
  { teamName: "REXO Defence Systems Pvt Ltd", founders: "Ria Barnes" },
  { teamName: "Lightbuild materials and systems", founders: "SAGAR BANIK" },
  { teamName: "PisciCare", founders: "Sambeet Samant Sinhar" },
  { teamName: "Smart Solar Solutions", founders: "Samoil Chunawala" },
  { teamName: "Unifed", founders: "Saurin Saha" },
  { teamName: "GreenLedger", founders: "Sayan Maitra" },
  { teamName: "SunCharge-UAV", founders: "Dr. Shailendra Singh" },
  { teamName: "Green Agni Bio fuels", founders: "Dr. M. Arul Jayan, Dr.R.Govindarajan and Dr.Sakthidasan" },
  { teamName: "GAMASUSCO PRIVATE LIMITED", founders: "Shubham Ishwar Sonkusare" },
  { teamName: "SUNVIBEE TECH PVT LTD", founders: "Sudarshan Shete" },
  { teamName: "nestBookings", founders: "Sudheer Kangala" },
  { teamName: "PhoneWala", founders: "Tinku Kumar Sharma" },
  { teamName: "Farm & Folk Foods", founders: "TULSI SINGHA" },
  { teamName: "DST-ITBI", founders: "Dr. Uttam Kumar Mohanty" },
  { teamName: "Pathashala AI", founders: "Dhyan soni" },
  { teamName: "Zoffer", founders: "Chirag Goyal" },
];

const startups = await Startup.insertMany(
  startupNames.map(({ teamName, founders }, i) => ({
    teamName,
    projectTitle: `${teamName} Solution`,
    founders,
    category: categories[i % categories.length],
    pitchOrder: i + 1,
  }))
);

console.log(`Seeded ${startups.length} startups`);
console.log("\n📋 Judge login credentials:");
judgeData.forEach(j => console.log(`   ${j.email}  /  ${j.passwordHash}`));
console.log("\n Run: npm run dev");
await mongoose.disconnect();
