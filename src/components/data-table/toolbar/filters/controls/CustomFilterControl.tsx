import React from "react";

import type { DataTableFilterDefinition } from "../../../core/types";

export interface CustomFilterControlProps {
  definition: Extract<DataTableFilterDefinition, { type: "custom" }>;
  value: any;
  onChange: (val: any) => void;
}

export const CustomFilterControl: React.FC<CustomFilterControlProps> = ({
  definition,
  value,
  onChange,
}) => {
  return (
    <>
      {definition.render({
        value,
        onChange,
      })}
    </>
  );
};
