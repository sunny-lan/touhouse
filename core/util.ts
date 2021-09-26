export type Listener<T> = (v: T) => void;

export function remove<T>(arr: T[], v: T) {
    const idx = arr.indexOf(v);
    if (idx === -1) throw new Error("Could not find element")
    arr.splice(idx)
}

export class Vec2 {
    static readonly ZERO = new Vec2()

    x: number
    y: number

    static directionVec(radians: number) {
        return new Vec2(Math.cos(radians), Math.sin(radians))
    }

    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    equals(v: Vec2): boolean {
        return this.x === v.x && this.y === v.y
    }

    times(v: number): Vec2 {
        return new Vec2(this.x * v, this.y * v)
    }

    div(v: number): Vec2 {
        return new Vec2(this.x / v, this.y / v)
    }

    minus(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y)
    }

    plus(v: Vec2): Vec2 {
        return new Vec2(this.x + v.x, this.y + v.y)
    }

    norm(): Vec2 {
        return this.div(this.mag())
    }

    dot(v: Vec2): number {
        return this.x * v.x + this.y * v.y;
    }

    magSqr(): number {
        return this.dot(this)
    }

    mag(): number {
        return Math.sqrt(this.magSqr())
    }
}

export class Listenable<T> {
    v: T
    onChange: Listener<T>[] = []

    constructor(initial: T) {
        this.v = initial
    }

    set(v: T) {
        this.v = v;
        for (const listener of this.onChange) {
            listener(v);
        }
    }

    link(l: Listener<T>) {
        l(this.v);
        this.onChange.push(l)
    }
}

interface Removable{
    onRemoved?:Listener<void>[]
}

export class ListenableArray<T extends Removable>  {

    v: T[]
    onAdded: Listener<T>[] = []
    onRemoved: Listener<T>[] = []

    constructor(initial: T[] = []) {
        this.v = initial
    }

    add(v: T) {
        this.v.push(v)
        for (const cb of this.onAdded) {
            cb(v);
        }
    }


    remove(v: T) {
        this.v.splice(this.v.indexOf(v))

        if(v.onRemoved){
            for (const listener of v.onRemoved)
                listener();
        }

        for (const cb of this.onRemoved) {
            cb(v);
        }
    }
}

export interface IChannel<T> {
    onMessage: Listener<T>[]

    send(message: T): void
}

export function assert(v: boolean, msg: string = 'assert failed'): asserts v{
    if (!v) throw new Error(msg)
}