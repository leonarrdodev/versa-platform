import type {
  Session,
} from '../../domain/session/session.js';

export interface SessionRepository {
  insert(
    session: Session,
  ): Promise<void>;
}