import { describe, expect, it } from "vitest";
import { parseRichText } from "./richText";

// Shortened from the live Maa Baglamukhi temple description.
const BAGLAMUKHI = `Maa Baglamukhi Dham, Haridwar: An Awakened Tantric Siddhapeeth

Located on the holy land of Haridwar, 'Maa Baglamukhi Dham' is no ordinary temple. It is a highly powerful and awakened Siddhapeeth.

Temple Form and Divine Atmosphere:

The Prominence of Yellow (Pitambar): Upon entering the temple premises, you immediately feel an intense divine energy.

The Form of Stambhan (Paralyzing Power): The sanctum sanctorum houses a highly captivating and fierce idol of Maa Baglamukhi.

Specialized Tantric Hawans & Rituals:

The most distinct feature of this Dham is the highly specialized spiritual rituals conducted here.

Location and Serenity:
This miraculous Dham is located slightly away from the noise and hustle of the main Haridwar city.`;

describe("parseRichText", () => {
  it("finds the headings, bold labels and paragraphs in a real temple description", () => {
    const blocks = parseRichText(BAGLAMUKHI);
    expect(blocks.filter((b) => b.type === "heading").map((b) => b.type === "heading" && b.text)).toEqual([
      "Maa Baglamukhi Dham, Haridwar: An Awakened Tantric Siddhapeeth",
      "Temple Form and Divine Atmosphere",
      "Specialized Tantric Hawans & Rituals",
      "Location and Serenity",
    ]);
    const labels = blocks.flatMap((b) => (b.type === "paragraph" && b.label ? [b.label] : []));
    expect(labels).toEqual(["The Prominence of Yellow (Pitambar)", "The Form of Stambhan (Paralyzing Power)"]);
    expect(blocks).toHaveLength(9);
  });

  it("keeps a short sentence that ends with a full stop as a paragraph", () => {
    expect(parseRichText("Pandit ji performs it.")).toEqual([{ type: "paragraph", text: "Pandit ji performs it." }]);
  });

  it("treats the Hindi danda as a full stop and still finds Hindi headings", () => {
    const blocks = parseRichText("मंदिर का इतिहास:\nयह मंदिर बहुत पुराना है।");
    expect(blocks).toEqual([
      { type: "heading", text: "मंदिर का इतिहास" },
      { type: "paragraph", text: "यह मंदिर बहुत पुराना है।" },
    ]);
  });

  it("groups consecutive bullets into one list", () => {
    const blocks = parseRichText("What you get:\n- Video on WhatsApp\n• Prasad at home\n\nThat is all for this pooja today.");
    expect(blocks[1]).toEqual({ type: "list", items: ["Video on WhatsApp", "Prasad at home"] });
    expect(blocks).toHaveLength(3);
  });

  it("handles Windows line endings and empty input", () => {
    expect(parseRichText("Heading here\r\n\r\nA long first paragraph that is clearly a sentence.")).toHaveLength(2);
    expect(parseRichText("")).toEqual([]);
    expect(parseRichText(null)).toEqual([]);
  });

  it("does not bold a URL or a label that is really a whole sentence", () => {
    const url = parseRichText("Watch the full aarti on our channel at https://youtube.com/@narayankripa every single morning.");
    expect(url[0]).toMatchObject({ type: "paragraph" });
    expect(url[0]).not.toHaveProperty("label");
    const sentence = parseRichText("He said. Then later: the pooja began at the temple early in the morning with all the family.");
    expect(sentence[0]).not.toHaveProperty("label");
  });

  it("breaks a long paragraph pasted with no line breaks at sentence ends", () => {
    // Like the live Hindi temple text: one line, no space after the danda.
    const hindi = "मंदिर का स्वरूप बहुत सुंदर और दिव्य है।".repeat(25);
    const paras = parseRichText(hindi);
    expect(paras.length).toBeGreaterThan(2);
    expect(paras.every((b) => b.type === "paragraph" && b.text.endsWith("।"))).toBe(true);

    // A decimal like 1.25 is not a sentence end.
    const english = "The 1.25 lakh jaap is done over nine days by the temple pandits. ".repeat(12).trim();
    const blocks = parseRichText(english);
    expect(blocks.length).toBeGreaterThan(1);
    expect(blocks.some((b) => b.type === "paragraph" && /\b1\.$/.test(b.text))).toBe(false);
  });
});
