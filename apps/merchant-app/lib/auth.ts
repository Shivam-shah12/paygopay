import GoogleProvider from "next-auth/providers/google";
import db from "@repo/db/client";
import { AdapterUser } from "next-auth/adapters"; // Import this type for better type compatibility
import { Account, Profile, User } from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn(params: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
      email?: { verificationRequest?: boolean };
      credentials?: Record<string, unknown>;
    }) {
      const { user, account } = params;

      console.log("hi signin");

      if (!user || !user.email) {
        return false;
      }

      await db.merchant.upsert({
        select: {
          id: true,
        },
        where: {
          email: user.email,
        },
        create: {
          email: user.email,
          name: user.name || "", // Default to empty string if name is undefined
          auth_type: account?.provider === "google" ? "Google" : "Github", // Handle null for account
        },
        update: {
          name: user.name || "", // Default to empty string if name is undefined
          auth_type: account?.provider === "google" ? "Google" : "Github", // Handle null for account
        },
      });

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "secret",
};
