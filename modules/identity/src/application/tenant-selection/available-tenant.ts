import type {
  MembershipRole,
} from '../../domain/membership/membership-role.js';

export interface AvailableTenant {
  readonly id:
    string;

  readonly name:
    string;

  readonly role:
    MembershipRole;
}