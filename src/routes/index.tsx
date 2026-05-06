import { createFileRoute } from "@tanstack/react-router";
import { IDE } from "@/components/tamizhi/IDE";

export const Route = createFileRoute("/")({
  component: IDE,
  head: () => ({
    meta: [
      { title: "Tamizhi IDE — Linux Native Programming Language" },
      {
        name: "description",
        content:
          "Tamizhi IDE: a futuristic web-based editor with Monaco, LLVM backend, AST viewer, and Linux hacker aesthetic.",
      },
    ],
  }),
});
