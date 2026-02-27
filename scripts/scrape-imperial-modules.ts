import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  parseDegreeStructureHtml,
  parseModuleDetailHtml,
} from "../src/lib/ingest/imperial-parser";

type YearSource = {
  url: string;
  studyYear: number;
  fallbackDegreePath: string;
};

type ModuleOffering = {
  code: string;
  title: string;
  studyYear: number;
  term: "autumn" | "spring" | "summer" | "autumn_spring" | "full_year" | "unknown";
  offeringType: "core" | "compulsory" | "elective" | "selective" | "extracurricular";
  degreePath: string;
  academicYearLabel: string;
};

type ModuleCatalogItem = {
  code: string;
  title: string;
  description: string;
  moduleLeaders: string[];
  sourceUrl: string;
  offerings: Array<{
    studyYear: number;
    term: string;
    offeringType: string;
    degreePath: string;
    academicYearLabel: string;
  }>;
};

const YEAR_SOURCES: YearSource[] = [
  {
    url: "https://www.doc.ic.ac.uk/teaching/dyn-degree-struc/curr/ug/cs/firstyear.php",
    studyYear: 1,
    fallbackDegreePath: "BEng/MEng Computing (Year 1)",
  },
  {
    url: "https://www.doc.ic.ac.uk/teaching/dyn-degree-struc/curr/ug/cs/secondyear.php",
    studyYear: 2,
    fallbackDegreePath: "BEng/MEng Computing (Year 2)",
  },
  {
    url: "https://www.doc.ic.ac.uk/teaching/dyn-degree-struc/curr/ug/cs/thirdyearbeng.php",
    studyYear: 3,
    fallbackDegreePath: "BEng Computing (Year 3)",
  },
  {
    url: "https://www.doc.ic.ac.uk/teaching/dyn-degree-struc/curr/ug/cs/thirdyearmeng.php",
    studyYear: 3,
    fallbackDegreePath: "MEng Computing (Year 3)",
  },
  {
    url: "https://www.doc.ic.ac.uk/teaching/dyn-degree-struc/curr/ug/cs/fourthyear.php",
    studyYear: 4,
    fallbackDegreePath: "MEng Computing (Year 4)",
  },
];

function normalizeDegreePath(pathValue: string, fallback: string): string {
  const trimmed = pathValue.trim();
  if (trimmed === "List of Courses" || trimmed === "Lists of Courses") {
    return fallback;
  }
  return trimmed;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; doc-reviews-scraper/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return await response.text();
}

function parseAcademicYear(html: string): string {
  const match = html.match(/Academic year\s*([0-9]{2}-[0-9]{2})/i);
  return match ? match[1] : "unknown";
}

function dedupeOfferings(offerings: ModuleOffering[]): ModuleOffering[] {
  const map = new Map<string, ModuleOffering>();
  for (const offering of offerings) {
    const key = [
      offering.code,
      offering.studyYear,
      offering.term,
      offering.offeringType,
      offering.degreePath,
    ].join("|");
    if (!map.has(key)) {
      map.set(key, offering);
    }
  }
  return Array.from(map.values());
}

async function scrapeModuleCatalogue(): Promise<ModuleCatalogItem[]> {
  const aggregatedOfferings: ModuleOffering[] = [];

  for (const source of YEAR_SOURCES) {
    const html = await fetchText(source.url);
    const academicYearLabel = parseAcademicYear(html);
    const offerings = parseDegreeStructureHtml(html, {
      studyYear: source.studyYear,
      academicYearLabel,
    }).map((offering) => ({
      ...offering,
      degreePath: normalizeDegreePath(offering.degreePath, source.fallbackDegreePath),
    }));

    aggregatedOfferings.push(...offerings);
  }

  const dedupedOfferings = dedupeOfferings(aggregatedOfferings);
  const moduleCodes = Array.from(
    new Set(dedupedOfferings.map((offering) => offering.code)),
  ).sort();

  const titleFallbackByCode = new Map<string, string>();
  for (const offering of dedupedOfferings) {
    if (!titleFallbackByCode.has(offering.code)) {
      titleFallbackByCode.set(offering.code, offering.title);
    }
  }

  const moduleDetailMap = new Map<
    string,
    {
      title: string;
      description: string;
      moduleLeaders: string[];
      sourceUrl: string;
    }
  >();

  for (const code of moduleCodes) {
    const sourceUrl = `https://www.imperial.ac.uk/engineering/departments/computing/current-students/courses/${code}/`;
    try {
      const html = await fetchText(sourceUrl);
      const detail = parseModuleDetailHtml(html);
      moduleDetailMap.set(code, {
        title: detail.title || titleFallbackByCode.get(code) || code,
        description: detail.description,
        moduleLeaders: detail.moduleLeaders,
        sourceUrl,
      });
    } catch {
      moduleDetailMap.set(code, {
        title: titleFallbackByCode.get(code) || code,
        description: "",
        moduleLeaders: [],
        sourceUrl,
      });
    }
  }

  const modules = moduleCodes.map((code) => {
    const detail = moduleDetailMap.get(code);
    return {
      code,
      title: detail?.title ?? titleFallbackByCode.get(code) ?? code,
      description: detail?.description ?? "",
      moduleLeaders: detail?.moduleLeaders ?? [],
      sourceUrl:
        detail?.sourceUrl ??
        `https://www.imperial.ac.uk/engineering/departments/computing/current-students/courses/${code}/`,
      offerings: dedupedOfferings
        .filter((offering) => offering.code === code)
        .map((offering) => ({
          studyYear: offering.studyYear,
          term: offering.term,
          offeringType: offering.offeringType,
          degreePath: offering.degreePath,
          academicYearLabel: offering.academicYearLabel,
        })),
    };
  });

  return modules;
}

async function main() {
  const modules = await scrapeModuleCatalogue();
  const output = {
    generatedAt: new Date().toISOString(),
    source: "Imperial DoC dynamic degree structure pages + module pages",
    moduleCount: modules.length,
    modules,
  };

  const outputDir = path.join(process.cwd(), "data");
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "module-catalog.json");
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${modules.length} modules to ${outputPath}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
