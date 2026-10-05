import { common } from "./common";
import { menu } from "./menu";
import { notification } from "./notification";
import { product } from "./product";
import { search } from "./search";
import { table } from "./table";
import { toast } from "./toast";

export const zh = {
  common,
  menu,
  table,
  toast,
  notification,
  product,
  search,
};

export type MessageSchema = typeof zh;
