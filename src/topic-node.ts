export class TopicNode {

    public children: TopicNode[]; 
    public count: number;

    constructor(public word: string) {
        this.children = [];
        this.count = 0;
    }

    isATopicChannel(): boolean {
        const sum = this.children.map((value) => value.count)
            .reduce((sum, current) => sum + current, 0);
        return this.count > sum;
    }
}


