"use client";

import { useMemoizedFn } from "ahooks";
import { useState } from "react";

import {
  CascaderInput,
  type CascaderOption,
  CheckboxGroup,
  CheckboxInput,
  ComboboxInput,
  FormFieldset,
  FormGrid,
  FormSection,
  RadioGroupInput,
  SelectInput,
  SwitchInput,
  ToggleButtons,
  TreeSelectInput,
  type TreeSelectNode,
} from "@/components/form";

import {
  DEPARTMENT_OPTIONS,
  DEVICE_OPTIONS,
  INTEREST_OPTIONS,
  ORG_TREE_DATA,
  PERMISSION_TREE_DATA,
  PLAN_OPTIONS,
  REGION_OPTIONS,
  ROLE_OPTIONS,
} from "../constants";

export interface ChoicesTabProps {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
  form: any;
}

export function ChoicesTab({ form }: ChoicesTabProps) {
  // 异步品类级联数据源状态
  const [asyncCategoryOptions, setAsyncCategoryOptions] = useState<CascaderOption[]>([
    {
      value: "digital",
      label: "数码 3C",
      isLeaf: false,
    },
    {
      value: "clothing",
      label: "服饰箱包",
      isLeaf: false,
    },
    {
      value: "home",
      label: "居家生活",
      isLeaf: false,
    },
  ]);

  const handleLoadCategoryData = useMemoizedFn(async (selectedOptions: CascaderOption[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (!targetOption) return;

    // 模拟网络请求延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (targetOption.value === "digital") {
      targetOption.children = [
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
      ];
    } else if (targetOption.value === "clothing") {
      targetOption.children = [
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
      ];
    } else if (targetOption.value === "home") {
      targetOption.children = [
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
      ];
    }

    setAsyncCategoryOptions([...asyncCategoryOptions]);
  });

  // 异步组织/工程树形数据状态
  const [asyncProjectTreeData, setAsyncProjectTreeData] = useState<TreeSelectNode[]>([
    {
      value: "cloud_infra",
      label: "分布式云原生底座",
      isLeaf: false,
    },
    {
      value: "data_engine",
      label: "数据智能与流批中台",
      isLeaf: false,
    },
    {
      value: "security_mesh",
      label: "企业零信任安全网格",
      isLeaf: false,
    },
  ]);

  const handleLoadProjectNodeData = useMemoizedFn(async (node: TreeSelectNode) => {
    // 模拟网络请求延迟
    await new Promise((resolve) => setTimeout(resolve, 750));

    if (node.value === "cloud_infra") {
      node.children = [
        { value: "k8s_prod", label: "Kubernetes 核心生产集群 (us-west-1)", isLeaf: true },
        { value: "serverless_gateway", label: "Serverless 边缘流量网关", isLeaf: true },
      ];
    } else if (node.value === "data_engine") {
      node.children = [
        { value: "flink_stream", label: "Flink 毫秒级实时流计算引擎", isLeaf: true },
        { value: "vector_db", label: "PgVector 混合语义知识库", isLeaf: true },
      ];
    } else if (node.value === "security_mesh") {
      node.children = [
        { value: "waf_guard", label: "WAF 智能实时威胁阻断系统", isLeaf: true },
        { value: "mtls_cert", label: "mTLS 双向零信任证书管理链", isLeaf: true },
      ];
    }

    setAsyncProjectTreeData([...asyncProjectTreeData]);
  });

  return (
    <div className="space-y-6">
      <FormSection
        title="Select, Combobox, Radio & Toggles"
        description="Categorical selectors, searchable dropdowns, and segmented controls."
      >
        <FormGrid columns={{ sm: 1, md: 2 }}>
          <SelectInput
            form={form}
            name="role"
            label="System Role (SelectInput)"
            options={ROLE_OPTIONS}
            colSpan={1}
          />
          <ComboboxInput
            form={form}
            name="department"
            label="Department (ComboboxInput Searchable)"
            placeholder="Search departments..."
            options={DEPARTMENT_OPTIONS}
            colSpan={1}
          />
          <ToggleButtons
            form={form}
            name="deviceType"
            label="Target Platform (ToggleButtons Segmented)"
            options={DEVICE_OPTIONS}
            fullWidth
            colSpan="full"
          />
          <RadioGroupInput
            form={form}
            name="plan"
            label="Subscription Tier (RadioGroup Card Variant)"
            card
            direction="horizontal"
            options={PLAN_OPTIONS}
            colSpan="full"
          />
        </FormGrid>

        <FormFieldset legend="System Switches & Permissions" className="mt-4">
          <FormGrid columns={{ sm: 1, md: 2 }}>
            <SwitchInput
              form={form}
              name="notificationsEnabled"
              label="Push Notifications"
              helperText="Receive real-time alerts for critical system triggers."
              colSpan={1}
            />
            <SwitchInput
              form={form}
              name="allowMarketing"
              label="Marketing Outreach"
              helperText="Allow promotional announcements and user research invites."
              colSpan={1}
            />
          </FormGrid>
        </FormFieldset>

        <div className="mt-4">
          <CheckboxGroup
            form={form}
            name="interests"
            label="Topic Subscriptions (CheckboxGroup Checklist)"
            direction="horizontal"
            options={INTEREST_OPTIONS}
          />
          <div className="mt-3">
            <CheckboxInput
              form={form}
              name="confirmTerms"
              label="I accept terms and conditions for automated testing."
              description="Checking this certifies compliance with company security standards."
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Cascader (级联选择器)"
        description="多列联动视口，支持静态行政区划、异步 loadData 按需加载子级、跨层级路径搜索与表单校验联动。"
      >
        <FormGrid columns={{ sm: 1, md: 2 }}>
          <CascaderInput
            form={form}
            name="region"
            label="行政区划 (静态 3 级 + 路径搜索 + 清除)"
            placeholder="请选择省市区..."
            options={REGION_OPTIONS}
            showSearch
            clearable
            colSpan={1}
            helperText="支持点击逐级展开或在输入框中实时模糊匹配路径并一键选中。"
          />
          <CascaderInput
            form={form}
            name="category"
            label="商品品类 (异步动态加载 loadData + changeOnSelect)"
            placeholder="请选择商品品类..."
            options={asyncCategoryOptions}
            loadData={handleLoadCategoryData}
            changeOnSelect
            colSpan={1}
            helperText="支持 isLeaf: false 动态按需请求子级品类，且允许选中任意一级类目。"
          />
        </FormGrid>
      </FormSection>

      <FormSection
        title="TreeSelect (树选择组件)"
        description="基于 Ant Design 与 shadcn 令牌构建的企业级下拉树，涵盖组织架构单选、权限勾选树 (SHOW_PARENT / SHOW_CHILD)、树形连接线 (treeLine)、异步加载 (loadData) 与标签折叠。"
      >
        <FormGrid columns={{ sm: 1, md: 3 }}>
          <TreeSelectInput
            form={form}
            name="orgDepartment"
            label="组织架构 (单选 + 树形导引线 treeLine + 搜索)"
            placeholder="请选择所属部门..."
            treeData={ORG_TREE_DATA}
            treeLine
            showIcon
            showSearch
            clearable
            treeDefaultExpandAll
            colSpan={1}
            helperText="支持搜索过滤高亮、展开/折叠、自定义图标与层级辅助虚线。"
          />
          <TreeSelectInput
            form={form}
            name="permissionNodes"
            label="权限清单 (复选框 treeCheckable + SHOW_PARENT)"
            placeholder="请勾选分配权限..."
            treeData={PERMISSION_TREE_DATA}
            treeCheckable
            showCheckedStrategy="SHOW_PARENT"
            showSearch
            clearable
            maxTagCount={2}
            colSpan={1}
            helperText="父子节点双向级联选择，支持半选 indeterminate 状态与 +N 标签折叠悬浮查看。"
          />
          <TreeSelectInput
            form={form}
            name="asyncProjectNode"
            label="云资源架构 (异步 loadData + 叶子选择限制)"
            placeholder="选择目标计算或引擎节点..."
            treeData={asyncProjectTreeData}
            loadData={handleLoadProjectNodeData}
            onlyLeafSelectable
            showSearch
            clearable
            colSpan={1}
            helperText="点击展开时动态加载微服务节点（附带加载动画），且仅叶子节点可被选中。"
          />
        </FormGrid>
      </FormSection>
    </div>
  );
}
