import {Player, World} from "../index";
import {assert, IChannel, remove, Vec2} from "../util";

export enum MessageKind {
    PlayerUpdate,
    PlayerAdded,
    YourPlayer,
}

export interface AnyMessage {
    kind: MessageKind
}

export interface ObjectMessage extends AnyMessage {
    objectID: number
}

export interface PlayerUpdate extends ObjectMessage {
    kind: MessageKind.PlayerUpdate
    pos: number[]
}

export interface PlayerAdded extends ObjectMessage {
    kind: MessageKind.PlayerAdded
}

export interface YourPlayer extends ObjectMessage {
    kind: MessageKind.YourPlayer
}

export type Message = PlayerUpdate | PlayerAdded | YourPlayer;

export type Channel = IChannel<Message>;

export class Client {

    constructor(server: Channel, w: World) {
        w.mainPlayer.link(p => {
            if (p === undefined) return;

            p.pos.link(onPosChange)

            function onPosChange(pos: Vec2) {
                server.send({
                    kind: MessageKind.PlayerUpdate,
                    objectID: p!.id,
                    pos: [pos.x, pos.y]
                })
            }
        })
        server.onMessage.push(msg => {
            switch (msg.kind) {
                case MessageKind.PlayerAdded: {
                    const p = new Player()
                    p.id = msg.objectID
                    w.players.add(p)
                    break
                }
                case MessageKind.PlayerUpdate: {
                    const p = w.getByID<Player>(msg.objectID)
                    p.hitbox.pos.set(new Vec2(...msg.pos))
                    break
                }
                case MessageKind.YourPlayer: {
                    w.mainPlayer.set(w.getByID<Player>(msg.objectID))
                    break
                }
                default:
                    assert(false, "unknown msg kind")
            }
        })
    }
}

export class Server {
    clients: Channel[] = []
    nextPlayerID = -1
    private world: World;
    clientByPlayer = new Map<Player, Channel>()

    constructor(w: World) {
        this.world = w
        w.players.onAdded.push(player => {
            this.broadcast({
                kind: MessageKind.PlayerAdded,
                objectID: player.id
            })

            const posChange = (newPos: Vec2) => {
                this.broadcast({
                    kind: MessageKind.PlayerUpdate,
                    pos: [newPos.x, newPos.y],
                    objectID: player.id
                }, this.clientByPlayer.get(player)!)
            }
            player.pos.link(posChange)
            player.addRemovedListener(() => remove(player.pos.onChange, posChange))
        })
    }

    broadcast(msg: Message, exclude?: Channel) {
        for (const client of this.clients) {
            if (exclude === client) continue;
            client.send(msg)
        }
    }

    clientJoined(client: Channel) {
        this.clients.push(client)
        client.onMessage.push(msg => this.receiveMessage(msg, client))


        //send old objects
        for (const player of this.world.players.v) {
            client.send({
                kind: MessageKind.PlayerAdded,
                objectID: player.id
            })
            client.send({
                kind: MessageKind.PlayerUpdate,
                objectID: player.id,
                pos: [player.pos.v.x, player.pos.v.y]
            })
        }

        //generate new player for this guy
        const p = new Player();
        p.id = this.nextPlayerID--;
        this.clientByPlayer.set(p, client)
        this.world.players.add(p);

        client.send({
            kind: MessageKind.YourPlayer,
            objectID: p.id  
        })

        client.onDisconnect.push(() => {
            remove(this.clients, client)
            this.world.players.remove(p)
        })
    }


    receiveMessage(message: Message, clientFrom: Channel) {
        switch (message.kind) {
            case MessageKind.PlayerUpdate:
                const obj = this.world.entities.get(message.objectID)
                assert(obj instanceof Player);
                obj.hitbox.pos.set(new Vec2(...message.pos))
                break;
            default:
                throw new Error("Unknown message kind")
        }
    }
}