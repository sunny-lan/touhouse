import {WebSocketServer} from 'ws'
import {World} from "core";
import {Channel, Message, Server} from "core/multiplayer";
import {debugChannel} from "core/util";

const wss = new WebSocketServer({
    port: 8080
});

const w=new World()
const server=new Server(w)
wss.on('connection',sck=>{
    const client:Channel={
        onMessage: [],
        send(message: Message): void {
            sck.send(JSON.stringify(message))
        }
    };
    sck.on('message',msg=>{
        const conv=JSON.parse( msg.toString()) as unknown as Message;
        for (const listener of client.onMessage) {
            listener(conv)
        }
    })
    server.clientJoined(debugChannel(client))
})

