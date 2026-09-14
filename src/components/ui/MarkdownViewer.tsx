import React from "react";
import { cn } from "@/utils";
import { markdownToHtml } from "@/utils";
import "./MarkdownViewer.css";

type Props = { value: string; className?: string; style?: React.CSSProperties };

export default function MarkdownViewer({ value, className, style }: Props) {
  return (
    <div
      className={cn(className, "markdown")}
      style={style}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
    />
  );
}
