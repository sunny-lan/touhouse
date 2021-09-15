import {Listenable, ListenableArray, Vec2} from "./util";


export class Bullet {
}

export class Player {
    pos = new Listenable<Vec2>(new Vec2())
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
    bullets = new ListenableArray<Bullet>()
    players = new ListenableArray<Player>()
    enemies = new ListenableArray<Enemy>()
}