export type Project = {
  slug: string;
  title: string;
  oneLiner: string;
  stack: string[];
  github?: string;
  status: "shipped" | "in-progress";
  cardBullets: string[];
  deepDive: {
    heading: string;
    body: string[]; // paragraphs
  }[];
  resultsTable?: {
    headers: string[];
    rows: string[][];
  };
};

export const projects: Project[] = [
  {
    slug: "gemma2-quant",
    title: "gemma2-quant",
    oneLiner:
      "From-scratch int8 quantization for Gemma 2 2B — measured against bf16 and bitsandbytes, not just implemented.",
    stack: ["Python", "PyTorch", "Hugging Face Transformers", "FastAPI"],
    github: "https://github.com/Aatman09/gemma2-quant-serve",
    status: "shipped",
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
        body: [
          "nn.Embedding is not quantized yet — it's the largest remaining memory chunk.",
          "Weight tying between embed_tokens and lm_head is broken by the current Linear-replacement walk; skipping lm_head would recover the tie and shrink memory further.",
          "Throughput (tokens/sec via model.generate) hasn't been measured yet — perplexity and memory are the two axes measured so far.",
        ],
      },
    ],
    resultsTable: {
      headers: ["Model", "Memory", "Δ Memory", "Perplexity", "Δ Quality"],
      rows: [
        ["bf16 (baseline)", "4.87 GB", "—", "12.46", "—"],
        ["int8 (from scratch)", "3.54 GB", "-27%", "12.53", "+0.56%"],
        ["bitsandbytes int8", "2.98 GB", "-39%", "12.70", "+1.93%"],
      ],
    },
  },
  {
    slug: "achat",
    title: "achat",
    oneLiner:
      "GPT-2 built by hand in PyTorch, trained on FineWeb, and extended with a from-scratch KV-cache inference engine.",
    stack: ["Python", "PyTorch", "CUDA", "tiktoken", "FastAPI", "React"],
    github: "https://github.com/Aatman09/achat",
    status: "shipped",
    cardBullets: [
      "12-layer, 768-dim GPT-2 written from scratch, weights loaded from Hugging Face with the required transpose mapping.",
      "Custom KV-cache engine threading cache state through every transformer block — quadratic per-step decode becomes linear.",
      "bfloat16 autocast, gradient accumulation, and torch.compile cut per-step training time from 15s to under 5s on an RTX 4050.",
    ],
    deepDive: [
      {
        heading: "The KV cache, in one paragraph",
        body: [
          "Naive generation re-runs the full sequence through every transformer block on every new token: at step t, K and V get recomputed for all t past tokens, even though none of them changed. KV caching saves K and V per layer once they're computed, so each decode step only does one new token's worth of attention work — quadratic per-step cost becomes linear.",
          "In model_kv.py, the cache is a list of (k, v) tensors, one per block. On the first call the prefill runs normally and the returned caches are the K/V for every block; on each decode call, a single new token plus the cache goes in, and each block concatenates the new K/V onto the past and returns the updated cache. is_causal is only set to True when q.shape[2] == k.shape[2] (prefill) — during decode the lone query attends to all past keys with no mask needed. Position IDs are continued from past_length so wpe (the position embedding table) doesn't reset to zero on every decode step.",
        ],
      },
      {
        heading: "Training",
        body: [
          "Trained on FineWeb shards using bfloat16 autocast, gradient accumulation, gradient-norm clipping, and torch.compile — bringing per-step time from 15s down to under 5s (roughly 3×) on a single RTX 4050.",
        ],
      },
      {
        heading: "What's in the repo",
        body: [
          "train.py handles pretraining on FineWeb shards. model_kv.py is the from-scratch GPT-2 with KV cache plumbed through attention, block, and the full model. inference_kv.py runs cached generation against a fine-tuned Shakespeare checkpoint. A FastAPI backend wraps the model behind a /predict endpoint, with a small React chat frontend on top.",
        ],
      },
    ],
  },
  {
    slug: "jax-transformer",
    title: "Transformer for Machine Translation",
    oneLiner:
      "Full encoder-decoder Transformer built from scratch in JAX/Flax for English-to-Spanish translation.",
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
