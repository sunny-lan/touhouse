import {Listenable, ListenableArray, Listener, remove, Vec2} from "./util";
import {CircleHitbox, ICollideable, Hitbox} from "./CollisionSystem";

export enum CollisionGroup{
    Player,
    Enemy,
    Bullet
}

export class Trajectory {

}


export class Bullet implements ICollideable<CollisionGroup>{
    tag=CollisionGroup.Bullet
    hitbox: Hitbox = new CircleHitbox(10)
    trajectory: Trajectory = new Trajectory()
}

export interface MoveableHitbox {
    pos: Listenable<Vec2>
}

export class Player implements ICollideable<CollisionGroup>{
    tag=CollisionGroup.Player
    hits=[CollisionGroup.Bullet, CollisionGroup.Enemy]

    get pos() {
        return this.hitbox.pos
    }

    hitbox: MoveableHitbox & Hitbox = new CircleHitbox(10)
    normalSpeed = 1
    focusSpeed = 0.5

    constructor() {
        this.hitbox.onCollision.push(hitBy=>{
        })
    }

    move(dir: Vec2, focus: boolean = false) {
        this.pos.set(this.pos.v.plus(dir.norm().times(
            focus ? this.focusSpeed : this.normalSpeed)))
    }

    hitListeners: Listener<Bullet | Enemy>[] = []

    hit(object: Bullet | Enemy) {
        for (const hitListener of this.hitListeners) {
            hitListener(object)
        }
    }
}

export class Enemy {

}

export class World {
    enemy_bullets = new ListenableArray<Bullet>()
    players = new ListenableArray<Player>()
    enemies = new ListenableArray<Enemy>()

}