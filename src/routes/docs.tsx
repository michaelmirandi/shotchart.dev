import { createFileRoute, redirect } from "@tanstack/react-router";

// The docs used to live at /docs. Keep old links (including #section hashes) working.
export const Route = createFileRoute("/docs")({
  beforeLoad: ({ location }) => {
    throw redirect({ to: "/", hash: location.hash });
  },
});
