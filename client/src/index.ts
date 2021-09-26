import * as PIXI from 'pixi.js';
import {Bullet, CollisionGroup, Entity, Player, World} from "@core";
import {assert, remove, Vec2} from "@core/util";
import CollisionSystem, {CircleHitbox} from "@core/CollisionSystem";
import TrajectoryManager, {StraightTrajectory} from "@core/TrajectoryManager";
import {Channel, Client, Message} from "@core/multiplayer";

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

    function initTrajectoryManager(w: World) {
        const orch = new TrajectoryManager(w)
        app.ticker.add(delta => orch.update(delta))
    }

    initTrajectoryManager(w)


    function inputLogic(w:World) {
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
                w.mainPlayer.v!.move(total, kbdState.get("Shift"))
            }
        });
    }

    inputLogic(w);


    w.mainPlayer.onChange.push(mainPlayer=>{
        assert(mainPlayer!==undefined)
        mainPlayer.hitbox.onCollision.push(x => {
            if (x instanceof Entity)
                console.log(`hit by ${x.id}`)
            mainPlayer.pos.set(new Vec2(100, 100))
        })
    })

    function initMulti(w:World, conn:Channel) {
        const client=new Client(conn, w)
    }
    function initMulti1(w:World) {

        const sck=new WebSocket('ws://localhost:8080')
        sck.addEventListener("open", function (){

            const client:Channel={
                onMessage: [],
                send(message: Message): void {
                    sck.send(JSON.stringify(message))
                }
            };
            sck.addEventListener('message',msg=>{
                const conv= JSON.parse(msg.data) as unknown as Message;
                for (const listener of client.onMessage) {
                    listener(conv)
                }
            })
            initMulti(w,client)
        })
    }
    initMulti1(w)

   // const bul = new Bullet()
   // bul.trajectory = new StraightTrajectory(10, new Vec2(), new Vec2(100, 100), 1)
  //  w.enemy_bullets.add(bul)

    // Handle window resizing
    window.addEventListener('resize', (e) => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    document.body.appendChild(app.view);
};

main();
