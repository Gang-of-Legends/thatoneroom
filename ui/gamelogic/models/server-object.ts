export interface ServerObject {
    id: string,
    type: string,
    x: number,
    y: number,
    item: number,
    inventory: Item[],
    color: number,
}

export interface Item {
    type: string,
    count: number,
}
