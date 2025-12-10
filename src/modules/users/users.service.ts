import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      name,
      email,
      password: hashPassword,
    });

    try {
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      const dbError = error as { code: string };

      if (dbError.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.deleted_at IS NULL')
      .addSelect('user.password')
      .getOne();
  }

  async searchUsers(keyword: string): Promise<User[]> {
    console.log(keyword);
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.name LIKE :keyword OR user.email LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .andWhere('user.deleted_at IS NULL')
      .select(['user.id', 'user.name', 'user.email', 'user.avatar_url'])
      .take(10)
      .getMany();
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
