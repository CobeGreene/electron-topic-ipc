export type Listener = (event: any, ...args: any) => void;

export abstract class IpcService {
    abstract send(channel: string, ...args: any): void;

    abstract on(channel: string, listener: Listener): void;
    
    abstract removeListener(channel: string, listener: Listener): void;
    
    abstract removeAllListeners(channel: string): void;
}


