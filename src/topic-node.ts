export class TopicNode {

    public children: TopicNode[]; 
    public count: number;

    constructor(public word: string) {
        this.children = [];
        this.count = 0;
    }
}


