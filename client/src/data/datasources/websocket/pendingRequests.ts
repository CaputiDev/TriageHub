export class PendingRequests {
    private readonly resolves = new Map<string, (value: unknown) => void>();
    private readonly rejects = new Map<string, (reason: Error) => void>();

    public set<T>(key: string, resolve: (value: T) => void, reject: (reason: Error) => void): void {
        this.resolves.set(key, resolve as (value: unknown) => void);
        this.rejects.set(key, reject);
    }

    public resolve<T>(key: string, value: T): void {
        const resolve = this.resolves.get(key);
        if (resolve) {
            resolve(value);
        }

        this.resolves.delete(key);
        this.rejects.delete(key);
    }

    public reject(key: string, reason: Error): void {
        const reject = this.rejects.get(key);
        if (reject) {
            reject(reason);
        }

        this.resolves.delete(key);
        this.rejects.delete(key);
    }

    public getResolve<T>(key: string): ((value: T) => void) | undefined {
        return this.resolves.get(key) as ((value: T) => void) | undefined;
    }

    public getReject(key: string): ((reason: Error) => void) | undefined {
        return this.rejects.get(key);
    }

    public delete(key: string): void {
        this.resolves.delete(key);
        this.rejects.delete(key);
    }
}
