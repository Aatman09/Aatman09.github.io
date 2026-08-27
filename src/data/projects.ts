export type Project = {
  slug: string;
  title: string;
  oneLiner: string;
  /**
   * The defining value for this project — a benchmark, a speedup, a merged PR
   * number. It leads the row in the index, so it has to be something real:
   * where there is no honest number, the marker carries the defining fact
   * instead. Never a sequence position.
   */
  marker: string;
  markerLabel: string;
  markerNote?: string;
  stack: string[];
  github?: string;
  /** A deployed, publicly reachable instance. Outranks the repo link when present. */
  live?: string;
  status: "shipped" | "in-progress";
  /** Renders the interactive quantizer figure on this project's page. */
  figure?: "quantizer";
  cardBullets: string[];
  deepDive: {
    heading: string;
    body: string[]; // paragraphs
    /** "limits" renders the section as a called-out caveat block. */
    tone?: "limits";
  }[];
  resultsTable?: {
    headers: string[];
    rows: string[][];
    /** Index of the row that is this project's own result. */
    highlightRow?: number;
  };
};

export const projects: Project[] = [
  {
    slug: "cachegpt",
    title: "CacheGPT",
    oneLiner:
      "GPT-2 trained from scratch, served through a hand-written KV cache, instruction-tuned with LoRA, and deployed live on a CPU-only box.",
    marker: "10.2×",
    markerLabel: "Faster decode",
    markerNote: "171.6 → 16.8 ms/token at 84-token context",
    stack: [
      "Python",
      "PyTorch",
      "PEFT",
      "FastAPI",
      "PostgreSQL",
      "React",
      "Docker",
      "AWS",
    ],
    github: "https://github.com/Aatman09/gpt2-inference-engine",
    live: "https://cachegpt.duckdns.org",
    status: "shipped",
    cardBullets: [
      "Hand-written KV cache cutting decode from 171.6 to 16.8 ms/token — exposed as a live toggle so the difference is visible, not asserted.",
      "Instruction-tuned GPT-2-medium with LoRA into a 4.7 MB adapter training 0.29% of the weights.",
      "Deployed on a 2 vCPU / 4 GB EC2 box with no GPU, after shrinking the Docker image from 15.8 GB to 2.76 GB.",
    ],
    deepDive: [
      {
        heading: "The cache is the product",
        body: [
          "Naive generation re-runs the whole sequence through every transformer block on every new token: at step t it recomputes K and V for all t past tokens, none of which changed. Caching them per layer means each decode step does one token's worth of attention work, turning quadratic per-step cost into linear.",
          "Two details decide whether the implementation is correct rather than merely fast. is_causal is computed dynamically from q.shape[2] == k.shape[2], so the same forward pass serves both a multi-token prefill and a single-token decode without a separate code path — during decode the lone query attends to all past keys and needs no mask at all. And position ids continue from past_length, or the position embedding table resets to zero every step and the model loses track of where it is.",
          "Measured on this machine: 16.8 ms/token cached, against 171.6 ms/token running the naive full-sequence path at an 84-token context. The app ships both and lets you switch between them mid-conversation, which is the only honest way to present a speedup.",
        ],
      },
      {
        heading: "Making a base model answer questions",
        body: [
          "GPT-2 is a base model: it continues text rather than responding to it, so as a chat product it looks broken. LoRA fixes that without touching the 406M frozen weights — a rank decomposition on the attention projections, trained on databricks-dolly-15k, producing a 4.7 MB adapter of 1.18M trainable parameters (0.29% of the model).",
          "Response-only loss masking matters more than it sounds: the model should learn to produce the answer, not to reproduce the prompt. The prompt format lives in one module shared by training and serving, so the two cannot silently drift apart — a mismatch there produces a model that scores well during training and behaves strangely in production.",
        ],
      },
      {
        heading: "Shipping it somewhere real",
        body: [
          "Three backends sit behind one interface: the hand-written engine and two off-the-shelf instruct models (Qwen2.5-0.5B, SmolLM2-360M). The generate route depends only on that interface and has no idea which is underneath, which is what makes switching models, toggling the cache, and swapping adapters all the same kind of operation.",
          "The deploy is a single container on an EC2 t3.medium — 2 vCPU, 4 GB, no GPU — behind nginx with TLS. Getting there meant cutting the image from 15.8 GB to 2.76 GB, because the default PyTorch wheel bundles CUDA runtime libraries whether or not a GPU exists; a CPU-only wheel index behind a uv extra removes about 13 GB of dead weight.",
          "Streaming runs the CPU-bound generator on a worker thread and hands tokens to the async side through a queue, so the event loop stays free to flush each frame as it is produced. Per-token latency and throughput are computed live and persisted with the conversation, so reloading a chat shows the same numbers it showed while streaming.",
        ],
      },
      {
        heading: "Honest limitations",
        tone: "limits",
        body: [
          "Speculative decoding and INT8 quantization are designed and baselined (16.8 ms/token fp32, 10.5 ms/token INT8 measured) but not implemented.",
          "No continuous batching or request scheduler — batch size is hardcoded to 1 everywhere in the serving path.",
          "The adapter was trained entirely on single-turn data and occasionally pulls context from unrelated earlier turns. Reproduced systematically (1 in 6 seeds with contaminating history, 0 in 6 without) rather than left as an anecdote; the fix needs multi-turn training data.",
          "A single JWT access token with no refresh rotation — a deliberate scope cut for a demo app, not production auth.",
        ],
      },
    ],
    resultsTable: {
      headers: ["Decode path", "ms / token", "Relative"],
      highlightRow: 1,
      rows: [
        ["Naive full-sequence (T=84)", "171.6", "10.2× slower"],
        ["KV cache (fp32)", "16.8", "baseline"],
        ["INT8 quantized — measured, not shipped", "10.5", "1.6× faster"],
      ],
    },
  },
  {
    slug: "doc-tree",
    title: "doc_tree",
    oneLiner:
      "Rebuilds a document's section hierarchy from the flat block list an OCR model outputs — one pass, no ML.",
    marker: "O(n)",
    markerLabel: "Single pass",
    markerNote: "No model inference · 48-case test suite",
    stack: ["Python"],
    github: "https://github.com/Aatman09/doc_tree",
    status: "shipped",
    cardBullets: [
      "PaddleOCR-VL detects where things are but not what owns what — doc_tree recovers the section tree it never produces.",
      "Heading-type detection, dotted-number parsing and a stack. Deterministic, linear, and no model in the loop.",
      "Section-level chunking means retrieval returns a whole subsection instead of a fragment starting mid-sentence.",
    ],
    deepDive: [
      {
        heading: "The gap it fills",
        body: [
          "PaddleOCR-VL does layout detection: it tells you a block is a paragraph title, a table, a figure, and where it sits on the page. It does not tell you that 3.2.2 Multi-Head Attention lives inside 3.2 Attention, because reconstructing structure is a different problem from detecting it.",
          "Everything downstream pays for that missing hierarchy. Fixed-size chunkers slice sections in half and orphan subsections from their parents. Tables and figures lose the section they belong to, so 'which section is this table in' has no answer. Markdown generated from flat blocks is a wall of undifferentiated headings.",
        ],
      },
      {
        heading: "How it works",
        body: [
          "Detection runs in priority order. Only blocks already typed as headings are considered. A leading dotted number gives the depth directly — 3.2.5 is level three, dots plus one. Unnumbered headings matching known front and back matter (Abstract, References, Appendix, Index) are treated as level one. Anything left falls to a pluggable classifier using line height relative to the document median, so a project with real typography information can swap in something better without touching the rest.",
          "The builder then walks blocks in reading order against a stack, popping until it finds the right parent and pushing each new section. Non-heading blocks attach to whatever section is currently open. Each section ends up carrying its own heading box plus the recursive union of everything it owns, with a per-page footprint for sections spanning multiple pages.",
        ],
      },
      {
        heading: "The two decisions that make it survive real scans",
        body: [
          "A synthetic root at level zero. Front matter before the first heading, and the document title itself, belong to the root rather than leaking out or forcing an artificial section. Every block is guaranteed exactly one owner.",
          "Level clamping. A new heading's depth is bounded to its parent's depth plus one and floored at one. That single rule roots a partial extraction at level one, caps runaway nesting from an OCR'd 1.1.1.1.1, and keeps the tree valid when intermediate numbering is missing entirely.",
          "Separately, repeating page furniture — running headers and footers, page numbers, logos — attaches nowhere at all. This came out of a real failure: a running header sitting above a real heading bound itself to whatever section was still open from the previous page, and one attached to List of Figures across a chapter divider dragged that section's bounding box onto the next chapter.",
        ],
      },
    ],
  },
  {
    slug: "gemma2-quant",
    title: "gemma2-quant",
    oneLiner:
      "From-scratch int8 quantization for Gemma 2 2B — measured against bf16 and bitsandbytes, not just implemented.",
    marker: "12.53",
    markerLabel: "Perplexity",
    markerNote: "bf16 baseline 12.46 · bitsandbytes 12.70",
    stack: ["Python", "PyTorch", "Hugging Face Transformers", "FastAPI"],
    github: "https://github.com/Aatman09/gemma2-quant-serve",
    status: "shipped",
    figure: "quantizer",
    cardBullets: [
      "Per-channel symmetric int8 quantization written from scratch — no bitsandbytes in the core path.",
      "Beats bitsandbytes on quality (12.53 vs 12.70 perplexity) while trading some memory savings (-27% vs -39%).",
      "FastAPI serving layer on top of the quantized model.",
    ],
    deepDive: [
      {
        heading: "The thesis",
        body: [
          "Quantization trades accuracy for memory. Most from-scratch quantization projects stop at “it runs” without asking how much accuracy it actually costs. This one answers that question directly: perplexity on wikitext-2, measured against a bf16 baseline and against bitsandbytes as a reference implementation.",
        ],
      },
      {
        heading: "What “from scratch” means here",
        body: [
          "Per-channel symmetric int8, one scale per output row: scale = W.abs().amax(dim=1) / 127, with a zero-row guard (scale.clamp(min=1e-8)) to avoid division by zero.",
          "A custom QuantizedLinear module stores the int8 weight and its scale as buffers (not parameters — no gradients needed, and buffers correctly follow .to(device) and the state dict). forward() dequantizes on the fly and runs F.linear — no full-precision weight is ever kept in memory.",
          "quantize_model is a recursive walk over every child module that swaps each nn.Linear for a QuantizedLinear via setattr, so the same function quantizes the whole model regardless of depth.",
          "All math runs in bf16, and the scale itself is stored in bf16 so the dequantized weight matches the model's activation dtype with no implicit casts introduced by the quantization step.",
        ],
      },
      {
        heading: "Results — Gemma 2 2B, wikitext-2 test",
        body: [
          "My int8 beats bitsandbytes on quality (12.53 vs 12.70 perplexity). bitsandbytes casts bf16 activations to fp16 internally before its int8 matmul, and that cast costs a bit of accuracy; the from-scratch path stays in bf16 end-to-end.",
          "bitsandbytes still wins on memory (-39% vs -27%). The gap exists because quantize_model only replaces nn.Linear layers — Gemma's embed_tokens is an nn.Embedding and stays in bf16, about 1.18GB untouched. Quantizing embeddings is a different problem (a lookup, not a matmul) and is the natural next step.",
          "Net picture: the from-scratch pipeline sits on a more accuracy-favoring point of the memory/quality curve — roughly the same ballpark on size, about 3× less perplexity damage.",
        ],
      },
      {
        heading: "Honest limitations",
        tone: "limits",
        body: [
          "nn.Embedding is not quantized yet — it's the largest remaining memory chunk.",
          "Weight tying between embed_tokens and lm_head is broken by the current Linear-replacement walk; skipping lm_head would recover the tie and shrink memory further.",
          "Throughput (tokens/sec via model.generate) hasn't been measured yet — perplexity and memory are the two axes measured so far.",
        ],
      },
    ],
    resultsTable: {
      headers: ["Model", "Memory", "Δ Memory", "Perplexity", "Δ Quality"],
      highlightRow: 1,
      rows: [
        ["bf16 (baseline)", "4.87 GB", "—", "12.46", "—"],
        ["int8 (from scratch)", "3.54 GB", "-27%", "12.53", "+0.56%"],
        ["bitsandbytes int8", "2.98 GB", "-39%", "12.70", "+1.93%"],
      ],
    },
  },
  {
    slug: "jax-transformer",
    title: "Transformer for Machine Translation",
    oneLiner:
      "Full encoder-decoder Transformer built from scratch in JAX/Flax for English-to-Spanish translation.",
    marker: "EN→ES",
    markerLabel: "Translation",
    markerNote: "Encoder–decoder written from the paper",
    stack: ["Python", "JAX", "Flax"],
    github: "https://github.com/Aatman09/Jax_TinyGPT_from_scratch",
    status: "shipped",
    cardBullets: [
      "Implemented the full encoder-decoder architecture by hand: multi-head attention, positional encoding, feed-forward and residual blocks.",
      "Expressed the model in JAX's stateless functional paradigm (pure functions, jit) so the same code accelerates on both GPU and TPU.",
    ],
    deepDive: [
      {
        heading: "Why build the whole thing by hand",
        body: [
          "The goal was to understand the Transformer end-to-end rather than lean on a library abstraction. Every piece — multi-head attention, sinusoidal positional encoding, the feed-forward blocks, the residual connections around each sublayer — was written from the paper, not imported.",
        ],
      },
      {
        heading: "JAX's functional paradigm",
        body: [
          "JAX has no mutable model state the way PyTorch's nn.Module does — everything is a pure function over explicit parameters, which is what makes jit compilation and TPU acceleration possible. Writing the Transformer this way forces a much more explicit understanding of exactly what state the model carries at every step, compared to letting a framework's object model hide it.",
        ],
      },
    ],
  },
  {
    slug: "bonsai",
    title: "jax-ml/bonsai — ConvNeXt contribution",
    oneLiner:
      "Ported the ConvNeXt vision architecture to Google's JAX model library, merged after multiple maintainer review rounds.",
    marker: "#69",
    markerLabel: "Merged PR",
    markerNote: "jax-ml/bonsai, after several review rounds",
    stack: ["Python", "JAX", "Flax"],
    github: "https://github.com/jax-ml/bonsai/pull/69",
    status: "shipped",
    cardBullets: [
      "Bonsai had no ConvNeXt implementation — ported the architecture to JAX/Flax from scratch.",
      "Adapted the model to JAX's stateless functional paradigm for TPU and GPU compatibility.",
      "Carried the PR through multiple rounds of maintainer code review to a merged result (PR #69).",
    ],
    deepDive: [
      {
        heading: "The contribution",
        body: [
          "Bonsai is Google's JAX model library, and it had no ConvNeXt implementation. The port covers the full architecture — the depthwise-convolution-based ConvNeXt block, the layer-scale and stochastic-depth details, and correct weight-shape handling — adapted to JAX/Flax's functional style so it runs the same way on GPU and TPU.",
          "The PR went through several rounds of maintainer review before merging — real back-and-forth on API shape and framework conventions, not a rubber-stamp merge.",
        ],
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
