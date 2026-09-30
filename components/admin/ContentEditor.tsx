"use client";

import { useState, useTransition } from "react";

import { BLOCK_TYPES, emptyBlock, type Block } from "@/lib/content";
import ContentRenderer from "@/components/ContentRenderer";
import { saveContent } from "@/app/admin/actions";

/**
 * Block-based learning-content editor (§13/§19).
 * Save Draft stores to draftBlocks; Publish promotes to the live blocks.
 */
export default function ContentEditor({
  chapterId,
  initial,
  hasDraft,
}: {
  chapterId: string;
  initial: Block[];
  hasDraft: boolean;
}) {
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [preview, setPreview] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function patch(i: number, next: Partial<Block>) {
    setBlocks((prev) =>
      prev.map((b, n) => (n === i ? ({ ...b, ...next } as Block) : b)),
    );
  }

  function add(type: Block["type"]) {
    setBlocks((prev) => [...prev, emptyBlock(type)]);
  }

  function remove(i: number) {
    setBlocks((prev) => prev.filter((_, n) => n !== i));
  }

  function swap(i: number, j: number) {
    if (j < 0 || j >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function save(publish: boolean) {
    setMsg(null);
    start(async () => {
      try {
        await saveContent(chapterId, JSON.stringify(blocks), publish);
        setMsg(publish ? "Published — students can see this now." : "Draft saved.");
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Could not save.");
      }
    });
  }

  return (
    <div className="editor">
      <div className="editor-bar">
        <button
          className={`btn btn-g btn-sm${preview ? "" : " on"}`}
          onClick={() => setPreview(false)}
          type="button"
        >
          Edit
        </button>
        <button
          className={`btn btn-g btn-sm${preview ? " on" : ""}`}
          onClick={() => setPreview(true)}
          type="button"
        >
          Preview
        </button>

        <span className="spacer" />

        {hasDraft && !preview && <span className="pill-s draft">Unpublished draft</span>}

        <button
          className="btn btn-g btn-sm"
          onClick={() => save(false)}
          disabled={pending}
          type="button"
        >
          Save draft
        </button>
        <button
          className="btn btn-p btn-sm"
          onClick={() => save(true)}
          disabled={pending}
          type="button"
        >
          {pending ? "Saving…" : "Publish"}
        </button>
      </div>

      {msg && <p className="fnote on">{msg}</p>}

      {preview ? (
        <div className="editor-preview">
          <ContentRenderer blocks={blocks} />
        </div>
      ) : (
        <>
          {blocks.length === 0 && (
            <div className="empty">
              <b>Empty chapter</b>
              Add your first block below.
            </div>
          )}

          {blocks.map((block, i) => (
            <div className="blk" key={i}>
              <div className="blk-hd">
                <b>{BLOCK_TYPES.find((t) => t.type === block.type)?.label ?? block.type}</b>
                <div className="blk-acts">
                  <button type="button" onClick={() => swap(i, i - 1)} title="Move up">
                    ↑
                  </button>
                  <button type="button" onClick={() => swap(i, i + 1)} title="Move down">
                    ↓
                  </button>
                  <button type="button" onClick={() => remove(i)} title="Remove">
                    ✕
                  </button>
                </div>
              </div>

              <div className="blk-bd">
                {(block.type === "heading" ||
                  block.type === "subheading" ||
                  block.type === "paragraph") && (
                  <textarea
                    rows={block.type === "paragraph" ? 4 : 1}
                    value={block.text}
                    placeholder="Text…"
                    onChange={(e) => patch(i, { text: e.target.value } as Partial<Block>)}
                  />
                )}

                {block.type === "list" && (
                  <>
                    <label className="chk">
                      <input
                        type="checkbox"
                        checked={Boolean(block.ordered)}
                        onChange={(e) =>
                          patch(i, { ordered: e.target.checked } as Partial<Block>)
                        }
                      />
                      Numbered list
                    </label>
                    <textarea
                      rows={4}
                      value={block.items.join("\n")}
                      placeholder="One item per line"
                      onChange={(e) =>
                        patch(i, { items: e.target.value.split("\n") } as Partial<Block>)
                      }
                    />
                  </>
                )}

                {block.type === "table" && (
                  <>
                    <input
                      value={block.headers.join(" | ")}
                      placeholder="Header 1 | Header 2"
                      onChange={(e) =>
                        patch(i, {
                          headers: e.target.value.split("|").map((s) => s.trim()),
                        } as Partial<Block>)
                      }
                    />
                    <textarea
                      rows={4}
                      value={block.rows.map((r) => r.join(" | ")).join("\n")}
                      placeholder={"Cell | Cell\nCell | Cell"}
                      onChange={(e) =>
                        patch(i, {
                          rows: e.target.value
                            .split("\n")
                            .map((line) => line.split("|").map((s) => s.trim())),
                        } as Partial<Block>)
                      }
                    />
                    <p className="fhint">One row per line, cells separated by |</p>
                  </>
                )}

                {(block.type === "image" ||
                  block.type === "link" ||
                  block.type === "pdf" ||
                  block.type === "video") && (
                  <>
                    <input
                      value={block.url}
                      placeholder="https://…  (or an uploaded file URL)"
                      onChange={(e) => patch(i, { url: e.target.value } as Partial<Block>)}
                    />
                    <input
                      value={
                        block.type === "image"
                          ? (block.alt ?? "")
                          : block.type === "video"
                            ? (block.title ?? "")
                            : (block.label ?? "")
                      }
                      placeholder={
                        block.type === "image"
                          ? "Alt text (describe the diagram)"
                          : block.type === "video"
                            ? "Title"
                            : "Link label"
                      }
                      onChange={(e) =>
                        patch(
                          i,
                          (block.type === "image"
                            ? { alt: e.target.value }
                            : block.type === "video"
                              ? { title: e.target.value }
                              : { label: e.target.value }) as Partial<Block>,
                        )
                      }
                    />
                    {block.type === "image" && (
                      <input
                        value={block.caption ?? ""}
                        placeholder="Caption (optional)"
                        onChange={(e) =>
                          patch(i, { caption: e.target.value } as Partial<Block>)
                        }
                      />
                    )}
                  </>
                )}

                {block.type === "note" && (
                  <>
                    <div className="selwrap">
                      <select
                        value={block.variant ?? "info"}
                        onChange={(e) =>
                          patch(i, {
                            variant: e.target.value as "info" | "warning",
                          } as Partial<Block>)
                        }
                      >
                        <option value="info">Important note</option>
                        <option value="warning">Warning / caution</option>
                      </select>
                    </div>
                    <input
                      value={block.title ?? ""}
                      placeholder="Note title (optional)"
                      onChange={(e) => patch(i, { title: e.target.value } as Partial<Block>)}
                    />
                    <textarea
                      rows={3}
                      value={block.text}
                      placeholder="Note text…"
                      onChange={(e) => patch(i, { text: e.target.value } as Partial<Block>)}
                    />
                  </>
                )}
              </div>
            </div>
          ))}

          <div className="blk-add">
            <span>Add block:</span>
            {BLOCK_TYPES.map((t) => (
              <button
                key={t.type}
                className="btn btn-g btn-sm"
                type="button"
                onClick={() => add(t.type)}
              >
                + {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
