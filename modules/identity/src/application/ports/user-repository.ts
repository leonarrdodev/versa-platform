import type {
  User,
} from '../../domain/user/user.js';

export interface UserRepository {
  insert(user: User): Promise<void>;
}