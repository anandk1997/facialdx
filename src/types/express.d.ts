import { Response } from "express";

declare module "express" {
  interface Response {
    response?: (param: {
      status: number;
      message: string;
      data?: any;
      [key: string]: any;
    }) => Response;
  }
}
