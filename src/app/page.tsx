import Link from "next/link";
import Cited from "@/components/Cited";
import Astronaut from "@/components/Astronaut";
import Starfield from "@/components/Starfield";

// Empty fields are left out of the hero.
const education = {
  university: "",
  classOf: "",
};

const contacts = [
  { href: "https://github.com/Aatman09", label: "GitHub" },
  {
    href: "https://www.linkedin.com/in/aatman-soni-045505285/",
    label: "LinkedIn",
  },
];

export default function Home() {
  return (
    <>
      <Starfield />
      <Astronaut />

      {/* Hero */}
      <section data-landing className="relative w-full">
        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] md:min-h-[calc(100svh-10.5rem)] w-full max-w-[68rem] flex-col justify-end px-6 pb-14 pt-28 md:pb-16">
          <blockquote
            data-field-avoid
            className="font-mono text-sm lowercase leading-relaxed tracking-[0.02em] text-graphite"
          >
            built from scratch,
            <br />
            measured against the alternative
            <span
              aria-hidden="true"
              className="cursor-blink ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-ink"
            />
          </blockquote>

          <div
            data-field-avoid
            className="mt-9 max-w-[54rem] space-y-2 font-mono text-[0.9375rem] leading-7 text-ink"
          >
            <h1 className="font-normal">I&apos;m Aatman.</h1>
            <p>
              B.Tech CSE student
              {education.university && ` at ${education.university}`}, seeking
              ML / SDE internships.
            </p>
            <p>
              I build ML systems from scratch, then measure them: int8 for{" "}
              <Cited slug="gemma2-quant">Gemma 2</Cited>, a KV-cache decoder
              for <Cited slug="cachegpt">GPT-2</Cited>, a ConvNeXt port in{" "}
              <Cited slug="bonsai">jax-ml/bonsai</Cited>.
            </p>
            <p>
              Before that, a Graph RAG system at{" "}
              <Cited
                href="/experience"
                title="SilverTouch Technologies — AI / ML Intern"
                blurb="Section reconstruction on PaddleOCR-VL; served a VLM on vLLM for entity extraction."
              >
                SilverTouch
              </Cited>
              .
            </p>
          </div>

          <p
            data-field-avoid
            className="mt-7 flex w-fit flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.875rem] text-graphite"
          >
            <Link
              href="/projects"
              className="pointer-events-auto text-ink underline decoration-1 underline-offset-[5px] transition-colors hover:text-accent-text"
            >
              projects →
            </Link>
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
            <a
              href="mailto:aatmansoni2006@gmail.com"
              className="pointer-events-auto underline decoration-1 underline-offset-[5px] transition-colors hover:text-ink"
            >
              email
            </a>
            {contacts.map((c) => (
              <span key={c.label} className="flex items-center gap-3">
                <span aria-hidden="true" className="opacity-40">
                  /
                </span>
                <a
                  href={c.href}
                  className="pointer-events-auto underline decoration-1 underline-offset-[5px] transition-colors hover:text-ink"
                >
                  {c.label.toLowerCase()}
                </a>
              </span>
            ))}
          </p>
        </div>
      </section>

    </>
  );
}
