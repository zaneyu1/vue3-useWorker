export declare function useWorker<T extends (...args: any[]) => any>(workerFunction: T): readonly [(...args: Parameters<T>) => Promise<ReturnType<T>>, {
    readonly isRunning: import("vue").Ref<boolean, boolean>;
    readonly terminateWorker: () => void;
}];
