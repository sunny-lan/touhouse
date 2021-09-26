import {Bullet, MoveableHitbox, World} from "./index";
import {Listenable, Vec2} from "./util";
import { Hitbox} from "./CollisionSystem";

export class Trajectory {
     init(bullet:Bullet):void{}
}

export abstract class DeterministicTrajectory extends Trajectory{
    abstract setTime(time: number): void
}

interface StandardBullet {
    hitbox: Hitbox & {
        pos: Listenable<Vec2>
    }
}

export class StraightTrajectory extends DeterministicTrajectory {
    startTime: number
    startPoint: Vec2
    endPoint: Vec2

    speed: number
    bullet?: StandardBullet;


    constructor(stt: number, st: Vec2, ed: Vec2, spd: number) {
        super();
        this.startTime = stt
        this.startPoint = st
        this.endPoint = ed
        this.speed = spd
    }

    init( bul:Bullet) {
        this.bullet = bul as unknown as StandardBullet
        if(!(this.bullet.hitbox.pos instanceof Listenable))
            throw new Error("StraightTrajectory expects hitbox to have position");
    }

    setTime(time: number): void {
        const traj = this;
        const tdiff = time - traj.startTime
        const posDiff = traj.endPoint.minus(traj.startPoint)
        const dir = posDiff.norm()
        const offset = dir.times(tdiff)

        const pos = traj.startPoint.plus(offset)
        const hitbox = this.bullet!.hitbox ;
        hitbox.pos.set(pos)
    }
}

export default class TrajectoryManager {
    world: World
    globalTime: number = 0

    constructor(world: World) {
        this.world = world
        world.enemy_bullets.onAdded.push(bullet=>{
            bullet.trajectory.init(bullet)
        })
    }

    update(delta: number) {
        this.globalTime += delta
        for (const bullet of this.world.enemy_bullets.v) {
            const traj = bullet.trajectory
            if(traj instanceof DeterministicTrajectory){
                traj.setTime(this.globalTime)
            }
        }
    }
}