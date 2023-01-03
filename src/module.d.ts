import type { Logger } from "tslog";
export type Start = (logger: Logger) => Promise<void>;
export type Stop = () => Promise<void>;
export type Module = {
	start?: Start;
	stop?: Stop;
};

declare global {
	function define_module<T extends Module>(mod: T | (() => T)): T & { get_logger: () => Logger };
	function define_start(start: Start): Start;
	function define_stop(stop: Stop): Stop;
}
