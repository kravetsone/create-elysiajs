export function getConnection() {
	return `import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { config } from "../configs/config";

// You can specify any property from the node-postgres connection options
const db = drizzle({
  connection: {
    connectionString: config.DATABASE_URL || "",
  },
  schema,
});

export { db };
`;
}
