import { actionsCol } from "./action";
import {
  badgeCol,
  colorCol,
  currencyCol,
  dateCol,
  iconCol,
  maskedCol,
  numberCol,
  progressCol,
  ratingCol,
  sparklineCol,
  textCol,
  userCol,
} from "./display";
import { checkboxCol, selectCol, textInputCol, toggleCol } from "./interactive";
import { avatarCol, imageCol } from "./media";

/**
 * 命名空间统一列构造器 (Unified Column Builders Namespace)
 * 允许用户通过 `col.text()`, `col.badge()`, `col.actions()` 形式更具结构化地声明表格列
 */
export const col = {
  text: textCol,
  badge: badgeCol,
  date: dateCol,
  number: numberCol,
  currency: currencyCol,
  progress: progressCol,
  sparkline: sparklineCol,
  masked: maskedCol,
  rating: ratingCol,
  color: colorCol,
  icon: iconCol,
  user: userCol,
  avatar: avatarCol,
  image: imageCol,
  toggle: toggleCol,
  select: selectCol,
  textInput: textInputCol,
  checkbox: checkboxCol,
  actions: actionsCol,
} as const;
