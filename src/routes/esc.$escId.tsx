import { createFileRoute, notFound } from "@tanstack/react-router";

import { EscDetail } from "@/components/esc-detail";
import { getEscById, useAdcsData } from "@/lib/adcs-data";

export const Route = createFileRoute("/esc/$escId")({
  loader: ({ params }) => {
    const id = Number.parseInt(params.escId, 10);
    const esc = getEscById(id);
    if (!esc) {
      throw notFound();
    }
    return { escId: id };
  },
  head: ({ loaderData }) => {
    const esc = loaderData ? getEscById(loaderData.escId) : undefined;
    const title = esc ? `${esc.name} — ADCS ESC Lab` : "ESC — ADCS ESC Lab";
    const description = esc ? `${esc.shortName}: ${esc.tagline}` : "ADCS ESC case detail.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: EscPage,
});

function EscPage() {
  const { escId } = Route.useLoaderData();
  const { getEscById: getLocalizedEsc } = useAdcsData();
  const esc = getLocalizedEsc(escId);
  if (!esc) return null;
  return <EscDetail esc={esc} />;
}
