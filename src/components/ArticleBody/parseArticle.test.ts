import { parseArticle } from "./parseArticle";

test("splits headings, paragraphs and lists", () => {
  const source = [
    "Перший рядок",
    "той самий абзац.",
    "",
    "## Підзаголовок",
    "- пункт **один**",
    "- пункт два",
    "Новий абзац після списку.",
  ].join("\n");

  expect(parseArticle(source)).toEqual([
    { kind: "paragraph", text: "Перший рядок той самий абзац." },
    { kind: "heading", text: "Підзаголовок" },
    { kind: "list", items: ["пункт **один**", "пункт два"] },
    { kind: "paragraph", text: "Новий абзац після списку." },
  ]);
});

test("empty text renders nothing", () => {
  expect(parseArticle("  \n\n")).toEqual([]);
});
