import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { users, credentials } from "./storage/schema";
import { DatabasePg } from "./common";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import hashPassword from "./common/helpers/hashPassword";

dotenv.config({ path: "./.env" });

if (!("DATABASE_URL" in process.env))
  throw new Error("DATABASE_URL not found on .env");

async function seed() {
  const connectionString = process.env.DATABASE_URL!;
  const testUserEmail = "user@example.com";
  const adminPassword = "password";

  const sql = postgres(connectionString);
  const db = drizzle(sql) as DatabasePg;

  try {
    const adminUserData = {
      id: faker.string.uuid(),
      email: testUserEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const [insertedAdminUser] = await db
      .insert(users)
      .values(adminUserData)
      .returning();

    const adminCredentialData = {
      id: faker.string.uuid(),
      userId: insertedAdminUser.id,
      password: await hashPassword(adminPassword),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const [insertedAdminCredential] = await db
      .insert(credentials)
      .values(adminCredentialData)
      .returning();

    console.log("Created admin user:", {
      ...insertedAdminUser,
      credentials: {
        ...insertedAdminCredential,
        password: adminPassword,
      },
    });

    const usersWithCredentials = await Promise.all(
      Array.from({ length: 5 }, async () => {
        const userData = {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const [insertedUser] = await db
          .insert(users)
          .values(userData)
          .returning();

        const password = faker.internet.password();
        const credentialData = {
          id: faker.string.uuid(),
          userId: insertedUser.id,
          password: await hashPassword(password),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const [insertedCredential] = await db
          .insert(credentials)
          .values(credentialData)
          .returning();

        return {
          ...insertedUser,
          credentials: {
            ...insertedCredential,
            password: password,
          },
        };
      }),
    );

    console.log("Created users with credentials:", usersWithCredentials);
    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("An error occurred:", error);
      process.exit(1);
    });
}

export default seed;
