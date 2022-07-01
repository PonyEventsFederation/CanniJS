import { Logger } from "tslog";

const logger = new Logger({
	name: "meep",
	displayFunctionName: false
});

logger.info("meeep");
