import * as PIXI from 'pixi.js';
import {Bullet, CollisionGroup, Player, World} from "@core/index";
import {remove, Vec2} from "@core/util";
import CollisionSystem, {CircleHitbox} from "@core/CollisionSystem";
import LevelOrchestrator, {StraightTrajectory} from "@core/LevelOrchestrator";


const main = async () => {
    const w = new World();
    // Actual app
    let app = new PIXI.Application();

    // Display application properly
    document.body.style.margin = '0';
    app.renderer.view.style.position = 'absolute';
    app.renderer.view.style.display = 'block';

    // View size = windows
    app.renderer.resize(window.innerWidth, window.innerHeight);

    const spriteMap = new Map<any, PIXI.DisplayObject>()

    function renderLogic(w: World) {
        w.enemy_bullets.onAdded.push(b => {
            if (b.hitbox instanceof CircleHitbox) {
                const gfx = new PIXI.Graphics();
                gfx.beginFill(0xff0000)
                gfx.drawCircle(0, 0, b.hitbox.radius);
                gfx.endFill()
                spriteMap.set(b, gfx);
                b.hitbox.pos.link(pos => gfx.position.set(pos.x, pos.y))
                app.stage.addChild(gfx);
            }
        });

        w.players.onAdded.push(p => {
            if (p.hitbox instanceof CircleHitbox) {
                const gfx = new PIXI.Graphics();
                gfx.beginFill(0x00ff00)
                gfx.drawCircle(0, 0, p.hitbox.radius);
                gfx.endFill()

                p.pos.link(pos => gfx.position.set(pos.x, pos.y))
                app.stage.addChild(gfx);
            }
        });

        function onRemoved(p: any) {
            const sprite = spriteMap.get(p);
            if (sprite) {
                app.stage.removeChild(sprite);
                spriteMap.delete(p)
            }
        }

        w.enemy_bullets.onRemoved.push(onRemoved)
        w.players.onRemoved.push(onRemoved)

    }

    renderLogic(w);

    const collisionSys = new CollisionSystem(Object.values(CollisionGroup))

    function initCollisionSys(w: World) {


        w.enemy_bullets.onAdded.push(collisionSys.add.bind(collisionSys));
        w.enemy_bullets.onRemoved.push(collisionSys.remove.bind(collisionSys));

        w.players.onAdded.push(collisionSys.add.bind(collisionSys));
        w.players.onRemoved.push(collisionSys.remove.bind(collisionSys));

        app.ticker.add(() => {
            collisionSys.checkAll()
        })
    }

    initCollisionSys(w);

    function initLevelOrchestrator(w: World) {
        const orch = new LevelOrchestrator(w)
        app.ticker.add(delta => orch.update(delta))
    }

    initLevelOrchestrator(w)


    const reimu = new Player();

    function inputLogic(reimu: Player) {
        const kbdState = new Map<string, boolean>();
        window.addEventListener("keydown", (event) => {
            kbdState.set(event.key, true);
            event.preventDefault();
        }, false);
        window.addEventListener("keyup", (event) => {
            kbdState.set(event.key, false);
            event.preventDefault();
        }, false);

        const directions = {
            "ArrowLeft": new Vec2(-1, 0),
            "ArrowRight": new Vec2(1, 0),
            "ArrowUp": new Vec2(0, -1),
            "ArrowDown": new Vec2(0, 1),
        };

        app.ticker.add(() => {
            let total = new Vec2()
            for (const [key, vec] of Object.entries(directions)) {
                if (kbdState.get(key)) {
                    total = total.plus(vec)
                }
            }
            if (!total.equals(Vec2.ZERO)) {
                reimu.move(total, kbdState.get("Shift"))
            }
        });
    }

    inputLogic(reimu);


    w.players.add(reimu)
    reimu.hitbox.onCollision.push(x => {
        reimu.pos.set(new Vec2(100, 100))
    })

    const bul = new Bullet()
    bul.trajectory = new StraightTrajectory(10, new Vec2(), new Vec2(100, 100), 1)
    w.enemy_bullets.add(bul)

    // Handle window resizing
    window.addEventListener('resize', (e) => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    document.body.appendChild(app.view);
};

main();
