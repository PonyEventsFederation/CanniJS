import { start_app, stop_app } from "./lib/Application.mjs";
import events from "events";

// TODO this is probably bad? need investigate
// (as part of general cleanup too)
events.setMaxListeners(50);

// TODO make this dev only
await import("dotenv/config");

await start_app();
process.on("SIGINT", stop_app);
process.on("SIGTERM", stop_app);
process.on("exit", stop_app);
