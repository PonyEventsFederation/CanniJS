import type { Logger } from "tslog";

declare global {
	/**
	 * this is undefined, but a helper constant to type the variable as `Logger`
	 * without having to manually type out the definitions all the time
	 */
	const logger_var_init: Logger;
}
