import "dotenv/config";

import * as app from "./app.mjs";

await app.run();

console.log("a");

function stop() {
	// go to newline just so that i can get rid of that `^C` thing misaligning things
	// because that AAGH bothers me so incredibly much - Autumn
	process.stdout.write("\n");
	app.stop();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
process.on("exit", stop);
