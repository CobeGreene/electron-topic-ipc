import { TopicTree } from '../../topic-tree';

describe('Topic Tree Tests', () => {

    let tree: TopicTree;

    beforeEach(() => {
        tree = new TopicTree('.', '*', '#');
    });

    it('Throw error for adding empty topic', () => {
        expect(() => {
            tree.add('');
        }).toThrowError();
    });

    it('Throw error for adding delminator topics', () => {
        expect(() => {
            tree.add('...');
        }).toThrowError();
    });
    
    it('Throw error for removing empty topic', () => {
        expect(() => {
            tree.remove('');
        }).toThrowError();
    });

    it('Throw error for removing delminator topics', () => {
        expect(() => {
            tree.remove('...');
        }).toThrowError();
    });

    it('traverse should throw for empty topic', () => {
        expect(() => {
            tree.traverse('', () => {});
        }).toThrowError();
    });

    it('traverse should throw for elminator only topics', () => {
        expect(() => {
            tree.traverse('...', () => {});
        }).toThrowError();
    });

    it('traverse should throw for star in topic', () => {
        expect(() => {
            tree.traverse('word.*.word.word', () => {});
        }).toThrowError();
    });

    it('traverse should throw for hash in topic', () => {
        expect(() => {
            tree.traverse('word.word.#.word', () => {});
        }).toThrowError();
    });

    it('add star should work for any topic', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            expect(channel).toBe('*');
        }
        tree.add('*');
        tree.traverse('one', cmd);
        tree.traverse('blah', cmd);
        tree.traverse('something', cmd);

        expect(count).toBe(3);
    });
    
    it('remove star should not call for any topic', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }
        tree.add('*');
        tree.remove('*');
        tree.traverse('one', cmd);
        tree.traverse('blah', cmd);
        tree.traverse('something', cmd);

        expect(count).toBe(0);
    });

    it('add hash should work for any zero to many topics', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            expect(channel).toBe('#');
        }
        tree.add('#');
        tree.traverse('one', cmd);
        tree.traverse('blah.blah', cmd);
        tree.traverse('something.other.one.more', cmd);

        expect(count).toBe(3);
    });
    
    it('remove hash should not call for any zero to many topics', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }
        tree.add('#');
        tree.remove('#');
        tree.traverse('one', cmd);
        tree.traverse('blah.blah', cmd);
        tree.traverse('something.other.one.more', cmd);

        expect(count).toBe(0);
    });


    it('remove direct should not call for one word', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }
        tree.add('first');
        tree.remove('first');
        tree.traverse('not', cmd);
        tree.traverse('first', cmd);
        tree.traverse('not.this.one', cmd);

        expect(count).toBe(0);
    });

    it('add direct star direct should work for any middle word', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }
        tree.add('first.*.three');
        tree.traverse('first.any.three', cmd);
        tree.traverse('first.two.three', cmd);
        tree.traverse('first.whatever', cmd);
        tree.traverse('whatever.whatever.three', cmd);

        expect(count).toBe(2);
    });

    it('remove direct star direct should not call', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }
        tree.add('first.*.three');
        tree.remove('first.*.three');
        tree.traverse('first.any.three', cmd);
        tree.traverse('first.two.three', cmd);
        tree.traverse('first.whatever', cmd);
        tree.traverse('whatever.whatever.three', cmd);

        expect(count).toBe(0);
    });
    
    it('add direct hash direct should work for any middle word', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            expect(channel).toBe('first.#.three');
        }
        tree.add('first.#.three');
        tree.traverse('first.any.three', cmd);
        tree.traverse('first.any.any.any.three', cmd);
        tree.traverse('any.first.three', cmd);
        tree.traverse('whatever.whatever.three', cmd);

        expect(count).toBe(2);
    });
    
    it('remove direct hash direct should not call for any middle word', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }
        tree.add('first.#.three');
        tree.remove('first.#.three');
        tree.traverse('first.any.three', cmd);
        tree.traverse('first.any.any.any.three', cmd);
        tree.traverse('any.first.three', cmd);
        tree.traverse('first.three', cmd);
        tree.traverse('first', cmd);
        tree.traverse('whatever.whatever.three', cmd);

        expect(count).toBe(0);
    });

    it('add two star with direct should word', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            if (count % 2 === 1) {
                expect(channel).toBe('*.one');
            } else if (count % 2 === 0) {
                expect(channel).toBe('*.two');
            } else {
                throw new Error();
            }
        }

        tree.add('*.one');
        tree.add('*.two');
        tree.traverse('any.one', cmd);
        tree.traverse('any.two', cmd);
        tree.traverse('thing.one', cmd);
        tree.traverse('other.two', cmd);
        tree.traverse('whatever.whatever', cmd);

        expect(count).toBe(4);
    });
    
    it('remove one two star with direct should word', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            expect(channel).toBe('*.two');
        }

        tree.add('*.one');
        tree.add('*.two');
        tree.remove('*.one');
        tree.traverse('any.one', cmd);
        tree.traverse('any.two', cmd);
        tree.traverse('thing.one', cmd);
        tree.traverse('other.two', cmd);
        tree.traverse('whatever.whatever', cmd);

        expect(count).toBe(2);
    });

    it('traversing hitting two different traverse with different topic', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            if (count === 1) {
                expect(channel).toBe('any.one');
            } else {
                expect(channel).toBe('*.one');
            }
        }
        tree.add('any.one');
        tree.add('*.one');
        tree.traverse('any.one', cmd);

        expect(count).toBe(2);
    });
    
    it('remove traversing hitting only one traverse with different topic', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            if (count === 1) {
                expect(channel).toBe('any.one');
            } else {
                expect(channel).toBe('*.one');
            }
        }
        tree.add('any.one');
        tree.add('*.one');
        tree.remove('*.one');
        tree.traverse('any.one', cmd);

        expect(count).toBe(1);
    });

    it('traversing hitting two different topics with hash', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            if (count === 1) {
                expect(channel).toBe('any.any.any.one');
            } else if (count === 2) {
                expect(channel).toBe('#.one');
            }
        }
        tree.add('any.any.any.one');
        tree.add('#.one');
        tree.traverse('any.any.any.one', cmd);

        expect(count).toBe(2);
    });
    
    it('remove traversing hitting only one topics with hash', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            expect(channel).toBe('#.one');
        }
        tree.add('any.any.any.one');
        tree.add('#.one');
        tree.remove('any.any.any.one');
        tree.traverse('any.any.any.one', cmd);

        expect(count).toBe(1);
    });

    it('traversing fanning out.', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            if (count === 1) {
                expect(channel).toBe('any.*');
            } else if (count === 2) {
                expect(channel).toBe('any.one');
            }
        }
        tree.add('any.*');
        tree.add('any.one');
        tree.add('any.*.two');
        tree.traverse('any.one', cmd);

        expect(count).toBe(2);
    });
    
    it('removing when traversing fanning out.', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            if (count === 1) {
                expect(channel).toBe('any.*');
            } else if (count === 2) {
                expect(channel).toBe('any.one');
            }
        }
        tree.add('any.*');
        tree.add('any.one');
        tree.add('any.*.two');
        tree.remove('any.*.two');
        tree.traverse('any.one', cmd);

        expect(count).toBe(2);
    });

    it('traversing should not call any', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }

        tree.add('one.two.three');
        tree.add('one.two.four');
        tree.traverse('one.two', cmd);
        
        expect(count).toBe(0);
    });

    

    it('traversing should call once with shorten line', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }

        tree.add('one.two.three');
        tree.add('one.two.four');
        tree.add('one.two');
        tree.traverse('one.two', cmd);
        
        expect(count).toBe(1);
    });
    
    it('remove traversing should call once with shorten line', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }

        tree.add('one.two.three');
        tree.add('one.two.four');
        tree.add('one.two');
        tree.remove('one.two');
        tree.traverse('one.two.three', cmd);
        
        expect(count).toBe(1);
    });

    it('multiple nodes on tree', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }

        tree.add('*.orange.*');
        tree.add('*.*.rabbit');
        tree.add('lazy.#');

        tree.traverse('quick.orange.rabbit', cmd);

        expect(count).toBe(2);
    });


    it('multiple nodes on tree to both', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }

        tree.add('*.orange.*');
        tree.add('*.*.rabbit');
        tree.add('lazy.#');

        tree.traverse('lazy.orange.elephant', cmd);

        expect(count).toBe(2);
    });

    it('multiple nodes to one queue', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }

        tree.add('*.orange.*');
        tree.add('*.*.rabbit');
        tree.add('lazy.#');

        tree.traverse('quick.orange.fox', cmd);

        expect(count).toBe(1);
    });

    it('hash and star for traversing', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }

        tree.add('*.orange');
        tree.add('#.orange');
        tree.traverse('quick.orange', cmd);

        expect(count).toBe(2);

    });

    it('hash for one place', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
            expect(channel).toBe('#.one');
        }

        tree.add('#.one');
        tree.traverse('one', cmd);
        
        expect(count).toBe(1);
    });

    it('hash for two places', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }

        tree.add('#.test');
        tree.add('#.#.test');
        tree.traverse('test', cmd);

        expect(count).toBe(2);
    });
    
    it('complex hash for two places', () => {
        let count = 0;
        let cmd = (channel: string) => {
            count++;
        }

        tree.add('#.test');
        tree.add('#.#.test');
        tree.traverse('one.test', cmd);

        expect(count).toBe(2);
    });

    it('remove should throw error for no nodes', () => {
        expect(() => {
            tree.remove('*');
        }).toThrowError();
    });

    it('remove should throw error for not found with nodes', () => {
        
        tree.add('one');
        tree.add('one.two');
        tree.add('#');
        
        expect(() => {
            tree.remove('*');
        }).toThrowError();
    });

    it('remove should throw error for extra word', () => {
        tree.add('one');
        tree.add('two');

        expect(() => {
            tree.remove('one.three');
        }).toThrowError();
    });

    it('remove should throw error for extra word on branch', () => {
        tree.add('one.two');
        tree.add('one.three');

        expect(() => {
            tree.remove('one.three.four');
        }).toThrowError();
    });

    it('remove should throw for attempt on root tree', () => {
        tree.add('one.two');
        tree.add('one.three');

        expect(() => {
            tree.remove('one');
        }).toThrowError();
    });
    
    it('remove should throw for attempt on parent tree', () => {
        tree.add('one.two.three');
        tree.add('one.two.four');
        tree.add('one.two.five');
        tree.add('two.one');

        expect(() => {
            tree.remove('one.two');
        }).toThrowError();
    });

});

