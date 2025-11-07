import "server-only";
import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

// Initialize R2 client
const r2Client = new S3Client({
	region: "auto",
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
	},
});

export interface UploadResult {
	url: string;
	key: string;
}

/**
 * Upload a file to Cloudflare R2
 * @param file - The file buffer to upload
 * @param key - The key/path for the file in R2
 * @param contentType - The MIME type of the file
 * @returns The public URL and key of the uploaded file
 */
export async function uploadToR2(
	file: Buffer,
	key: string,
	contentType: string,
): Promise<UploadResult> {
	const bucketName = process.env.R2_BUCKET_NAME || "";
	const publicUrl = process.env.R2_PUBLIC_URL || "";

	if (!bucketName || !publicUrl) {
		throw new Error(
			"R2 configuration is missing. Please check your environment variables.",
		);
	}

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: key,
		Body: file,
		ContentType: contentType,
	});

	await r2Client.send(command);

	return {
		url: `${publicUrl}/${key}`,
		key,
	};
}

/**
 * Delete a file from Cloudflare R2
 * @param key - The key/path of the file to delete
 */
export async function deleteFromR2(key: string): Promise<void> {
	const bucketName = process.env.R2_BUCKET_NAME || "";

	if (!bucketName) {
		throw new Error("R2_BUCKET_NAME is not configured");
	}

	const command = new DeleteObjectCommand({
		Bucket: bucketName,
		Key: key,
	});

	await r2Client.send(command);
}

/**
 * Extract the key from an R2 URL
 * @param url - The full R2 URL
 * @returns The file key
 */
export function extractKeyFromUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		// Remove leading slash
		return urlObj.pathname.substring(1);
	} catch {
		// If URL parsing fails, assume it's already a key
		return url;
	}
}

/**
 * Generate a unique file key for R2 storage
 * @param userId - The user ID
 * @param filename - The original filename
 * @returns A unique key for the file
 */
export function generateFileKey(userId: string, filename: string): string {
	const timestamp = Date.now();
	const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
	return `apc-documents/${userId}/${timestamp}-${sanitizedFilename}`;
}
