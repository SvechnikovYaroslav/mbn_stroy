function inline(value: string) {
  const parts = value.split(/(https?:\/\/[^\s*]+|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return <a key={index} href={part} className="underline underline-offset-4 hover:text-foreground">{part}</a>;
    }
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

export function LegalMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const nodes: React.ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (list.length) nodes.push(<ul key={`list-${nodes.length}`} className="list-disc space-y-2 pl-5">{list.map((item, index) => <li key={index}>{inline(item)}</li>)}</ul>);
    list = [];
  };
  for (const line of lines) {
    const bullet = line.match(/^[-*]\s+(.+)/);
    if (bullet) { list.push(bullet[1]); continue; }
    flushList();
    if (!line.trim()) continue;
    if (line.startsWith("# ")) nodes.push(<h1 key={nodes.length} className="text-h1 text-foreground">{inline(line.slice(2))}</h1>);
    else if (line.startsWith("## ")) nodes.push(<h2 key={nodes.length} className="mt-10 text-h2 text-foreground">{inline(line.slice(3))}</h2>);
    else if (/^\*\*Редакция:|^\*\*Дата вступления/.test(line)) nodes.push(<p key={nodes.length} className="text-small text-muted-foreground">{inline(line)}</p>);
    else nodes.push(<p key={nodes.length} className="text-body text-muted-foreground">{inline(line)}</p>);
  }
  flushList();
  return <article className="max-w-3xl space-y-4">{nodes}</article>;
}
