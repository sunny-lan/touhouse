import {Listenable, Listener, Vec2, remove} from "./util";

export interface ICollideable<Tag> {
    hitbox: Hitbox
    tag: Tag
    hitBy?: Tag[]
}

export abstract class Hitbox {
    onCollision: Listener<ICollideable<any>>[] = []

    processCollision(collider: ICollideable<any>) {
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

export default class CollisionSystem<Tag> {
    private objects = new Map<Tag, ICollideable<Tag>[]>();

    constructor(groups: Tag[]) {
        for (const group of groups) {
            this.objects.set(group, [])
        }
    }

    add(object: ICollideable<Tag>) {
        this.objects.get(object.tag)!.push(object)
    }


    remove(object: ICollideable<Tag>) {
        remove(this.objects.get(object.tag)!, object)
    }


    checkAll() {
        for (const group of this.objects.values()) {
            for (const object of group) {
                if (!object.hitBy) continue;
                for (const tag of object.hitBy) {
                    for (const otherObject of this.objects.get(tag)!) {
                        if (checkCollision(object.hitbox, otherObject.hitbox)) {
                            object.hitbox.processCollision(otherObject)
                        }
                        
                    }
                }
            }
        }
    }
}