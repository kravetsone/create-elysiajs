export function getHealthyCheck() {
	return `import { sql } from "drizzle-orm";
import { db } from "./connection";

/**
 * Health check function - verifies database connection is working properly
 * @returns Health check result
 */
export async function performHealthCheck() {
  try {
    // Print database connection information
       const url = process.env.DATABASE_URL;
       if (url) {
         try {
         const u = new URL(url);
         const safe = \`\${u.protocol}//\${u.hostname}\${u.port ? ":" : ""}\${u.port}\${u.pathname}\`;
         console.log("Database connection target", safe);
         } catch {
         console.log("Database connection string configured");
         }
      }
    // Use drizzle's query method instead of execute(sql\`\`)
    const result = await db.execute(sql\`SELECT 1 + 1 AS solution\`);

    console.log("Database connection successful");
    return { success: true, message: "Health check passed" };
  } catch (error) {
    console.error("Database connection failed:", error);
    return {
      success: false,
      message: \`Database connection failed: \${(error as Error).message}\`,
    };
  }
}

// Health check function before server startup
export async function startupHealthCheck() {
  console.log("🔍 Performing startup health check...");
  const result = await performHealthCheck();

  if (result.success) {
    console.log("✅ Database health check passed");
  } else {
    console.warn(\`⚠️ Database health check failed: \${result.message}\`);
    console.warn("⚠️ Continuing server startup, but database features may not be available");
  }
}
`;
}
