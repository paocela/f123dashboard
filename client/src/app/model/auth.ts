import { User } from "@genezio-sdk/f123dashboard";

export type RegisterRequest = {
  username: string;
  name: string;
  surname: string;
  password: string;
  mail: string;
  image: string;
}

export type UpdateUserInfoRequest = {
  name?: string;
  surname?: string;
  mail?: string;
  image?: string;
}

export type UpdateUserInfoResponse = {
  success: boolean;
  message: string;
  user?: User;
}