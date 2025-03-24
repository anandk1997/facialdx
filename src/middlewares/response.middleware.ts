import { Request, Response, NextFunction } from "express";

export interface ICustomResponse extends Response {
  response: (param: {
    status: number;
    message: string;
    data?: any;
    [key: string]: any;
  }) => Response;
}

export const responseHandler = (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  (res as ICustomResponse).response = (params) => {
    return res.status(params.status).json({
      ...params,
    });
  };
  next();
};
