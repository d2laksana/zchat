import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, index: true })
  senderId: string;

  @Prop({ required: true, index: true })
  receiverId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Message',
    required: false,
    default: null,
  })
  replyTo: Types.ObjectId;

  @Prop({ default: false })
  isDeletedEverywhere: boolean;

  @Prop({ type: [String], default: [] })
  deletedFor: string[];

  @Prop({ default: false })
  isGroupMessage: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, createdAt: -1 });
MessageSchema.index({ content: 'text' });
