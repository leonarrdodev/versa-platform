import type {
  PasswordCredential,
} from '../../domain/credential/password-credential.js';

export interface PasswordCredentialRepository {
  insert(
    credential:
      PasswordCredential,
  ): Promise<void>;
}