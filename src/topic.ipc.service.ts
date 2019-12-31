import { IpcService, Listener } from "./ipc.service";
import { TopicTree } from "./topic-tree";


export class TopicIpcService implements IpcService {

    private tree: TopicTree;

    constructor(private ipcService: IpcService, options: {
        delimintor: string,
        star?: string,
        hash?: string,
        throwOnRemove?: boolean
    }) {
        this.tree = new TopicTree(options.delimintor, options.star, options.hash, options.throwOnRemove);
    }

    send(channel: string, ...args: any): void {
        this.tree.traverse(channel, (topic) => {
            this.ipcService.send(topic, ...args);
        });
    }
    
    on(channel: string, listener: Listener): void {
        this.tree.add(channel);
        this.ipcService.on(channel, listener);
    }

    removeListener(channel: string, listener: Listener): void {
        this.tree.remove(channel);
        this.ipcService.removeListener(channel, listener);
    }

    removeAllListeners(channel: string): void {
        this.tree.removeAll(channel);
        this.ipcService.removeAllListeners(channel);
    }
}