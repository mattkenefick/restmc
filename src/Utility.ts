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
