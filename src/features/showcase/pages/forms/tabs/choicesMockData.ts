import type { CascaderOption, TreeSelectNode } from "@/components/form/choice";

export function attachChildrenByValue<T extends { value?: string | number; children?: T[] }>(
  nodes: T[],
  targetValue: string | number | undefined,
  children: T[],
): T[] {
  if (targetValue === undefined) return nodes;
  return nodes.map((node) => {
    if (node.value === targetValue) return { ...node, children };
    if (node.children?.length) {
      return { ...node, children: attachChildrenByValue(node.children, targetValue, children) };
    }
    return node;
  });
}

export const INITIAL_ASYNC_CATEGORIES: CascaderOption[] = [
  { value: "digital", label: "数码 3C", isLeaf: false },
  { value: "clothing", label: "服饰箱包", isLeaf: false },
  { value: "home", label: "居家生活", isLeaf: false },
];

export const CATEGORY_CHILDREN_BY_KEY: Record<string, CascaderOption[]> = {
  digital: [
    {
      value: "phones",
      label: "智能手机",
      children: [
        { value: "flagship", label: "旗舰影像手机" },
        { value: "foldable", label: "折叠屏手机" },
      ],
    },
    {
      value: "laptops",
      label: "轻薄笔记本",
      children: [
        { value: "ultrabook", label: "轻薄商务本" },
        { value: "gaming", label: "高性能游戏本" },
      ],
    },
  ],
  clothing: [
    {
      value: "mens",
      label: "男装精品",
      children: [
        { value: "jacket", label: "商务夹克" },
        { value: "shirt", label: "正装衬衫" },
      ],
    },
    {
      value: "womens",
      label: "女装潮流",
      children: [
        { value: "dress", label: "法式连衣裙" },
        { value: "coat", label: "羊绒大衣" },
      ],
    },
  ],
  home: [
    {
      value: "furniture",
      label: "实木家具",
      children: [
        { value: "sofa", label: "真皮意式沙发" },
        { value: "table", label: "岩板餐桌" },
      ],
    },
    {
      value: "bedding",
      label: "家纺床品",
      children: [
        { value: "quilt", label: "95% 白鹅绒被" },
        { value: "pillow", label: "天然乳胶枕" },
      ],
    },
  ],
};

export const INITIAL_ASYNC_PROJECT_TREE: TreeSelectNode[] = [
  { value: "cloud_infra", label: "分布式云原生底座", isLeaf: false },
  { value: "data_engine", label: "数据智能与流批中台", isLeaf: false },
  { value: "security_mesh", label: "企业零信任安全网格", isLeaf: false },
];

export const PROJECT_CHILDREN_BY_KEY: Record<string, TreeSelectNode[]> = {
  cloud_infra: [
    { value: "k8s_prod", label: "Kubernetes 核心生产集群 (us-west-1)", isLeaf: true },
    { value: "serverless_gateway", label: "Serverless 边缘流量网关", isLeaf: true },
  ],
  data_engine: [
    { value: "flink_stream", label: "Flink 毫秒级实时流计算引擎", isLeaf: true },
    { value: "vector_db", label: "PgVector 混合语义知识库", isLeaf: true },
  ],
  security_mesh: [
    { value: "waf_guard", label: "WAF 智能实时威胁阻断系统", isLeaf: true },
    { value: "mtls_cert", label: "mTLS 双向零信任证书管理链", isLeaf: true },
  ],
};
