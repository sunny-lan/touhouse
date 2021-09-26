import {WebSocketServer} from 'ws'
import {World} from "@core";
import {Channel, Message, Server} from "../core/multiplayer";

const wss = new WebSocketServer({
    port: 8080
});

const w=new World()
const server=new Server(w)
wss.on('connection',sck=>{
    const client:Channel={
        onMessage: [],
        send(message: Message): void {
            sck.send(message)
        }
    };
    sck.on('message',msg=>{
        const conv= msg as unknown as Message;
        for (const listener of client.onMessage) {
            listener(conv)
        }
    })
    server.clientJoined(client)
})

