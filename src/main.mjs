/* eslint-disable no-unused-vars */

import { start_app, stop_app } from "./lib/Application.mjs";

// TODO make this dev only
await import("dotenv/config");

await start_app();
process.on("SIGINT", stop_app);
process.on("SIGTERM", stop_app);
process.on("exit", stop_app);
