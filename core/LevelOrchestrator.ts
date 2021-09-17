import {Bullet, MoveableHitbox, World} from "./index";
import {Vec2} from "./util";
import {CircleHitbox} from "./CollisionSystem";

export interface DeterministicTrajectory {

}

export class StraightTrajectory {
    startTime: number
    startPoint: Vec2
    endPoint: Vec2

    speed: number

    constructor(stt: number, st: Vec2, ed: Vec2, spd: number) {
        this.startTime = stt
        this.startPoint = st
        this.endPoint = ed
        this.speed = spd
    }
}

export default class LevelOrchestrator {
    world: World
    globalTime: number = 0

    constructor(world: World) {
        this.world = world
    }

    update(delta: number) {

        this.globalTime += delta
        for (const bullet of this.world.enemy_bullets.v) {
            const traj = bullet.trajectory
            if (traj instanceof StraightTrajectory) {
                const tdiff =  this.globalTime-traj.startTime
                if (tdiff > 0) {
                    const posDiff = traj.endPoint.minus(traj.startPoint)
                    const dir = posDiff.norm()
                    const offset = dir.times(tdiff)

                    //if we have already reached the end of the trajectory
                    if (offset.magSqr() > posDiff.magSqr()) {
                        this.world.enemy_bullets.remove(bullet)
                        continue;
                    }

                    const pos = traj.startPoint.plus(offset)
                    const hitbox = bullet.hitbox as unknown as MoveableHitbox;
                    hitbox.pos.set(pos)
                }
            }
        }
    }
}