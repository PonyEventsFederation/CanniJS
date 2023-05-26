/* eslint-disable no-unused-vars */

import * as tslog from "tslog";

type Stop = () => Promise<void>;
type Module = {
	stop: Stop;
};
type ModuleInjects = {
	logger: tslog.Logger<void>;
	ignore_promise: <T>(promise: Promise<T>) => void;
};

type define_module = <T extends Module>(mod: (mi: ModuleInjects) => Promise<T>) =>
	(mi: ModuleInjects) => Promise<T>;
type define_stop = (stop: Stop) => Stop;
