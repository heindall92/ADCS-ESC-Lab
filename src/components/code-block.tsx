import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  className?: string;
  showLineNumbers?: boolean;
  title?: string;
}

export function CodeBlock({ code, className, showLineNumbers = false, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = code.split("\n");

  return (
    <div className={cn("rounded-lg border border-border bg-terminal overflow-hidden", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            aria-label="Copiar código"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      )}
      <div className="relative overflow-x-auto">
        <pre className="terminal-block m-0 min-w-max border-0 p-0">
          <code className="block p-4">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span className="mr-4 select-none text-right text-code-comment w-6">{i + 1}</span>
                )}
                <span className="whitespace-pre">{renderLine(line)}</span>
              </div>
            ))}
          </code>
        </pre>
        {!title && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            aria-label="Copiar código"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}

function renderLine(line: string) {
  if (line.trim().startsWith("#")) {
    return <span className="code-comment">{line}</span>;
  }

  const tokens = line.split(/(\s+)/);
  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith("certipy-ad")) {
          return (
            <span key={i} className="code-keyword">
              {token}
            </span>
          );
        }
        if (token.startsWith("-") && token.length > 1) {
          return (
            <span key={i} className="code-string">
              {token}
            </span>
          );
        }
        if (token.startsWith("'") || token.startsWith('"')) {
          return (
            <span key={i} className="code-string">
              {token}
            </span>
          );
        }
        if (/^(ESC\d+|\d+|\$\w+|CA|DC|RPC|HTTP|HTTPS|IP)$/.test(token)) {
          return (
            <span key={i} className="code-command">
              {token}
            </span>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </>
  );
}
