import { Preferences } from "../utils";

const connectionURLExamples: Record<
	InstanceType<typeof Preferences>["database"],
	string
> = {
	PostgreSQL: "postgresql://root:mypassword@localhost:5432/mydb?schema=sample",
	MySQL: "mysql://root:mypassword@localhost:3306/mydb",
	SQLServer:
		"sqlserver://localhost:1433;database=mydb;user=root;password=mypassword;",
	CockroachDB:
		"postgresql://root:mypassword@localhost:26257/mydb?schema=public",
	MongoDB:
		"mongodb+srv://root:mypassword@cluster0.ab1cd.mongodb.net/mydb?retryWrites=true&w=majority",
	SQLite: "file:./src/db/sqlite.db",
};

export function getEnvFile({ database, orm }: Preferences) {
	return [
		...(database === "SQLite" && orm === "Drizzle"
			? ""
			: [`DATABASE_URL="${connectionURLExamples[database]}"`]),
		"PORT=3000",
	].join("\n");
}
