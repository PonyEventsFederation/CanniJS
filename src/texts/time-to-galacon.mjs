/**
 * @param {number} d
 * @param {number} h
 * @param {number} m
 */
export const status_msg = (d, h, m) =>
	`Time to Galacon: ${d} days, ${
		h.toString().padStart(2, "0")
	}:${
		m.toString().padStart(2, "0")
	} left! Hype!`;
