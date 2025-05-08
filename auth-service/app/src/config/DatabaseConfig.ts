// Purpose: Configuration for database service.
// This file is used to store the configuration for the database.
export const DATABASE_CONFIG = {
	SQLITE_DATABASE_URL: process.env.SQLITE_DATABASE_URL || "http://database-services:3000/api/v2/database",
};