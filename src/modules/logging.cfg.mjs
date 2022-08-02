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

export const no_access = "Sorry, you don't have permission to do that.";
export const invalid_format = "Sorry, I don't know that format.";
export const sending_to_dm = "Check your private messages!";
export const here_you_go = "Here are the logs!";
