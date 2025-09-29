import { http } from "@/utils/http";

export type Result = {
  success: boolean;
  msg: string;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("get", "/get-async-routes");
};
