import {Listenable, ListenableArray, remove, Vec2} from "./util";
import CollisionSystem, {CircleHitbox} from "./CollisionSystem";


export class Bullet {
    hitbox = new CircleHitbox(10)

}

export class Player {
    get pos() {
        return this.hitbox.pos
    }

    hitbox = new CircleHitbox(10)
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

    collisionSys = new CollisionSystem([
        'enemy_bullet', 'player',
        'player_bullet', 'enemy'
    ], [
        ['enemy_bullet', 'player'],
        ['player_bullet', 'enemy'],
        ['player', 'enemy'],
    ])

    initCollisionSys() {
        const enemy_bullet = this.collisionSys.groups.get('enemy_bullet')!
        const player = this.collisionSys.groups.get('player')!

        this.enemy_bullets.onAdded.push(x =>
            enemy_bullet.push(x.hitbox));
        this.enemy_bullets.onRemoved.push(x =>
            remove(enemy_bullet, x.hitbox));

        this.players.onAdded.push(x =>
            player.push(x.hitbox));
        this.enemy_bullets.onRemoved.push(x =>
            remove(player, x.hitbox));
    }

    constructor() {
        this.initCollisionSys()
    }
}