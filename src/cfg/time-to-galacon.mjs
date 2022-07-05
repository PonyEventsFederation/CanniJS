import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";

export const galacon_date = zonedTimeToUtc(
	new Date(Date.UTC(2022, 7 - 1, 30)),
	"europe/berlin"
);

export const update_interval_in_secs = 60;
