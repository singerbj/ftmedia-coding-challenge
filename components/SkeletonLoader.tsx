"use client";

import { motion } from "framer-motion";
import { Skeleton, Flex } from "@radix-ui/themes";

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  count?: number;
  variant?: "text" | "card" | "badge" | "button";
  className?: string;
}

/**
 * Skeleton loader with fade-out animation
 * Provides smooth loading state transitions for data-fetching components
 */
export function SkeletonLoader({
  width = "100%",
  height = "20px",
  count = 1,
  variant = "text",
  className = "",
}: SkeletonLoaderProps) {
  // Fade out animation for skeleton when data loads
  const skeletonFadeOut = {
    initial: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  };

  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <motion.div variants={skeletonFadeOut} initial="initial" exit="exit">
            <Skeleton width="100%" height="120px" />
          </motion.div>
        );

      case "badge":
        return (
          <motion.div variants={skeletonFadeOut} initial="initial" exit="exit">
            <Skeleton width={width || "60px"} height={height || "24px"} />
          </motion.div>
        );

      case "button":
        return (
          <motion.div variants={skeletonFadeOut} initial="initial" exit="exit">
            <Skeleton width={width || "80px"} height={height || "32px"} />
          </motion.div>
        );

      case "text":
      default:
        return (
          <Flex direction="column" gap="2" className={className}>
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                variants={skeletonFadeOut}
                initial="initial"
                exit="exit"
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                <Skeleton width={width} height={height} />
              </motion.div>
            ))}
          </Flex>
        );
    }
  };

  return renderSkeleton();
}

/**
 * Skeleton loader for sidebar tags
 */
export function TagSkeletonLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Flex direction="column" gap="2">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }}
          >
            <Skeleton width="100%" height="24px" />
          </motion.div>
        ))}
      </Flex>
    </motion.div>
  );
}

/**
 * Skeleton loader for chat list items
 */
export function ChatCardSkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <Flex direction="column" gap="3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }}
        >
          <Skeleton width="100%" height="120px" />
        </motion.div>
      ))}
    </Flex>
  );
}

/**
 * Skeleton loader for pinned items
 */
export function PinnedItemSkeletonLoader({ count = 2 }: { count?: number }) {
  return (
    <Flex direction="column" gap="2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }}
        >
          <Skeleton width="100%" height="32px" />
        </motion.div>
      ))}
    </Flex>
  );
}
