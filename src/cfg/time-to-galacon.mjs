import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";
import { define_value } from "../util.mjs";

export const tz = "europe/berlin";

export const galacon_date = zonedTimeToUtc(
	new Date(Date.UTC(2022, 7 - 1, 30)),
	tz
);

export const update_interval_in_secs = define_value({
	gc: () => 60,
	autumn: () => 15
});
