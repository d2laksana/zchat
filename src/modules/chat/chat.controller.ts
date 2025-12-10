import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getConversationHistory(
    @Request()
    req: RequestWithUser,
    @Query('friendId') friendId: string,
  ) {
    const userId = req.user.id;
    return this.chatService.getConversation(userId, friendId);
  }
}
