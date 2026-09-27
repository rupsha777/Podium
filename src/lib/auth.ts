import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db, schema } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        // Output magic link clearly to console and store for developer ease
        console.log("\n=======================================================");
        console.log(" 🪄 [PODIUM MAGIC LINK SIGN-IN]");
        console.log(` 📧 Recipient: ${email}`);
        console.log(` 🔗 Verification URL: ${url}`);
        console.log(` 🔑 Token: ${token}`);
        console.log("=======================================================\n");
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "participant",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET || "podium_default_secret_key_72hr_hackathon",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
