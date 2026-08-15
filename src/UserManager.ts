import { connection } from "websocket";
import type { OutgoingMessage } from "./messages/outgoingMessages.js";

interface User {
    id: string,
    name: string,
    conn: connection
}

interface Room {
    users: User[]
}


export class UserManager {
    private rooms : Map<string, Room>;
    constructor () {
        this.rooms = new Map<string, Room>()
    }

    addUser(name: string, userId: string, roomId: string, socket: connection) {
        if (!this.rooms.get(roomId)) {
            this.rooms.set(roomId, {
                users: []
            })
        }
        this.rooms.get(roomId)?.users.push({
            id: userId,
            name,
            conn: socket
        }) 
    }

    removeUser(userId: string, roomId: string) {
        console.log("removed user");

        const room = this.rooms.get(roomId);
        if (room) {
            room.users = room.users.filter(({ id }) => id !== userId);
        }
    }

    getUser(roomId: string, userId: string): User | null {
        const user = this.rooms.get(roomId)?.users.find(({id}) => id === userId);
        return user ?? null;
    }

    broadcast(roomId: string, userId: string, message: OutgoingMessage) {
        const user = this.getUser(roomId, userId);
        if (!user) {
            console.error("User not found");
            return;
        }

        const room = this.rooms.get(roomId);
        if (!room) {
            console.error("Room not found");
            return;
        }

        room.users.forEach(({conn}) => {
            conn.sendUTF(JSON.stringify(message));
        })
    }
}