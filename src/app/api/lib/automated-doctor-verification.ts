import { load } from "cheerio";
import { PDFParse } from "pdf-parse";
import { request } from "undici";

export interface MMCParams {
	name: string;
	provisionalId?: string;
	fullId?: string;
}

export async function scrapeMMC(params: MMCParams) {
	try {
		const { name, provisionalId, fullId } = params;

		if (!provisionalId && !fullId) {
			throw new Error("Either provisionalId or fullId must be provided");
		}

		// Build query string based on provided parameters
		const queryParams = new URLSearchParams({ name: name.toUpperCase() });
		if (provisionalId) {
			queryParams.append("provisional", provisionalId);
		}
		if (fullId) {
			queryParams.append("full", fullId);
		}

		// Step 1: Fetch the main page to get the ajaxLoadPhp link
		const { statusCode: mainStatus, body: mainBody } = await request(
			`https://merits.mmc.gov.my/search/registeredDoctor?${queryParams.toString()}`,
		);

		if (mainStatus !== 200) {
			throw new Error(`Failed to fetch main page: ${mainStatus}`);
		}

		const mainHtml = await mainBody.text();
		const $main = load(mainHtml);

		// find the "ajaxLoadPhp" URL from the onclick attribute
		const onclickAttr = $main("a.btn.bg-light-blue.btn-circle-sm").attr(
			"onclick",
		);

		if (!onclickAttr) {
			throw new Error("No doctor found");
		}

		// Extract URL from onclick="ajaxLoadPhp('URL', ...)"
		const urlMatch = onclickAttr.match(/ajaxLoadPhp\('([^']+)'/);

		if (!urlMatch || !urlMatch[1]) {
			throw new Error("Could not extract URL from onclick attribute");
		}

		const doctorUrl = urlMatch[1];

		const { statusCode, body } = await request(doctorUrl);

		if (statusCode !== 200) {
			throw new Error(`Failed to fetch doctor page: ${statusCode}`);
		}

		const html = await body.text();
		const $ = load(html);

		const getValue = (value: string) => {
			const trimmed = value.trim();
			return trimmed === "" || trimmed === "-" ? null : trimmed;
		};

		const doctorInfo = {
			name: getValue($("#div-full-name > div").text()),
			provisionalRegNo: getValue(
				$("#div-provisional-registration-number > div").text(),
			),
			fullRegNo: getValue($("#div-full-registration-number > div").text()),
			APCNo: getValue(
				$(
					"body > fieldset > div.table-responsive > table > tbody > tr:nth-child(2) > td:nth-child(3)",
				).text(),
			), // need to change to child(1) later
			year: getValue(
				$(
					"body > fieldset > div.table-responsive > table > tbody > tr:nth-child(2) > td:nth-child(2)",
				).text(),
			), // need to change to child(1) later
			dateFullReg: (() => {
				const dateStr = $("#div-date-of-full-registration > div").text().trim();
				if (dateStr === "" || dateStr === "-") return null;
				const [day, month, year] = dateStr.split("-");
				return new Date(`${year}-${month}-${day}`);
			})(),
		};

		if (doctorInfo.name?.toUpperCase() !== name.toUpperCase()) {
			throw new Error("Doctor name does not match");
		}

		return {
			success: true as const,
			data: doctorInfo,
		};
	} catch (error) {
		console.error("Error in scrapeMMC", error);
		return {
			success: false as const,
			data: null,
		};
	}
}

async function scanAPCDocs(url: string | URL) {
	try {
		const res = await fetch(url);
		const buffer = Buffer.from(await res.arrayBuffer());
		const parser = new PDFParse({ data: buffer });
		const result = await parser.getText();
		await parser.destroy();

		const lines = result.text.split("\n").filter((line) => line.trim() !== "");

		// Validation helpers
		const isFullCapital = (str: string) => /^[A-Z\s]+$/.test(str);
		const isValidIC = (str: string) => /^\d{6}-\d{2}-\d{4}$/.test(str);
		const isValidYear = (str: string) => /^\d{4}$/.test(str);
		const isValidAPC = (str: string) => /^\d+$/.test(str);

		const rawName = lines[15]?.trim();
		const rawIC = lines[16]?.trim();
		const rawApc = lines[7]?.slice(3, 10).trim();
		const rawYear = lines[7]?.slice(11).trim();
		const rawAddress = lines
			.slice(18, 22)
			.map((line) => line.trim())
			.join(", ");

		const formatted = {
			name: rawName && isFullCapital(rawName) ? rawName : null,
			IC: rawIC && isValidIC(rawIC) ? rawIC : null,
			apc: rawApc && isValidAPC(rawApc) ? rawApc : null,
			year: rawYear && isValidYear(rawYear) ? rawYear : null,
			address:
				rawAddress && isFullCapital(rawAddress.replace(/[0-9,\-\s]/g, ""))
					? rawAddress
					: null,
		};

		const nullFields = Object.entries(formatted)
			.filter(([_, value]) => value === null)
			.map(([key]) => key);

		if (nullFields.length > 0) {
			throw new Error(
				`Invalid PDF: Could not detect valid fields: ${nullFields.join(", ")}`,
			);
		}

		return {
			success: true as const,
			data: formatted,
		};
	} catch (error) {
		console.error("Error in scanAPCDocs", error);
		return {
			success: false as const,
			data: null,
		};
	}
}

interface VerificationResult {
	nameMatch: boolean;
	apcMatch: boolean;
	fullDetails: {
		name: string | null;
		fullRegNo: string | null;
		provisionalRegNo: string | null;
		apc: string | null;
		address: string | null;
	};
}

export async function automatedDoctorVerification(
	apcPDFUrl: string | URL,
	input: MMCParams,
): Promise<{ data: VerificationResult | null; success: boolean }> {
	const [scrape, scanResult] = await Promise.all([
		scrapeMMC(input),
		scanAPCDocs(apcPDFUrl),
	]);

	if (!scrape.success || !scanResult.success) {
		return {
			data: null,
			success: false,
		};
	}

	const verify = {
		nameMatch: scrape.data.name === scanResult.data.name,
		apcMatch: scanResult.data.apc
			? scrape.data.APCNo === scanResult.data.apc.split(" / ")[0]
			: false,
		fullDetails: {
			name: scrape.data.name,
			fullRegNo: scrape.data.fullRegNo,
			provisionalRegNo: scrape.data.provisionalRegNo,
			apc: scrape.data.APCNo,
			address: scanResult.data.address,
		},
	};

	if (verify.nameMatch && verify.apcMatch) {
		console.log("\n✓ Verification PASSED - Data matches!");
		return {
			data: verify,
			success: true,
		};
	} else {
		console.error("\n✗ Verification FAILED - Data mismatch!");
		console.error(verify);
		return {
			data: null,
			success: false,
		};
	}
}
