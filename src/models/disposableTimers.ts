type TimerHandler = (...args: any[]) => void;

export class DisposableTimers {
    private _timeoutTimers = new Set<number>();
    private _intervalTimers = new Set<number>();

    // noinspection JSUnusedGlobalSymbols
    public setTimeout(handler: TimerHandler, timeout?: number, ...args: any[]): number {
        const handleId = window.setTimeout((...handlerArgs) => {
            handler(...handlerArgs);
            this._timeoutTimers.delete(handleId);
        }, timeout, ...args);
        this._timeoutTimers.add(handleId);
        return handleId;
    }

    // noinspection JSUnusedGlobalSymbols
    public setInterval(handler: TimerHandler, timeout?: number, ...args: any[]): number {
        const handleId = window.setInterval((...handlerArgs) => {
            handler(...handlerArgs);
            this._intervalTimers.delete(handleId);
        }, timeout, ...args);
        this._intervalTimers.add(handleId);
        return handleId;
    }

    public clearTimeoutTimers(): void {
        for (const handleId of this._timeoutTimers.values()) {
            window.clearTimeout(handleId);
        }
        this._timeoutTimers.clear();
    }

    public clearIntervalTimers(): void {
        for (const handleId of this._intervalTimers.values()) {
            window.clearInterval(handleId);
        }
        this._timeoutTimers.clear();
    }

    // noinspection JSUnusedGlobalSymbols
    public clear(): void {
        this.clearTimeoutTimers();
        this.clearIntervalTimers();
    }

    // noinspection JSUnusedGlobalSymbols
    get timeoutTimers(): Set<number> {
        return this._timeoutTimers;
    }

    // noinspection JSUnusedGlobalSymbols
    get intervalTimers(): Set<number> {
        return this._intervalTimers;
    }
}