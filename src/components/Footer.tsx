const contacts = [
  { href: "mailto:aatmansoni2006@gmail.com", label: "Email" },
  { href: "https://github.com/Aatman09", label: "GitHub" },
  {
    href: "https://www.linkedin.com/in/aatman-soni-045505285/",
    label: "LinkedIn",
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-[68rem] flex-col gap-3 px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="label text-graphite">
          © {new Date().getFullYear()} Aatman Soni
        </p>
        <div className="flex gap-6">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="label text-graphite transition-colors hover:text-ink"
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
