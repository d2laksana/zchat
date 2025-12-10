import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from '../dto/create-message.dto';
import { ChatService } from '../chat.service';
import { GroupsService } from 'src/modules/groups/groups.service';

interface AuthSocket extends Socket {
  data: {
    user: {
      email: string;
      sub: string;
      name: string;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private groupsService: GroupsService,
  ) {}

  async handleConnection(client: AuthSocket) {
    const token = client.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log(`Client ${client.id} rejected: No Token`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{
        email: string;
        sub: string;
        name: string;
      }>(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = payload;
      await client.join(`user-${payload.sub}`);

      const memberships = await this.groupsService.findUserGroups(payload.sub);
      for (const membership of memberships) {
        await client.join(`group-${membership.groupId}`);
      }
    } catch (error) {
      console.log(`Client ${client.id} rejected: ${error}`);
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: CreateMessageDto,
  ) {
    const sender = client.data.user;
    const receiverId = payload.receiverId;

    console.log(
      `Pesan dari ${sender.email} ke User ID ${receiverId}: ${payload.message}`,
    );

    const savedMessage = await this.chatService.saveMessage(
      sender.sub,
      payload,
    );

    const messageToSend = {
      senderId: sender.sub,
      senderEmail: sender.email,
      content: savedMessage.content,
      isGroupMessage: savedMessage.isGroupMessage,
      replyTo: savedMessage.replyTo,
      id: savedMessage['_id'],
      timestamp: savedMessage['createdAt'],
    };

    if (payload.isGroupMessage) {
      this.server
        .to(`group-${receiverId}`)
        .emit('receiveMessage', messageToSend);
    } else {
      this.server
        .to(`user-${receiverId}`)
        .emit('receiveMessage', messageToSend);
    }
  }

  handleDisconnect(client: AuthSocket) {
    console.log('Client disconnected: ', client.id);
  }
}
