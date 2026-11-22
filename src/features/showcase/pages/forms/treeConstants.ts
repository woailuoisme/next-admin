import type { CascaderOption } from "@/components/form/choice/Cascader";
import type { TreeSelectNode } from "@/components/form/choice/TreeSelect";

export const REGION_OPTIONS: CascaderOption[] = [
  {
    value: "zhejiang",
    label: "浙江省",
    children: [
      {
        value: "hangzhou",
        label: "杭州市",
        children: [
          { value: "xihu", label: "西湖区" },
          { value: "binjiang", label: "滨江区" },
          { value: "yuhang", label: "余杭区" },
        ],
      },
      {
        value: "ningbo",
        label: "宁波市",
        children: [
          { value: "haishu", label: "海曙区" },
          { value: "yinzhou", label: "鄞州区" },
        ],
      },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏省",
    children: [
      {
        value: "nanjing",
        label: "南京市",
        children: [
          { value: "xuanwu", label: "玄武区" },
          { value: "gulou", label: "鼓楼区" },
        ],
      },
      {
        value: "suzhou",
        label: "苏州市",
        children: [
          { value: "gusu", label: "姑苏区" },
          { value: "wuzhong", label: "吴中区" },
        ],
      },
    ],
  },
  {
    value: "guangdong",
    label: "广东省",
    children: [
      {
        value: "guangzhou",
        label: "广州市",
        children: [
          { value: "tianhe", label: "天河区" },
          { value: "yuexiu", label: "越秀区" },
        ],
      },
      {
        value: "shenzhen",
        label: "深圳市",
        children: [
          { value: "nanshan", label: "南山区" },
          { value: "futian", label: "福田区" },
        ],
      },
    ],
  },
];

export const ORG_TREE_DATA: TreeSelectNode[] = [
  {
    value: "headquarters",
    label: "集团总部",
    children: [
      {
        value: "rd_center",
        label: "全球研发中心",
        children: [
          { value: "fe_arch", label: "前端架构组" },
          { value: "be_core", label: "基础平台组" },
          { value: "ai_lab", label: "AI 智能实验室" },
        ],
      },
      {
        value: "design_center",
        label: "体验设计中心",
        children: [
          { value: "ux_design", label: "交互设计团队" },
          { value: "brand_design", label: "视觉品牌创意团队" },
        ],
      },
      {
        value: "business_center",
        label: "商业化运营部",
        children: [
          { value: "global_sales", label: "全球大客户销售部" },
          { value: "customer_success", label: "客户成功服务团队" },
        ],
      },
    ],
  },
];

export const PERMISSION_TREE_DATA: TreeSelectNode[] = [
  {
    value: "sys_root",
    label: "系统全量权限",
    children: [
      {
        value: "user_mgmt",
        label: "用户与账户管理",
        children: [
          { value: "user_create", label: "创建用户" },
          { value: "user_edit", label: "编辑用户详情" },
          { value: "user_delete", label: "注销/删除账号" },
          { value: "user_export", label: "导出用户列表" },
        ],
      },
      {
        value: "role_perm",
        label: "角色与访问控制",
        children: [
          { value: "role_assign", label: "分配角色" },
          { value: "audit_log", label: "查看安全审计日志" },
          { value: "mfa_reset", label: "重置二要素校验" },
        ],
      },
      {
        value: "infra_setting",
        label: "基础设施与网关配置",
        children: [
          { value: "gateway_rule", label: "更新 API 网关流控规则" },
          { value: "secret_rotate", label: "密钥轮换管理" },
        ],
      },
    ],
  },
];
