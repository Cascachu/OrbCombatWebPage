import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type Message = {
    username: string;
    text: string;
    timestamp: string;
};

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3000',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // socketId -> username
    private connectedUsers: Map<string, string> = new Map();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const username = this.connectedUsers.get(client.id);
        if (username) {
            this.connectedUsers.delete(client.id);

            // Only broadcast userLeft if this username has no other active sockets
            const stillConnected = Array.from(this.connectedUsers.values()).includes(username);
            if (!stillConnected) {
                this.server.emit('userLeft', { username });
            }

            this.server.emit('onlineUsers', this.getUniqueUsers());
        }
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    handleJoin(
        @MessageBody() username: string,
        @ConnectedSocket() client: Socket,
    ) {
        this.connectedUsers.set(client.id, username);

        // Only broadcast userJoined if this is their first active socket
        const socketsForUser = Array.from(this.connectedUsers.values()).filter(u => u === username);
        if (socketsForUser.length === 1) {
            this.server.emit('userJoined', { username });
        }

        this.server.emit('onlineUsers', this.getUniqueUsers());
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: Message) {
        this.server.emit('message', message);
    }

    private getUniqueUsers(): string[] {
        return [...new Set(this.connectedUsers.values())];
    }
}