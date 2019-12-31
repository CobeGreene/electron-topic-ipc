import { TopicNode } from './topic-node';

export class TopicTree {

    private root: TopicNode;

    constructor(private delimiter: string, private star: string = '*', private hash: string = '#', public throwOnRemove: boolean = true) {
        this.root = new TopicNode('');
    }

    add(topic: string) {
        let words = this.getWords(topic);

        let currentNode = this.root;

        while (words.length > 0) {
            let currentWord = words[0];
            const child = currentNode.children.find((node) => {
                return node.word === currentWord;
            });

            if (child) {
                currentNode = child;
            } else {
                let newNode = new TopicNode(currentWord);
                currentNode.children.push(newNode);
                currentNode = newNode;
            }
            words.splice(0, 1);

            ++currentNode.count;

        }
        ++this.root.count;
    }

    remove(topic: string) {
        let words = this.getWords(topic);

        let currentWord = words[0];
        
        const childIndex = this.root.children.findIndex((node) => {
            return node.word === currentWord;
        });

        if (childIndex >= 0) {
            this.removeRecursion(this.root, childIndex, words.slice(1));
        } else {
            this.removeThrowNotFound();
        }
    }

    removeAll(topic: string) {
        let words = this.getWords(topic);
        let currentWord = words[0];

        const childIndex = this.root.children.findIndex((node) => {
            return node.word === currentWord;
        });

        if (childIndex >= 0) {
            this.removeAllRecursion(this.root, childIndex, words.slice(1));
        } else {
            this.removeThrowNotFound();
        }
    }

    private removeAllRecursion(parent: TopicNode, childIndex: number, words: string[]): number {
        const child = parent.children[childIndex];
        if (words.length === 0) {
            if (child.count > child.children.length) {
                const amount = child.count - child.children.length;
                child.count -= amount;
                if (child.count === 0) {
                    parent.children.splice(childIndex, 1);
                }
                parent.count -= amount;
                return amount;
            } 
        } else {
            const nextIndex = child.children.findIndex((node) => {
                return node.word === words[0];
            });
            if (nextIndex >= 0) {
                const amount = this.removeAllRecursion(child, nextIndex, words.slice(1));
                if (child.count === 0) {
                    parent.children.splice(childIndex, 1);
                }
                parent.count -= amount;
                return amount;
            }
        }
        this.removeThrowNotFound();
        return 0;
    }

    private removeThrowNotFound() {
        if (this.throwOnRemove) {
            throw new Error(`Couldn't find topic.`);
        }
    }

    private removeRecursion(parent: TopicNode, childIndex: number, words: string[]) {
        const child = parent.children[childIndex];
        
        if (words.length === 0) {
            if (child.count > child.children.length) {
                --child.count;
                if (child.count === 0) {
                    parent.children.splice(childIndex, 1);
                }
                --parent.count;
                return;
            }
        } else {
            const nextIndex = child.children.findIndex((node) => {
                return node.word === words[0];
            });
            if (nextIndex >= 0) {
                this.removeRecursion(child, nextIndex, words.slice(1));
                if (child.count === 0) {
                    parent.children.splice(childIndex, 1);
                }
                --parent.count;
                return;
            } 
        }
        this.removeThrowNotFound();
    }


    traverse(topic: string, cmd: (channel: string) => void) {
        let words = this.validTraverseWords(this.getWords(topic));

        let currentWord = words[0];
        this.root.children.forEach((node) => {
            if (this.isMatch(currentWord, node)) {
                this.traverseRecusive(`${node.word}`, node.word === this.hash ? words: words.slice(1), node, cmd);
            }
        });
    }

    private traverseRecusive(prefix: string, words: string[], parent: TopicNode, cmd: (channel: string) => void) {
        if (parent.children.length === 0 && words.length === 0) {
            cmd(prefix);
        } else if (parent.children.length === 0 && words.length > 0 && parent.word === this.hash) {
            cmd(prefix);
        } else if (parent.children.length > 0 && words.length === 0 && parent.count > parent.children.length) {
            cmd(prefix);
        } else if (parent.children.length > 0 && words.length > 0) {
            let currentWord = words[0];
            parent.children.forEach((child) => {
                if (this.isMatch(currentWord, child)) {
                    this.traverseRecusive(`${prefix}${this.delimiter}${child.word}`, child.word === this.hash ? words: words.slice(1), child, cmd);
                } else if (parent.word === this.hash) {
                    let rest = words.slice(1);
                    while (rest.length > 0) {
                        let current = rest[0];
                        if (this.isMatch(current, child)) {
                            this.traverseRecusive(`${prefix}${this.delimiter}${child.word}`, rest.slice(1), child, cmd);
                            break;
                        } else {
                            rest = rest.slice(1);
                        }
                    }
                }
            });
        }
    }

    private validTraverseWords(words: string[]): string[] {
        words.forEach(word => {
            if (word === this.star || word === this.hash) {
                throw new Error(`Traverse can't contain any wildcards ('${this.star}}' or '${this.hash}').`);
            }
        });
        return words;
    }

    private isMatch(value: string, node: TopicNode): boolean {
        return node.word === value || node.word === this.hash || node.word === this.star;
    }



    private getWords(topic: string): string[] {
        if (topic.length < 1) {
            throw new Error(`Topic must be greater than zero`);
        }
        let words = topic.split(this.delimiter);

        if (words.length < 1) {
            throw new Error(`Topic must contain at least one word.`);
        }

        const find = words.findIndex((word) => {
            return word.length === 0;
        })

        if (find >= 0) {
            throw new Error(`Topic must not contain any empty words`);
        }
        return words;
    }
}