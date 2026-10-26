import type { Metadata } from "next";
import ProjectPanel from "@/components/ProjectPanel";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects — Aatman Soni",
  description:
    "int8 quantization, KV-cache decoding, a ConvNeXt port, and document-graph retrieval.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-10.5rem)] w-full max-w-[90rem] flex-col justify-center px-6 pb-8 pt-20 sm:px-10">
      <h1 className="label text-graphite">Projects</h1>
      <div className="mt-8 grid gap-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-8">
        {projects.map((p) => (
          <ProjectPanel key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}
