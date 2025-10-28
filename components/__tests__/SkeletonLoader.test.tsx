import { render } from "@testing-library/react";
import {
  SkeletonLoader,
  TagSkeletonLoader,
  ChatCardSkeletonLoader,
  PinnedItemSkeletonLoader,
} from "../SkeletonLoader";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <div {...(props as Record<string, unknown>)}>{children}</div>,
  },
}));

describe("SkeletonLoader", () => {
  it("renders with default props", () => {
    const { container } = render(<SkeletonLoader />);
    expect(container.querySelector(".rt-Skeleton")).toBeInTheDocument();
  });

  it("renders multiple skeletons when count is specified", () => {
    const { container } = render(<SkeletonLoader count={3} />);
    const skeletons = container.querySelectorAll(".rt-Skeleton");
    expect(skeletons).toHaveLength(3);
  });

  it("renders card variant", () => {
    const { container } = render(<SkeletonLoader variant="card" />);
    expect(container.querySelector(".rt-Skeleton")).toBeInTheDocument();
  });

  it("renders badge variant with custom dimensions", () => {
    const { container } = render(
      <SkeletonLoader variant="badge" width="80px" height="28px" />
    );
    expect(container.querySelector(".rt-Skeleton")).toBeInTheDocument();
  });

  it("renders button variant", () => {
    const { container } = render(<SkeletonLoader variant="button" />);
    expect(container.querySelector(".rt-Skeleton")).toBeInTheDocument();
  });

  it("applies custom className to text variant", () => {
    const { container } = render(
      <SkeletonLoader variant="text" className="custom-class" />
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});

describe("TagSkeletonLoader", () => {
  it("renders 5 skeleton tags", () => {
    const { container } = render(<TagSkeletonLoader />);
    const skeletons = container.querySelectorAll(".rt-Skeleton");
    expect(skeletons).toHaveLength(5);
  });
});

describe("ChatCardSkeletonLoader", () => {
  it("renders default count of 3 skeleton cards", () => {
    const { container } = render(<ChatCardSkeletonLoader />);
    const skeletons = container.querySelectorAll(".rt-Skeleton");
    expect(skeletons).toHaveLength(3);
  });

  it("renders custom count of skeleton cards", () => {
    const { container } = render(<ChatCardSkeletonLoader count={5} />);
    const skeletons = container.querySelectorAll(".rt-Skeleton");
    expect(skeletons).toHaveLength(5);
  });
});

describe("PinnedItemSkeletonLoader", () => {
  it("renders default count of 2 skeleton items", () => {
    const { container } = render(<PinnedItemSkeletonLoader />);
    const skeletons = container.querySelectorAll(".rt-Skeleton");
    expect(skeletons).toHaveLength(2);
  });

  it("renders custom count of skeleton items", () => {
    const { container } = render(<PinnedItemSkeletonLoader count={4} />);
    const skeletons = container.querySelectorAll(".rt-Skeleton");
    expect(skeletons).toHaveLength(4);
  });
});
