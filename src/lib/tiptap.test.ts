import { describe, expect, it } from "vitest";
import { sanitizeTiptapDoc, textToTiptap, htmlToTiptapText } from "@/lib/tiptap";

describe("sanitizeTiptapDoc", () => {
  it("keeps supported nodes and marks, stays plain JSON", () => {
    const dirty = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Hi" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "bold", marks: [{ type: "bold" }, { type: "bogus" }] },
          ],
        },
      ],
    };
    const clean = sanitizeTiptapDoc(dirty);
    expect(clean).toEqual({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Hi" }] },
        { type: "paragraph", content: [{ type: "text", text: "bold", marks: [{ type: "bold" }] }] },
      ],
    });
    // Must survive a JSON round-trip unchanged (driver-safe).
    expect(JSON.parse(JSON.stringify(clean))).toEqual(clean);
  });

  it("reduces unknown nodes to their text instead of dropping words", () => {
    const clean = sanitizeTiptapDoc({
      type: "doc",
      content: [
        { type: "image", attrs: { src: "data:xxx", alt: "pic" } },
        { type: "table", content: [{ type: "tableRow", content: [{ type: "tableCell", content: [{ type: "text", text: "cell" }] }] }] },
      ],
    });
    const text = JSON.stringify(clean);
    expect(text).toContain("cell");
    expect(text).not.toContain("data:xxx");
    expect(text).not.toContain('"image"');
  });

  it("handles garbage input without throwing", () => {
    expect(sanitizeTiptapDoc(null)).toEqual({ type: "doc", content: [] });
    expect(sanitizeTiptapDoc("nope")).toEqual({ type: "doc", content: [] });
    expect(sanitizeTiptapDoc({ type: "doc" })).toEqual({ type: "doc", content: [] });
  });

  it("imported content round-trips through sanitize unchanged in shape", () => {
    const md = "# Title\n\nSome **bold** text\n\n- item one\n- item two";
    const clean = sanitizeTiptapDoc(htmlToTiptapText(md));
    expect(clean.type).toBe("doc");
    expect(clean.content.length).toBeGreaterThan(0);
    expect(JSON.parse(JSON.stringify(clean))).toEqual(clean);
    expect(sanitizeTiptapDoc(textToTiptap("plain\ntext")).content).toHaveLength(2);
  });
});
