import { Fragment } from "react";

type Block =
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; lines: string[] };

function renderInline(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={index} href={linkMatch[2]} className="link-underline text-supervised-ink-2">
          {linkMatch[1]}
        </a>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function parseBlocks(text: string): Block[] {
  const rawBlocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  const blocks: Block[] = [];

  for (const raw of rawBlocks) {
    const lines = raw.split("\n").filter((line) => line.trim().length > 0);
    const isUl = lines.every((line) => /^[-*]\s+/.test(line));
    const isOl = !isUl && lines.every((line) => /^\d+\.\s+/.test(line));

    if (isUl || isOl) {
      const type = isUl ? "ul" : "ol";
      const items = lines.map((line) => line.replace(isUl ? /^[-*]\s+/ : /^\d+\.\s+/, ""));
      const previous = blocks[blocks.length - 1];
      if (previous && previous.type === type) {
        previous.items.push(...items);
      } else {
        blocks.push({ type, items });
      }
      continue;
    }

    blocks.push({ type: "p", lines: lines.map((line) => line.replace(/^#+\s*/, "")) });
  }

  return blocks;
}

function renderBlock(block: Block, index: number) {
  if (block.type === "ul") {
    return (
      <ul key={index} className="list-disc pl-5">
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "ol") {
    return (
      <ol key={index} className="list-decimal pl-5">
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{renderInline(item)}</li>
        ))}
      </ol>
    );
  }

  return (
    <p key={index}>
      {block.lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 ? <br /> : null}
          {renderInline(line)}
        </Fragment>
      ))}
    </p>
  );
}

export function MarkdownAnswer({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="flex flex-col gap-2 text-supervised-sm text-supervised-ink-3">
      {blocks.map((block, index) => renderBlock(block, index))}
      <p className="text-supervised-xs text-supervised-ink-4">
        Door AI gegenereerd. Controleer belangrijke informatie zelf.
      </p>
    </div>
  );
}
