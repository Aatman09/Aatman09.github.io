export const experience = {
  company: "SilverTouch Technologies Ltd",
  location: "Ahmedabad, India",
  role: "AI / ML Intern",
  dates: "June 2026 – July 2026",
  summary:
    "An 8-week internship on a production Intelligent Document Processing (Graph RAG) system: built the section-reconstruction step that turns OCR output into document structure, chose and served the vision-language model used for entity extraction, and moved its inference onto a dedicated server.",
  sections: [
    {
      label: "Layout",
      heading: "Document layout analysis & OCR",
      body: [
        "PaddleOCR-VL extracts text as flat blocks with no concept of sections or nesting. I built a section-reconstruction pipeline on top of it to recover that structure.",
        "It runs in stages. First it peels off headers, footers and standalone visual blocks (tables, images, figures). Next it detects multi-column layouts by walking blocks left to right and telling real gutters apart from normal word spacing. Then it merges the remaining text blocks vertically within each column, using a gap threshold that adapts to that column's font size. Finally it assembles everything into one reading-ordered sequence of sections.",
      ],
    },
    {
      label: "Retrieval",
      heading: "Intelligent Document Processing — Graph RAG system",
      body: [
        "The team's IDP system stores a document as a graph rather than flat chunks, so it can answer questions that span distant parts of it — a clause on page 1 referencing a party defined on page 47. Positional edges connect blocks by sequence and layout; an LLM pass over each block extracts semantic edges (is_owner_of, works_at and similar) between the entities it mentions.",
        "I proposed replacing two separate pipelines — image captioning and entity-relationship extraction — with a single vision-language model that does both. I evaluated candidate models and picked Qwen3.5VL-9B, then compared vLLM, SGLang and llama.cpp as serving options. SGLang's RadixAttention was attractive for concurrent chats but incompatible with the model's quantization method; it went into production on vLLM.",
        "Changed a production API endpoint to delegate VLM inference to that dedicated vLLM server instead of loading the model in-process, and built a second endpoint for visualizing block-level bounding boxes.",
      ],
    },
  ],
};
