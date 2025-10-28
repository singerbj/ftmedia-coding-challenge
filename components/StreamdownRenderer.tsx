"use client";

import React, { useMemo } from "react";
import { Streamdown } from "streamdown";
import { Text, Spinner, Flex } from "@radix-ui/themes";
import "./streamdown.css";

interface StreamdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export default function StreamdownRenderer({
  content,
  isStreaming,
}: StreamdownRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content) return null;
    return <Streamdown>{content}</Streamdown>;
  }, [content]);

  return (
    <div className="streamdown-container">
      {renderedContent}
      {isStreaming && (
        <Flex gap="2" align="center" className="mt-2 h-5 min-h-5">
          <Spinner size="1" />
          <Text size="1" className="text-color-secondary leading-5">
            Answering...
          </Text>
        </Flex>
      )}
    </div>
  );
}
