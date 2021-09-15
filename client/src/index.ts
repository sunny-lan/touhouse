import * as PIXI from 'pixi.js';
import {Player, World} from "@core/index";
import {Vec2} from "@core/util";

const load = (app: PIXI.Application) => {
    return new Promise((resolve) => {
        app.loader.add('assets/reimu_tmp.png').load(() => {
            resolve();
        });
    });
};

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
    // Load assets
    await load(app);

    const spriteMap = new Map<any, PIXI.Sprite>()

    function renderLogic() {

        w.players.onAdded.push(p => {

            const sprite = new PIXI.Sprite(
                app.loader.resources['assets/reimu_tmp.png'].texture
            );

            spriteMap.set(p, sprite);

            p.pos.onChange.push(pos => sprite.position.set(pos.x, pos.y))
            app.stage.addChild(sprite);
        });

        w.players.onRemoved.push(p => {
            const sprite = spriteMap.get(p)!;
            app.stage.removeChild(sprite);
            spriteMap.delete(p)
        })
    }

    renderLogic();

    const reimu = new Player();

    function inputLogic() {
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
    inputLogic();

    w.players.add(reimu)

    // Handle window resizing
    window.addEventListener('resize', (e) => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    document.body.appendChild(app.view);
};

main();
