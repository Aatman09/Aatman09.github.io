/**
 * Running text from the data files. Anything between backticks is a code
 * identifier and is set in mono so it reads as a name, not as a sentence.
 */
export default function Prose({ text }: { text: string }) {
  return text.split("`").map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="font-mono text-[0.92em] text-ink">
        {part}
      </code>
    ) : (
      part
    ),
  );
}
