import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async saveMessage(senderId: string, creaeteMessageDto: CreateMessageDto) {
    const newMessage = new this.messageModel({
      senderId: senderId,
      receiverId: creaeteMessageDto.receiverId,
      content: creaeteMessageDto.message,
      replyTo: creaeteMessageDto.replyTo,
      isGroupMessage: creaeteMessageDto.isGroupMessage,
    });

    return newMessage.save();
  }

  async getConversation(userId1: string, userId2: string) {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async searchMessage(userId: string, friendId: string, keyword: string) {
    return this.messageModel.find({
      $and: [
        {
          $or: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },
          ],
        },
        { $text: { $search: keyword } },
      ],
    });
  }
}
