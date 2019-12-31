import { TopicIpcService } from '../../topic.ipc.service';
import { IpcService, Listener } from '../../ipc.service';



describe('Topic Ipc Service Tests', () => {
    let service: TopicIpcService;

    class MockService implements IpcService {

        send = (channel: string, ...args: any): void => {
        }

        on = (channel: string, listener: Listener): void => {
        }

        removeListener = (channel: string, listener: Listener): void => {
        }

        removeAllListeners = (channel: string): void => {
        }
    }

    let mock: MockService;

    beforeEach(() => {
        mock = new MockService();
        service = new TopicIpcService(mock, {
            delimintor: '.',
        });
    });

    it('on should add twice for direct', () => {
        let count = 0;
        mock.on = (channel, listener) => {
            ++count;
            expect(channel).toBe('first');
        }

        service.on('first', () => { });
        service.on('first', () => { });
    });

    it('on and send should send direct for topic', () => {
        let count = 0;
        let cmd = (event: string, name: string, value: number) => {
            expect(name).toBe('name');
            expect(value).toBe(10);
            count++;
        }

        let listener: Listener;

        mock.on = (channel, l): void => {
            ++count;
            listener = l;
            expect(channel).toBe('first');
        }

        mock.send = (channel, ...args: any): void => {
            expect(channel).toBe('first');
            listener(channel, ...args);
        }

        service.on('first', cmd);
        service.on('first', cmd);
        service.send('first', 'name', 10);

        expect(count).toBe(3);
    });

    it('on and send should send direct and star for topic', () => {
        let count = 0;
        let cmd = (event: string, name: string, value: number) => {
            expect(name).toBe('name');
            expect(value).toBe(10);
            count++;
        }

        let listener: Listener;

        mock.on = (channel, l): void => {
            ++count;
            listener = l;
            if (count === 1) {
                expect(channel).toBe('*.second');
            } else {
                expect(channel).toBe('first.second');
            }
        }

        mock.send = (channel, ...args: any): void => {
            listener(channel, ...args);
        }

        service.on('*.second', cmd);
        service.on('first.second', cmd);
        service.send('first.second', 'name', 10);

        expect(count).toBe(4);
    });

    it('on and send should send direct and hash for topic', () => {
        let count = 0;
        let cmd = (event: string, name: string, value: number) => {
            expect(name).toBe('name');
            expect(value).toBe(10);
            count++;
        }

        let listener: Listener;

        mock.on = (channel, l): void => {
            ++count;
            listener = l;
            if (count === 1) {
                expect(channel).toBe('#.second');
            } else {
                expect(channel).toBe('first.second');
            }
        }

        mock.send = (channel, ...args: any): void => {
            listener(channel, ...args);
        }

        service.on('#.second', cmd);
        service.on('first.second', cmd);
        service.send('first.second', 'name', 10);

        expect(count).toBe(4);
    });

    it('send on root of tree for topic', () => {
        let count = 0;
        let cmd = (event: string, name: string, value: number) => {
            expect(name).toBe('name');
            expect(value).toBe(10);
            count++;
        }

        let listener: Listener;

        mock.on = (channel, l): void => {
            ++count;
            listener = l;
            if (count === 1) {
                expect(channel).toBe('first');
            } else if (count === 2) {
                expect(channel).toBe('first.first');
            } else {
                expect(channel).toBe('first.second');
            }
        }

        mock.send = (channel, ...args: any): void => {
            listener(channel, ...args);
        }

        service.on('first', cmd);
        service.on('first.first', cmd);
        service.on('first.second', cmd);
        service.send('first', 'name', 10);

        expect(count).toBe(4);
    });

    



});
