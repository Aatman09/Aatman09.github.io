export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200/80 py-8 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-500">
        <p>© {new Date().getFullYear()} Aatman Soni <span className="mx-1 text-zinc-300 dark:text-zinc-700">/</span> ML engineer in progress</p>
        <div className="flex gap-4">
          <a
            href="mailto:aatmansoni2006@gmail.com"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/aatman-soni-045505285/"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/Aatman09"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
