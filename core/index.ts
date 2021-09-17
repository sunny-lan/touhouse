import {Listenable, ListenableArray, remove, Vec2} from "./util";
import  {CircleHitbox, Hitbox} from "./CollisionSystem";

export class Trajectory {

}


export class Bullet {
    hitbox: Hitbox = new CircleHitbox(10)
    trajectory: Trajectory = new Trajectory()
}

export interface MoveableHitbox {
    pos: Listenable<Vec2>
}

export class Player {
    get pos() {
        return this.hitbox.pos
    }

    hitbox: MoveableHitbox & Hitbox = new CircleHitbox(10)
    normalSpeed = 1
    focusSpeed = 0.5

    move(dir: Vec2, focus: boolean = false) {
        this.pos.set(this.pos.v.plus(dir.norm().times(
            focus ? this.focusSpeed : this.normalSpeed)))
    }
}

export class Enemy {

}

export class World {
    enemy_bullets = new ListenableArray<Bullet>()
    players = new ListenableArray<Player>()
    enemies = new ListenableArray<Enemy>()

}