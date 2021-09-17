import {Listenable, Listener, Vec2} from "./util";

export abstract class Hitbox {
    onCollision: Listener<Hitbox>[] = []

    processCollision(collider: Hitbox) {
        for (const cb of this.onCollision) {
            cb(collider)
        }
    }
}

export class CircleHitbox extends Hitbox {
    pos = new Listenable<Vec2>(new Vec2())
    radius: number = 1

    constructor(radius: number = 1) {
        super();
        this.radius = radius
    }
}

export function checkCollision(a: Hitbox, b: Hitbox) {
    if (a instanceof CircleHitbox && b instanceof CircleHitbox) {
        const rad = a.radius + b.radius;
        return a.pos.v.minus(b.pos.v).magSqr() <= rad * rad;
    }
    throw new Error("unsupported");
}

export default class CollisionSystem<T> {
    groups = new Map<T, Hitbox[]>();
    collideable: [T, T][]
    constructor(groups:T[],   collideable: [T, T][]=[]) {
        for (const group of groups) {
            this.groups.set(group,[])
        }
        this.collideable=collideable
    }


    checkAll() {
        for (const [src, dst] of this.collideable) {
            const a = this.groups.get(src)!, b = this.groups.get(dst)!;
            //TODO self collision not supported yet
            for (const hitbox1 of a) {
                for (const hitbox2 of b) {
                    if (checkCollision(hitbox1, hitbox2)) {
                        hitbox2.processCollision(hitbox1)
                        hitbox1.processCollision(hitbox2)
                    }
                }
            }
        }
    }
}