import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";

interface FileItem {
  name: string;
  size: number;
  file: File;
}

interface Props {
  onFilesChange: (files: FileItem[]) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DragDropZone({ onFilesChange }: Props) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const counterRef = useRef(0);

  const update = useCallback((next: FileItem[]) => {
    setFiles(next);
    onFilesChange(next);
  }, [onFilesChange]);

  function add(incoming: FileList | File[]) {
    const next = [...files, ...Array.from(incoming).map(f => ({ name: f.name, size: f.size, file: f }))];
    update(next);
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    counterRef.current++;
    setDragover(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    counterRef.current--;
    if (counterRef.current <= 0) {
      counterRef.current = 0;
      setDragover(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragover(false);
    counterRef.current = 0;
    if (e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragover ? "var(--color-accent)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-md)",
        padding: "var(--space-8)",
        textAlign: "center",
        cursor: "pointer",
        background: dragover ? "var(--color-accent-subtle)" : "var(--color-bg-surface)",
        transition: "border-color 150ms var(--ease-out), background 150ms var(--ease-out)",
        marginBottom: files.length > 0 ? "var(--space-4)" : 0,
      }}
    >
      <Upload size={28} strokeWidth={1.5} style={{ margin: "0 auto var(--space-3)", color: dragover ? "var(--color-accent-text)" : "var(--color-text-tertiary)" }} />
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-15)",
        fontWeight: "var(--weight-display-medium)",
        color: dragover ? "var(--color-accent-text)" : "var(--color-text-primary)",
        marginBottom: "var(--space-1)",
      }}>
        {dragover ? "Drop files here" : "Drag & drop files here"}
      </p>
      <p style={{ fontSize: "var(--text-13)", color: "var(--color-text-tertiary)" }}>
        PDF, DOCX, Markdown, TXT — or click to browse
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.md,.txt,.csv,.pptx,.xlsx"
        onChange={e => { if (e.target.files?.length) add(e.target.files); e.target.value = ""; }}
        style={{ display: "none" }}
      />
    </div>
  );
}

export function FileList({ files, onRemove }: { files: FileItem[]; onRemove: (i: number) => void }) {
  if (!files.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", marginBottom: "var(--space-6)" }}>
      {files.map((f, i) => (
        <div key={`${f.name}-${i}`} style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-2) var(--space-3)",
          background: "var(--color-bg-elevated)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
        }}>
          <FileText size={16} strokeWidth={1.5} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: "var(--text-13)", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f.name}
          </span>
          <span style={{ fontSize: "var(--text-12)", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
            {formatBytes(f.size)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-tertiary)",
              cursor: "pointer",
              padding: "var(--space-1)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
            }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
}
