import { IpcService, Listener } from "./ipc.service";
import { TopicTree } from "./topic-tree";


export class TopicIpcService implements IpcService {

    private tree: TopicTree;

    constructor(private ipcService: IpcService, options: {
        delimintor: string,
        star?: string,
        hash?: string
    }) {
        this.tree = new TopicTree(options.delimintor, options.star, options.hash);
    }

    send(channel: string, ...args: any): void {
        throw new Error("Method not implemented.");
    }
    
    on(channel: string, listener: Listener): void {
        throw new Error("Method not implemented.");
    }

    once(channel: string, listener: Listener): void {
        throw new Error("Method not implemented.");
    }

    removeListener(channel: string, listener: Listener): void {
        throw new Error("Method not implemented.");
    }

    removeAllListeners(channel: string): void {
        throw new Error("Method not implemented.");
    }
}