"use client";

import { useEffect, useRef, useState } from "react";

import {
	CascaderInput,
	type CascaderOption,
	CheckboxGroup,
	CheckboxInput,
	ComboboxInput,
	RadioGroupInput,
	SelectInput,
	SwitchInput,
	ToggleButtons,
	TreeSelectInput,
	type TreeSelectNode,
} from "@/components/form/choice";
import { Fieldset, Grid, Section } from "@/components/shared/layout";

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
import {
	attachChildrenByValue,
	CATEGORY_CHILDREN_BY_KEY,
	INITIAL_ASYNC_CATEGORIES,
	INITIAL_ASYNC_PROJECT_TREE,
	PROJECT_CHILDREN_BY_KEY,
} from "./choicesMockData";

export interface ChoicesTabProps {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
	form: any;
}

export function ChoicesTab({ form }: ChoicesTabProps) {
	const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

	useEffect(() => {
		return () => {
			for (const timer of timersRef.current) clearTimeout(timer);
			timersRef.current = [];
		};
	}, []);

	const waitSafely = (ms: number) =>
		new Promise<boolean>((resolve) => {
			const timer = setTimeout(() => {
				timersRef.current = timersRef.current.filter((t) => t !== timer);
				resolve(true);
			}, ms);
			timersRef.current.push(timer);
		});

	const [asyncCategoryOptions, setAsyncCategoryOptions] = useState<CascaderOption[]>(INITIAL_ASYNC_CATEGORIES);
	const [asyncProjectTreeData, setAsyncProjectTreeData] = useState<TreeSelectNode[]>(INITIAL_ASYNC_PROJECT_TREE);

	const handleLoadCategoryData = async (selectedOptions: CascaderOption[]) => {
		const targetOption = selectedOptions[selectedOptions.length - 1];
		if (!targetOption) return;
		await waitSafely(800);
		const children = CATEGORY_CHILDREN_BY_KEY[String(targetOption.value)] ?? [];
		setAsyncCategoryOptions((prev) => attachChildrenByValue(prev, targetOption.value, children));
	};

	const handleLoadProjectNodeData = async (node: TreeSelectNode) => {
		await waitSafely(750);
		const children = PROJECT_CHILDREN_BY_KEY[String(node.value)] ?? [];
		setAsyncProjectTreeData((prev) => attachChildrenByValue(prev, node.value, children));
	};

	return (
		<div className="flex flex-col gap-6">
			<Section
				title="Select, Combobox, Radio & Toggles"
				description="Categorical selectors, searchable dropdowns, and segmented controls."
			>
				<Grid columns={{ sm: 1, md: 2 }}>
					<SelectInput form={form} name="role" label="System Role (SelectInput)" options={ROLE_OPTIONS} colSpan={1} />
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
				</Grid>

				<Fieldset legend="System Switches & Permissions" className="mt-4">
					<Grid columns={{ sm: 1, md: 2 }}>
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
					</Grid>
				</Fieldset>

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
			</Section>

			<Section
				title="Cascader (级联选择器)"
				description="多列联动视口，支持静态行政区划、异步 loadData 按需加载子级、跨层级路径搜索与表单校验联动。"
			>
				<Grid columns={{ sm: 1, md: 2 }}>
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
				</Grid>
			</Section>

			<Section
				title="TreeSelect (树选择组件)"
				description="基于 Ant Design 与 shadcn 令牌构建的企业级下拉树，涵盖组织架构单选、权限勾选树 (SHOW_PARENT / SHOW_CHILD)、树形连接线 (treeLine)、异步加载 (loadData) 与标签折叠。"
			>
				<Grid columns={{ sm: 1, md: 3 }}>
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
				</Grid>
			</Section>
		</div>
	);
}
