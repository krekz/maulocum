import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "tsx prisma/seed.ts",
	},
	datasource: {
		url:
			process.env.NODE_ENV === "production"
				? env("DIRECT_URL") || "direct url" // Production only
				: env("DATABASE_URL") || "fallback url", // Development
	},
});
