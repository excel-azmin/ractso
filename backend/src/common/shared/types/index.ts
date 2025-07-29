export type LoginUserInfo = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
};

export type VerifyOTPUserInfo = {
  email: string;
  firstName: string;
  lastName: string;
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
