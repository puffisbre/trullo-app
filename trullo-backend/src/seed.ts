import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";


import { User } from "./model/User";
import { Task } from "./model/Task";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI;


const USER_COUNT = 5;       
const TASKS_PER_USER = 5;    
const KEEP_EXISTING = false; 
const DEMO_PASSWORD = "Password123!";
const SALT_ROUNDS = 12;


async function main() {
  console.log("➡️  Connecting:", MONGODB_URI);
   await mongoose.connect(MONGODB_URI as string, {
        dbName: process.env.DB_NAME,
    });
  console.log("✅ Connected");

  if (!KEEP_EXISTING) {
    console.log("🧹 Clearing collections...");
    await Promise.all([User.deleteMany({}), Task.deleteMany({})]);
  } else {
    console.log("⏭️  Keeping existing data");
  }

  console.log(`👤 Creating ${USER_COUNT} users...`);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const usersDocs = [];
  for (let i = 0; i < USER_COUNT; i++) {
    usersDocs.push(
      new User({
        name: faker.person.fullName(),
        email: `${faker.internet.username().toLowerCase()}_${i}@example.com`,
        password: passwordHash,
      })
    );
  }
  const users = await User.insertMany(usersDocs, { ordered: false });
  console.log(`✅ Inserted ${users.length} users`);

  console.log(`🗒️  Creating ${TASKS_PER_USER} tasks per user...`);
  const statuses = ["to-do", "in progress", "blocked", "done"] as const;

  const tasksPayload: any[] = [];
  for (const u of users) {
    for (let i = 0; i < TASKS_PER_USER; i++) {
      const status = faker.helpers.arrayElement(statuses);
      tasksPayload.push({
        title: `${faker.hacker.verb()} ${faker.hacker.noun()}`,
        description: faker.lorem.sentences({ min: 1, max: 3 }),
        status,
        assignedTo: u._id,
        finishedAt: status === "done" ? new Date() : null,
      });
    }
  }
  await Task.create(tasksPayload);
  console.log(`✅ Inserted ${tasksPayload.length} tasks`);

  console.log("🎉 Done. Demo-lösenord för alla:", DEMO_PASSWORD);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ Seed failed:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});