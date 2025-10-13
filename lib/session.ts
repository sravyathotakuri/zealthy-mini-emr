// lib/session.ts
import type { SessionOptions } from "iron-session";

if (!process.env.SESSION_SECRET) {
  throw new Error("Missing SESSION_SECRET in env (set it in .env.local).");
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "zealthy.session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
