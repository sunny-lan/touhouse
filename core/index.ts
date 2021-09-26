import {assert, Listenable, ListenableArray, Listener, remove, Vec2} from "./util";
import {CircleHitbox, ICollideable, Hitbox} from "./CollisionSystem";
import {Trajectory} from "./TrajectoryManager";

export enum CollisionGroup {
    Player,
    Enemy,
    Bullet
}


export class Entity {
    world?: World
    id: number = 0
    onRemoved?: Listener<void>[]

    init(world: World) {
        this.world = world
    }

    addRemovedListener(l: Listener<void>) {
        if (!this.onRemoved)
            this.onRemoved = []
        this.onRemoved.push(l)
    }

}

export class Bullet extends Entity implements ICollideable<CollisionGroup> {
    tag = CollisionGroup.Bullet
    hitbox: Hitbox = new CircleHitbox(10)
    trajectory: Trajectory = new Trajectory()
}

export interface MoveableHitbox {
    pos: Listenable<Vec2>
}

export class Player extends Entity implements ICollideable<CollisionGroup> {
    tag = CollisionGroup.Player
    hitBy = [CollisionGroup.Bullet, CollisionGroup.Enemy]

    get pos() {
        return this.hitbox.pos
    }

    hitbox: MoveableHitbox & Hitbox = new CircleHitbox(10)
    normalSpeed = 1
    focusSpeed = 0.5

    init(world: World) {
        super.init(world);

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

export class Enemy extends Entity {

}

export class World {
    enemy_bullets = new ListenableArray<Bullet>()
    players = new ListenableArray<Player>()
    enemies = new ListenableArray<Enemy>()
    entities = new Map<number, Entity>()
    mainPlayer=new Listenable<Player|undefined>(undefined)

    constructor() {
        const bound=this.onObjectAdded.bind(this)
        this.enemy_bullets.onAdded.push(bound);
        this.players.onAdded.push(bound);
        this.enemies.onAdded.push(bound);
    }

    onObjectAdded(obj: Entity) {
        obj.init(this)
        if (this.entities.has(obj.id))
            throw new Error(`duplicate id ${obj.id}`)
        this.entities.set(obj.id, obj)
    }

    getByID<T extends Entity>(id: number): T {
        const res = this.entities.get(id)
        assert(res !== undefined)

        return res as unknown as T
    }
}