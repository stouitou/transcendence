import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 4000,
  DB_PATH: process.env.DB_PATH || "./db.sqlite",
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",
};
