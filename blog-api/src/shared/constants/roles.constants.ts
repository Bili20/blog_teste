export const ROLE_ADMIN = "admin";
export const ROLE_AUTHOR = "author";

export const SYSTEM_ROLE_NAMES = [ROLE_ADMIN, ROLE_AUTHOR] as const;

export type SystemRoleName = (typeof SYSTEM_ROLE_NAMES)[number];
