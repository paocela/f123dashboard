import { User } from "@genezio-sdk/f123dashboard";

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