import { Request, Response } from "express";
import { dbUserList } from "../db/user.db";

import { logError } from "../util/error.util";

export const userList = async (req: Request, resp: Response) => {
  try {
    return resp.json(await dbUserList());
  } catch (err) {
    logError(err);
  }
};
