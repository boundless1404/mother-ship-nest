export enum TokenCreationPurpose {
  SIGN_UP = 'sign_up',
  RESET_PASSWORD = 'reset_password',
  ACCESS_TOKEN = 'access_token',
  INVITATION_TOKEN = 'invitation_token',
  SINGLE_SIGN_IN = 'single_sign_in',
}

export enum SignInTypeEnum {
  FULL_AUTH = 'full_auth',
  SINGLE_SIGN_IN = 'single_signin',
}

export enum EmailPriority {
  IMMEDIATE = 'immediate',
  REGULAR = 'regular',
  DELAYED = 'delayed',
}

export enum CacheNameEnum {
  EMAIL_JOB = 'email_job',
}
