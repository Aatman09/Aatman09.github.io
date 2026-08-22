export const experience = {
  company: "SilverTouch Technologies Ltd",
  location: "Ahmedabad, India",
  role: "AI / ML Intern",
  dates: "June 2026 – July 2026",
  summary:
    "An 8-week internship contributing to a production Intelligent Document Processing (Graph RAG) system — the kind of shipped, measured, deployed work that a research-leaning portfolio was missing.",
  sections: [
    {
      label: "Layout",
      heading: "Document layout analysis & OCR",
      body: [
        "PaddleOCR-VL extracts text as flat, unstructured blocks with no concept of sections or nesting. Built a section-reconstruction pipeline on top of PaddleOCR-VL to recover that missing structure: a multi-stage algorithm that peels off headers, footers, and standalone visual blocks (tables, images, figures) first, then detects multi-column layouts by walking blocks left-to-right and watching for real gutters versus normal word spacing, merges the remaining text blocks vertically within each column using a gap threshold that adapts to the column's own font size, and finally assembles everything into a single reading-ordered sequence of sections.",
      ],
    },
    {
      label: "Retrieval",
      heading: "Intelligent Document Processing — Graph RAG system",
      body: [
        "The team's existing IDP system uses a graph rather than flat chunks so that it can answer questions spanning distant parts of a document — a clause on page 1 referencing a party defined on page 47, for instance: positional edges connect blocks by sequence and layout, and an LLM pass over each block extracts semantic edges (is_owner_of, works_at, and similar relationships) between the entities it mentions.",
        "Contributed to it by proposing using a single vision-language model to handle both image captioning and entity-relationship extraction at once, rather than running two separate pipelines — evaluated candidate models and picked Qwen3.5VL-9B, then compared vLLM, SGLang, and llama.cpp as serving options (SGLang's RadixAttention was attractive for concurrent chats but turned out incompatible with the model's quantization method) before deploying via llama.cpp.",
        "Modified a production API endpoint to delegate VLM inference to a dedicated vLLM server instead of loading the model directly in Python, improving throughput, and built a second endpoint for visualizing block-level bounding boxes.",
      ],
    },
  ],
};
