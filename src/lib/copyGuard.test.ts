/* Keeps the customer-facing site free of the things that make copy read as
   machine-written: emoji used as icons, em dashes and ornament glyphs.
   Admin screens are exempt (the WhatsApp templates there use emoji on purpose). */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = join(__dirname, "..", "..");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const customerFiles = [
  join(ROOT, "index.html"),
  ...walk(join(ROOT, "src", "locales")),
  ...walk(join(ROOT, "src", "components")),
  ...walk(join(ROOT, "src", "pages")).filter((f) => !f.includes(`${sep}admin${sep}`)),
  ...walk(join(ROOT, "src", "context")),
  ...walk(join(ROOT, "src", "hooks")),
].filter((f) => /\.(tsx?|json|html)$/.test(f) && !/\.test\.tsx?$/.test(f));

// Extended_Pictographic covers emoji; ©, ® and ™ are legitimate in legal copy.
const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;
const BANNED = [
  { name: "emoji", test: (line: string) => EMOJI.test(line) },
  { name: "em dash", test: (line: string) => line.includes("—") },
  { name: "ornament glyph", test: (line: string) => /[✦❁❀]/.test(line) },
  { name: "variation selector (emoji presentation)", test: (line: string) => line.includes("️") },
];

describe("customer copy guard", () => {
  it("finds the files it is meant to scan", () => {
    expect(customerFiles.length).toBeGreaterThan(30);
  });

  for (const rule of BANNED) {
    it(`has no ${rule.name}`, () => {
      const hits: string[] = [];
      for (const file of customerFiles) {
        readFileSync(file, "utf8")
          .split("\n")
          .forEach((line, i) => {
            if (rule.test(line)) hits.push(`${relative(ROOT, file)}:${i + 1}  ${line.trim().slice(0, 90)}`);
          });
      }
      expect(hits, hits.join("\n")).toEqual([]);
    });
  }
});
