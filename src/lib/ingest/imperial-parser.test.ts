import { describe, expect, it } from "vitest";
import {
  normalizeOfferingType,
  normalizeTerm,
  parseDegreeStructureHtml,
  parseModuleDetailHtml,
} from "@/lib/ingest/imperial-parser";

describe("normalizeTerm", () => {
  it("maps common term labels", () => {
    expect(normalizeTerm("Autumn")).toBe("autumn");
    expect(normalizeTerm("Spring")).toBe("spring");
    expect(normalizeTerm("Summer")).toBe("summer");
    expect(normalizeTerm("Autumn and Spring")).toBe("autumn_spring");
    expect(normalizeTerm("Autumn, Spring and Summer")).toBe("full_year");
    expect(normalizeTerm("Unknown Term")).toBe("unknown");
  });
});

describe("normalizeOfferingType", () => {
  it("maps offering type headings", () => {
    expect(normalizeOfferingType("Core")).toBe("core");
    expect(normalizeOfferingType("Compulsory")).toBe("compulsory");
    expect(normalizeOfferingType("Elective")).toBe("elective");
    expect(normalizeOfferingType("Selective 1")).toBe("selective");
    expect(normalizeOfferingType("Extracurricular")).toBe("extracurricular");
    expect(normalizeOfferingType("Unknown")).toBe("elective");
  });
});

describe("parseDegreeStructureHtml", () => {
  it("extracts numeric-coded modules with terms and offering type", () => {
    const html = `
      <h1>MEng Computing - Artificial Intelligence and Machine Learning</h1>
      <h2>Core</h2>
      <h2>Autumn</h2>
      <ul class="link-list">
        <li><a>70012 Industrial Placement (Part 2)</a></li>
      </ul>
      <h2>Selective 1</h2>
      <h2>Spring</h2>
      <ul class="link-list">
        <li><a>70010 Deep Learning</a></li>
        <li><a>BUSI60041 Entrepreneurship</a></li>
      </ul>
    `;

    const result = parseDegreeStructureHtml(html, {
      studyYear: 4,
      academicYearLabel: "25-26",
    });

    expect(result).toEqual([
      {
        code: "70012",
        title: "Industrial Placement (Part 2)",
        studyYear: 4,
        term: "autumn",
        offeringType: "core",
        degreePath: "MEng Computing - Artificial Intelligence and Machine Learning",
        academicYearLabel: "25-26",
      },
      {
        code: "70010",
        title: "Deep Learning",
        studyYear: 4,
        term: "spring",
        offeringType: "selective",
        degreePath: "MEng Computing - Artificial Intelligence and Machine Learning",
        academicYearLabel: "25-26",
      },
    ]);
  });
});

describe("parseModuleDetailHtml", () => {
  it("extracts title, aims paragraph, and leader names", () => {
    const html = `
      <div id="dss-mainview">
        <h2>Deep Learning</h2>
        <h3>Module aims</h3>
        <p>This module covers deep neural models.</p>
        <h3>Module leaders</h3>
          Dr A Example
          <br />
          Professor B Example
          <br />
      </div>
    `;

    const result = parseModuleDetailHtml(html);
    expect(result).toEqual({
      title: "Deep Learning",
      description: "This module covers deep neural models.",
      moduleLeaders: ["Dr A Example", "Professor B Example"],
    });
  });

  it("falls back when leaders/description are absent", () => {
    const html = `<div id="dss-mainview"><h2>Module TBC</h2></div>`;
    const result = parseModuleDetailHtml(html);

    expect(result).toEqual({
      title: "Module TBC",
      description: "",
      moduleLeaders: [],
    });
  });

  it("includes aims bullet points and decodes html entities", () => {
    const html = `
      <div id="dss-mainview">
        <h2>Logic-Based Learning</h2>
        <h3>Module aims</h3>
        <p>In this module you will have the opportunity to:</p>
        <ul>
          <li>develop robust inference skills</li>
          <li>evaluate models under uncertainty</li>
        </ul>
        <p>[Formerly &quot;Methods and Tools in the Theory of Computing&quot;]</p>
        <h3>Module leaders</h3>
          Dr C Example
      </div>
    `;

    const result = parseModuleDetailHtml(html);
    expect(result.description).toContain("In this module you will have the opportunity to:");
    expect(result.description).toContain("develop robust inference skills");
    expect(result.description).toContain("evaluate models under uncertainty");
    expect(result.description).toContain("[Formerly \"Methods and Tools in the Theory of Computing\"]");
  });
});
