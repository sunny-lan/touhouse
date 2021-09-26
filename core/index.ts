import {Listenable, ListenableArray, Listener, remove, Vec2} from "./util";
import {CircleHitbox, ICollideable, Hitbox} from "./CollisionSystem";
import {Trajectory} from "./TrajectoryManager";

export enum CollisionGroup{
    Player,
    Enemy,
    Bullet
}


export class Entity{
    world?:World
    index:number=-1
    init(world:World){
        this.world=world
    }
}

export class Bullet extends Entity implements ICollideable<CollisionGroup> {
    tag=CollisionGroup.Bullet
    hitbox: Hitbox = new CircleHitbox(10)
    trajectory: Trajectory = new Trajectory()
}

export interface MoveableHitbox {
    pos: Listenable<Vec2>
}

export class Player extends Entity implements ICollideable<CollisionGroup>{
    tag=CollisionGroup.Player
    hitBy=[CollisionGroup.Bullet, CollisionGroup.Enemy]

    get pos() {
        return this.hitbox.pos
    }

    hitbox: MoveableHitbox & Hitbox = new CircleHitbox(10)
    normalSpeed = 1
    focusSpeed = 0.5

    init(world: World) {
        super.init(world);

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

export class Enemy extends Entity{

}

export class World {
    enemy_bullets = new ListenableArray<Bullet>()
    players = new ListenableArray<Player>()
    enemies = new ListenableArray<Enemy>()

    constructor() {
        this.enemy_bullets.onAdded.push(this.onObjectAdded);
        this.players.onAdded.push(this.onObjectAdded);
        this.enemies.onAdded.push(this.onObjectAdded);
    }

    onObjectAdded(obj:Entity){
        obj.init(this)
    }
}