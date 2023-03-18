import type { Logger } from "tslog";
export type Stop = () => Promise<void>;

export type Module = {
	stop: Stop;
};
export type ModuleInjects = {
	logger: Logger<void>
};

declare global {
	function define_module<T extends Module>(mod: (mi: ModuleInjects) => T): (mi: ModuleInjects) => T
	function define_stop(stop: Stop): Stop;
	function stop(): Promise<void>;
}
