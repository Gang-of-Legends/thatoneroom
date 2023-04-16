export interface ServerObject {
    id: string,
    type: string,
    x: number,
    y: number,
    item: number,
    inventory: Item[],
}

export interface Item {
    type: string,
    count: number,
}
