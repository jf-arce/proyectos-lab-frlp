import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { hash } from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(
    email: string,
    hashedPassword: string,
    rol: UserRole,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager
      ? manager.getRepository(User)
      : this.userRepository;

    const user = repo.create({ email, password: hashedPassword, rol });
    return repo.save(user);
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }

  async update(
    id: string,
    data: { email?: string; password?: string },
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    const user = await repo.findOne({ where: { id } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (data.email) {
      user.email = data.email;
    }

    if (data.password) {
      user.password = await hash(data.password, BCRYPT_SALT_ROUNDS);
    }

    return repo.save(user);
  }
}
