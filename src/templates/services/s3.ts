import dedent from "ts-dedent";
import type { Preferences } from "../../utils.ts";

export function getS3ServiceFile({ s3Client }: Preferences) {
	if (s3Client === "Bun.S3Client") {
		return dedent /* ts */`
import { S3Client } from "bun";
import { config } from "../config.ts";

export const s3 = new S3Client({
    endpoint: config.S3_ENDPOINT,
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
});
`;
	}

	if (s3Client === "@aws-sdk/client-s3") {
		return dedent /* ts */`
import { S3Client } from "@aws-sdk/client-s3";
import { config } from "../config.ts";

export const s3 = new S3Client({
    endpoint: config.S3_ENDPOINT,
    region: "minio",
    credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    },
});
`;
	}

	return "";
}
