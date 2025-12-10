import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Repository } from 'typeorm';
import { GroupMember, GroupRole } from './entities/group-member.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: string) {
    const group = this.groupsRepository.create({
      name: createGroupDto.name,
      description: createGroupDto.description,
    });

    const savedGroup = await this.groupsRepository.save(group);

    const membersToSave = [
      this.groupMemberRepository.create({
        groupId: savedGroup.id,
        userId: userId,
        role: GroupRole.OWNER,
      }),
    ];

    createGroupDto.memberIds.forEach((memberId) => {
      membersToSave.push(
        this.groupMemberRepository.create({
          groupId: savedGroup.id,
          userId: memberId,
          role: GroupRole.MEMBER,
        }),
      );
    });

    await this.groupMemberRepository.save(membersToSave);

    return savedGroup;
  }

  async findUserGroups(userId: string) {
    return this.groupMemberRepository.find({
      where: { userId: userId },
      relations: ['group'],
    });
  }

  async joinGroup(groupId: string, userId: string) {
    const existing = await this.groupMemberRepository.findOne({
      where: { groupId: groupId, userId: userId },
    });
    if (existing) return existing;

    const member = this.groupMemberRepository.create({
      groupId: groupId,
      userId: userId,
      role: GroupRole.MEMBER,
    });

    return this.groupMemberRepository.save(member);
  }

  findAll() {
    return `This action returns all groups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} group`;
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }
}
