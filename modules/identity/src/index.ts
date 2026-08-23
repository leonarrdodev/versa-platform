export {
  parseUserId,
  type UserId,
} from './domain/identifiers/user-id.js';

export {
  parseTenantId,
  type TenantId,
} from './domain/identifiers/tenant-id.js';

export {
  Email,
} from './domain/user/email.js';

export {
  DisplayName,
} from './domain/user/display-name.js';

export {
  User,
  type CreateUserInput,
  type UserCreationDependencies,
} from './domain/user/user.js';

export {
  INITIAL_USER_STATUS,
  isUserStatus,
  USER_STATUSES,
  type UserStatus,
} from './domain/user/user-status.js';

export {
  TenantName,
} from './domain/tenant/tenant-name.js';

export {
  Tenant,
  type CreateTenantInput,
  type TenantCreationDependencies,
} from './domain/tenant/tenant.js';

export {
  INITIAL_TENANT_STATUS,
  isTenantStatus,
  TENANT_STATUSES,
  type TenantStatus,
} from './domain/tenant/tenant-status.js';

export {
  isMembershipRole,
  MEMBERSHIP_ROLES,
  type MembershipRole,
} from './domain/membership/membership-role.js';

export {
  INITIAL_MEMBERSHIP_STATUS,
  isMembershipStatus,
  MEMBERSHIP_STATUSES,
  type MembershipStatus,
} from './domain/membership/membership-status.js';

export {
  TenantMembership,
  type CreateTenantMembershipInput,
  type TenantMembershipCreationDependencies,
} from './domain/membership/tenant-membership.js';

export type {
  UserRepository,
} from './application/ports/user-repository.js';

export type {
  TenantRepository,
} from './application/ports/tenant-repository.js';

export type {
  TenantMembershipRepository,
} from './application/ports/tenant-membership-repository.js';

export type {
  IdentityTransaction,
  IdentityUnitOfWork,
} from './application/ports/identity-unit-of-work.js';

export {
  UserEmailAlreadyExistsError,
} from './domain/user/user-email-already-exists-error.js';

export {
  PostgresUserRepository,
} from './infrastructure/postgres/postgres-user-repository.js';

export {
  PostgresTenantRepository,
} from './infrastructure/postgres/postgres-tenant-repository.js';

export {
  PostgresTenantMembershipRepository,
} from './infrastructure/postgres/postgres-tenant-membership-repository.js';

export {
  PostgresIdentityUnitOfWork,
} from './infrastructure/postgres/postgres-identity-unit-of-work.js';

export type {
  RegisterOwnerCommand,
} from './application/register-owner/register-owner-command.js';

export {
  RegisterOwnerHandler,
  type RegisterOwnerHandlerDependencies,
} from './application/register-owner/register-owner-handler.js';

export type {
  RegisterOwnerResult,
} from './application/register-owner/register-owner-result.js'

export type {
  PasswordHasher,
} from './application/ports/password-hasher.js';

export type {
  PasswordCredentialRepository,
} from './application/ports/password-credential-repository.js';

export {
  PasswordHash,
} from './domain/credential/password-hash.js';

export {
  PasswordCredential,
  type CreatePasswordCredentialInput,
  type PasswordCredentialCreationDependencies,
} from './domain/credential/password-credential.js';

export {
  PostgresPasswordCredentialRepository,
} from './infrastructure/postgres/postgres-password-credential-repository.js';

export {
  PasswordSecret,
} from './domain/credential/password-secret.js';

export {
  Argon2PasswordHasher,
} from './infrastructure/security/argon2-password-hasher.js';

export type {
  AuthenticationIdentity,
  AuthenticationMembership,
} from './application/authentication/authentication-identity.js';

export type {
  AuthenticationRepository,
} from './application/ports/authentication-repository.js';

export {
  PostgresAuthenticationRepository,
} from './infrastructure/postgres/postgres-authentication-repository.js';

export {
  InvalidCredentialsError,
} from './application/authentication/invalid-credentials-error.js';

export type {
  LoginCommand,
} from './application/authentication/login-command.js';

export {
  LoginHandler,
  type LoginHandlerDependencies,
} from './application/authentication/login-handler.js';

export type {
  LoginMembershipResult,
  LoginResult,
} from './application/authentication/login-result.js';

export {
  parseSessionId,
  type SessionId,
} from './domain/identifiers/session-id.js';

export {
  SessionTokenHash,
} from './domain/session/session-token-hash.js';

export {
  Session,
  type CreateSessionInput,
  type SessionCreationDependencies,
} from './domain/session/session.js';

export type {
  SessionRepository,
} from './application/ports/session-repository.js';

export type {
  SessionTokenGenerator,
} from './application/ports/session-token-generator.js';

export type {
  SessionTokenHasher,
} from './application/ports/session-token-hasher.js';

export type {
  CreateSessionCommand,
} from './application/session/create-session-command.js';

export {
  CreateSessionHandler,
  type CreateSessionHandlerDependencies,
} from './application/session/create-session-handler.js';

export type {
  CreateSessionResult,
} from './application/session/create-session-result.js';

export {
  CryptoSessionTokenGenerator,
} from './infrastructure/security/crypto-session-token-generator.js';

export {
  Sha256SessionTokenHasher,
} from './infrastructure/security/sha256-session-token-hasher.js';

export {
  PostgresSessionRepository,
} from './infrastructure/postgres/postgres-session-repository.js';

export {
  SignInHandler,
  type SignInHandlerDependencies,
} from './application/authentication/sign-in-handler.js';

export type {
  SignInMembershipResult,
  SignInResult,
} from './application/authentication/sign-in-result.js';

export type {
  SessionAuthenticationRepository,
} from './application/ports/session-authentication-repository.js';

export type {
  SessionAuthentication,
} from './application/session/session-authentication.js';

export {
  InvalidSessionError,
} from './application/session/invalid-session-error.js';

export {
  ResolveSessionHandler,
  type ResolveSessionHandlerDependencies,
} from './application/session/resolve-session-handler.js';

export type {
  ResolveSessionResult,
} from './application/session/resolve-session-result.js';

export {
  PostgresSessionAuthenticationRepository,
} from './infrastructure/postgres/postgres-session-authentication-repository.js';

export type {
  SessionRevocationRepository,
} from './application/ports/session-revocation-repository.js';

export {
  RevokeSessionHandler,
  type RevokeSessionHandlerDependencies,
} from './application/session/revoke-session-handler.js';

export {
  PostgresSessionRevocationRepository,
} from './infrastructure/postgres/postgres-session-revocation-repository.js';