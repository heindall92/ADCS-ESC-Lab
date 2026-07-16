import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/borrador-glass")({
  component: () => <Navigate to="/" replace />,
});
