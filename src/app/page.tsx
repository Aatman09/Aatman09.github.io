import Link from "next/link";
import Cited from "@/components/Cited";
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

      {/* Hero */}
      <section className="relative w-full">
        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100svh-10rem)] w-full max-w-[68rem] flex-col justify-center px-6 pb-16 pt-28">
          <h1
            data-field-avoid
            className="max-w-[16ch] font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[4.5rem] lg:text-[5.5rem]"
          >
            I build ML systems from scratch, then measure them.
            <span
              aria-hidden="true"
              className="cursor-blink ml-2 inline-block h-[0.8em] w-[0.12em] translate-y-[0.06em] bg-signal"
            />
          </h1>

          <div
            data-field-avoid
            className="mt-8 max-w-xl space-y-2 font-mono text-[0.875rem] leading-7 text-graphite">
            <p>
              Aatman Soni · B.Tech CSE
              {education.university && ` · ${education.university}`} · seeking
              ML / SDE internships
            </p>
            <p>
              Recently: int8 for{" "}
              <Cited slug="gemma2-quant">Gemma 2</Cited>, a KV-cache decoder
              for <Cited slug="cachegpt">GPT-2</Cited>, a ConvNeXt port in{" "}
              <Cited slug="bonsai">jax-ml/bonsai</Cited>.
            </p>
          </div>

          <p
            data-field-avoid
            className="mt-7 flex w-fit flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.875rem]">
            <a
              href="mailto:aatmansoni2006@gmail.com"
              className="pointer-events-auto bg-ink px-4 py-2.5 text-paper transition-colors hover:bg-accent-text"
            >
              Get in touch
            </a>
            <Link
              href="/projects"
              className="pointer-events-auto text-ink underline decoration-1 underline-offset-[5px] transition-colors hover:text-accent-text"
            >
              view work →
            </Link>
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="pointer-events-auto text-graphite underline decoration-1 underline-offset-[5px] transition-colors hover:text-ink"
              >
                {c.label.toLowerCase()}
              </a>
            ))}
          </p>
        </div>
      </section>

    </>
  );
}
