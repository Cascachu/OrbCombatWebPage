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
import { UsersService } from '../users/users.service';

type Message = {
    username: string;
    text: string;
    timestamp: string;
    avatar?: string;
};

@WebSocketGateway({
    cors: {
        origin: true
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // socketId -> username
    private connectedUsers: Map<string, string> = new Map();

    constructor(private usersService: UsersService) {}

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

            this.getUniqueUsersWithAvatars().then(users => {
                this.server.emit('onlineUsers', users);
            });
        }
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    async handleJoin(
        @MessageBody() username: string,
        @ConnectedSocket() client: Socket,
    ) {
        this.connectedUsers.set(client.id, username);

        // Only broadcast userJoined if this is their first active socket
        const socketsForUser = Array.from(this.connectedUsers.values()).filter(u => u === username);
        if (socketsForUser.length === 1) {
            const user = await this.usersService.findByUsername(username);
            this.server.emit('userJoined', { username, avatar: user?.avatar || 'default.svg' });
        }

        this.server.emit('onlineUsers', await this.getUniqueUsersWithAvatars());
    }

    @SubscribeMessage('message')
    async handleMessage(@MessageBody() message: Message) {
        const user = await this.usersService.findByUsername(message.username);
        const fullMessage = {
            ...message,
            avatar: user?.avatar || 'default.svg',
        };
        this.server.emit('message', fullMessage);
    }

    private getUniqueUsers(): string[] {
        return [...new Set(this.connectedUsers.values())];
    }

    private async getUniqueUsersWithAvatars() {
        const uniqueUsernames = [...new Set(this.connectedUsers.values())];
        const usersWithAvatars = await Promise.all(
            uniqueUsernames.map(async (username) => {
                const user = await this.usersService.findByUsername(username);
                return { username, avatar: user?.avatar || 'default.svg' };
            }),
        );
        return usersWithAvatars;
    }
}