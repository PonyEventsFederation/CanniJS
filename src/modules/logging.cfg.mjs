import * as ids from "../ids.mjs";
import { define_value } from "../util.mjs";

/**
 * @typedef {{
 *    roles?: Array<string>;
 *    users?: Array<string>;
 * }} Authorisation
 */
export const authorisation = define_value({
	gc: () => /** @type {Authorisation} */ ({
		roles: [
			ids.roles.galacon_admin,
			ids.roles.galacon_mod,
			ids.roles.galacon_botmaster
		],
		users: [
			// for managing in other servers
			ids.users.autumn
		]
	}),
	autumn: () => ({
		users: [
			ids.users.autumn
		]
	})
});
