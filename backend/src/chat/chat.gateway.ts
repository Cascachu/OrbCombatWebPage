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

    private connectedUsers: Map<string, string> = new Map(); // socketId -> username

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const username = this.connectedUsers.get(client.id);
        if (username) {
            this.connectedUsers.delete(client.id);
            this.server.emit('userLeft', { username });
            this.server.emit('onlineUsers', Array.from(this.connectedUsers.values()));
        }
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    handleJoin(
        @MessageBody() username: string,
        @ConnectedSocket() client: Socket,
    ) {
        this.connectedUsers.set(client.id, username);
        this.server.emit('userJoined', { username });
        this.server.emit('onlineUsers', Array.from(this.connectedUsers.values()));
    }

    @SubscribeMessage('message')
    handleMessage(
        @MessageBody() message: Message,
        @ConnectedSocket() client: Socket,
    ) {
        this.server.emit('message', message); // broadcast to all
    }
}