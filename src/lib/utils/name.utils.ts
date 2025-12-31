/**
 * Extract first name or first two names from a full name
 *
 * Rules:
 * - Always take at most 2 names before combination words [bin, binti, a/l, a/p]
 * - If 3 names without combination words, take middle name + last name
 * - If 2 names, take both
 * - If 1 name, take it
 *
 * @param fullName - The full name to extract from
 * @returns The extracted first name(s)
 *
 * @example
 * extractFirstName("muhammad ali rostam bin kamarul") // "ali rostam"
 * extractFirstName("choo siew ling") // "siew ling"
 * extractFirstName("muhammad ali bin affendi") // "muhammad ali"
 * extractFirstName("rageshwaran A/L Pavindran") // "rageshwaran"
 * extractFirstName("pavithra rindewi A/P vinod") // "pavithra rindewi"
 */
export function extractFirstName(fullName: string | null | undefined): string {
	if (!fullName) return "";

	// Normalize the name: trim, convert to lowercase for comparison
	const normalized = fullName.trim().toLowerCase();

	// Split by spaces
	const parts = normalized.split(/\s+/);

	if (parts.length === 0) return "";
	if (parts.length === 1) return parts[0];

	// Combination words that separate patronymic/matronymic
	const combinationWords = ["bin", "binti", "a/l", "a/p", "al", "ap"];

	// Find index of first combination word
	const combinationIndex = parts.findIndex((part) =>
		combinationWords.includes(part.replace(/\//g, "").toLowerCase()),
	);

	if (combinationIndex !== -1) {
		// Found combination word - take at most 2 names before it
		if (combinationIndex === 1) {
			// Only 1 name before combination (e.g., "rageshwaran a/l pavindran")
			return parts[0];
		}
		// Take last 2 names before combination (e.g., "muhammad ali bin affendi" -> "muhammad ali")
		const startIndex = Math.max(0, combinationIndex - 2);
		return parts.slice(startIndex, combinationIndex).join(" ");
	}

	// No combination word found
	if (parts.length === 2) {
		// 2 names - take both (e.g., "john doe")
		return parts.join(" ");
	}

	if (parts.length === 3) {
		// 3 names - take middle + last (e.g., "choo siew ling" -> "siew ling")
		return `${parts[1]} ${parts[2]}`;
	}

	// 4+ names without combination - take last 2
	return parts.slice(-2).join(" ");
}

/**
 * Capitalize the first letter of each word in a name
 *
 * @param name - The name to capitalize
 * @returns The capitalized name
 *
 * @example
 * capitalizeName("ali rostam") // "Ali Rostam"
 * capitalizeName("siew ling") // "Siew Ling"
 */
export function capitalizeName(name: string): string {
	return name
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Extract and capitalize first name(s) from full name
 *
 * @param fullName - The full name to extract from
 * @returns The extracted and capitalized first name(s)
 *
 * @example
 * getDisplayName("muhammad ali rostam bin kamarul") // "Ali Rostam"
 * getDisplayName("choo siew ling") // "Siew Ling"
 * getDisplayName("RAGESHWARAN A/L PAVINDRAN") // "Rageshwaran"
 */
export function getDisplayName(fullName: string | null | undefined): string {
	const extracted = extractFirstName(fullName);
	return capitalizeName(extracted);
}
