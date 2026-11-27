"use client";

import { cn } from "cn";

import { splitHighlightSegments } from "./treeEngine";

interface HighlightedTextProps {
	text: string;
	keyword: string;
	variant?: "mark" | "inline";
}

export function HighlightedText({ text, keyword, variant = "inline" }: HighlightedTextProps) {
	const segments = splitHighlightSegments(text, keyword);
	return (
		<>
			{segments.map((segment, index) =>
				segment.highlighted ? (
					<mark
						key={index}
						className={cn(
							variant === "mark"
								? "bg-primary/20 text-primary rounded-sm px-0.5 font-medium"
								: "bg-transparent text-primary font-semibold",
						)}
					>
						{segment.text}
					</mark>
				) : (
					<span key={index}>{segment.text}</span>
				),
			)}
		</>
	);
}
