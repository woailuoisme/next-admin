"use client";

import * as React from "react";
import { BackToTop } from "@/components/back-to-top";
import { CalloutsShowcaseCard } from "./components/CalloutsShowcaseCard";
import { InfolistHeaderBar } from "./components/InfolistHeaderBar";
import { RecordDetailsShowcaseCard } from "./components/RecordDetailsShowcaseCard";

export function InfolistShowcasePage() {
  const [orientation, setOrientation] = React.useState<"vertical" | "horizontal">("vertical");
  const [dense, setDense] = React.useState(false);

  return (
    <div className="space-y-8 pb-16">
      <InfolistHeaderBar
        orientation={orientation}
        dense={dense}
        onOrientationChange={setOrientation}
        onDenseToggle={() => setDense(!dense)}
      />

      <CalloutsShowcaseCard />

      <RecordDetailsShowcaseCard orientation={orientation} dense={dense} />

      <BackToTop />
    </div>
  );
}

export default InfolistShowcasePage;
