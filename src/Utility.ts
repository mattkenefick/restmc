/**
 * Converts a given value into a plain JS structure,
 * handling nested objects, arrays, circular references,
 * and objects that define their own `toJSON()` method.
 *
 * @param value Any value to serialize.
 * @param visited A WeakSet of visited objects (used to detect circular references).
 * @returns A plain JS structure, safe to pass to JSON.stringify.
 */
export function toJSONComprehensive(value: unknown, visited?: WeakSet<object>): unknown {
	// Handle null/undefined and primitive types directly:
	if (value === null || value === undefined || typeof value !== 'object') {
		return value;
	}

	// Initialize the "seen" set if not provided:
	if (!visited) {
		visited = new WeakSet<object>();
	}

	// If we've already seen this object, return a placeholder:
	if (visited.has(value)) {
		return '[Circular]';
	}
	visited.add(value);

	// If the object has its own toJSON, call it. Then recurse on its result.
	if (typeof (value as any).toJSON === 'function') {
		// The assumption here is that calling toJSON() returns
		// a brand-new object structure to be serialized.
		const toJSONResult = (value as any).toJSON();
		return toJSONComprehensive(toJSONResult, visited);
	}

	// If it's an array, map each element:
	if (Array.isArray(value)) {
		return value.map((element) => toJSONComprehensive(element, visited));
	}

	// Otherwise, it's a plain object (or some class instance).
	// Enumerate properties and recurse.
	const result: Record<string, unknown> = {};
	for (const [key, val] of Object.entries(value)) {
		result[key] = toJSONComprehensive(val, visited);
	}

	return result;
}

/**
 * Creates a stable JSON string from an object, sorting keys to ensure consistent output.
 * @param input The object to stringify.
 * @return A stable JSON string.
 */
function stableStringify(input: any): string {
	if (input === null || typeof input !== 'object') {
		return JSON.stringify(input);
	}

	if (Array.isArray(input)) {
		return `[${input.map(stableStringify).join(',')}]`;
	}

	const keys = Object.keys(input).sort();
	const result = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(input[key])}`);
	return `{${result.join(',')}}`;
}

/**
 * Generates a simple, compact hash from a given input string using FNV-1a algorithm.
 * @param input The string to hash.
 * @return A base64url-encoded hash string.
 */
function hashString(input: string): string {
	let hash = 2166136261;

	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
	}

	// Convert the 32-bit hash to bytes
	const bytes = new Uint8Array(4);
	bytes[0] = (hash >> 24) & 0xff;
	bytes[1] = (hash >> 16) & 0xff;
	bytes[2] = (hash >> 8) & 0xff;
	bytes[3] = hash & 0xff;

	// Manual base64url encoding
	return bytesToBase64Url(bytes);
}

/**
 * Converts a Uint8Array to a base64url string without dependencies.
 * @param bytes The bytes to encode.
 * @return A base64url-encoded string.
 */
function bytesToBase64Url(bytes: Uint8Array): string {
	// First convert to regular base64
	const base64 = bytesToBase64(bytes);

	// Then convert to base64url by replacing characters
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts a Uint8Array to a base64 string without dependencies.
 * @param bytes The bytes to encode.
 * @return A base64-encoded string.
 */
function bytesToBase64(bytes: Uint8Array): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	let result = '';

	// Process every 3 bytes (24 bits) at a time
	for (let i = 0; i < bytes.length; i += 3) {
		// Combine 3 bytes into a single integer
		const triplet =
			(bytes[i] << 16) |
			((i + 1 < bytes.length ? bytes[i + 1] : 0) << 8) |
			(i + 2 < bytes.length ? bytes[i + 2] : 0);

		// Extract 4 groups of 6 bits each and convert to base64 chars
		for (let j = 0; j < 4; j++) {
			// If we're past the data, add padding
			if (i * 8 + j * 6 >= bytes.length * 8) {
				result += '=';
			} else {
				// Extract 6 bits and get the corresponding character
				const index = (triplet >> (6 * (3 - j))) & 0x3f;
				result += chars[index];
			}
		}
	}

	return result;
}

/**
 * Creates a compact hash from an object.
 * @param obj The object to hash.
 * @return A base64url-encoded hash string representing the object.
 */
export function compactObjectHash(obj: any): string {
	const stableString = stableStringify(obj);
	return hashString(stableString);
}
