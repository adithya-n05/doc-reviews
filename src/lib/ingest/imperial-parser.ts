type ParsedOffering = {
  code: string;
  title: string;
  studyYear: number;
  term: "autumn" | "spring" | "summer" | "autumn_spring" | "full_year" | "unknown";
  offeringType: "core" | "compulsory" | "elective" | "selective" | "extracurricular";
  degreePath: string;
  academicYearLabel: string;
};

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTerm(
  raw: string,
): "autumn" | "spring" | "summer" | "autumn_spring" | "full_year" | "unknown" {
  const text = raw.toLowerCase();
  if (text === "autumn") return "autumn";
  if (text === "spring") return "spring";
  if (text === "summer") return "summer";
  if (text.includes("autumn and spring")) return "autumn_spring";
  if (text.includes("autumn, spring and summer")) return "full_year";
  return "unknown";
}

export function normalizeOfferingType(
  raw: string,
): "core" | "compulsory" | "elective" | "selective" | "extracurricular" {
  const text = raw.toLowerCase();
  if (text.startsWith("core")) return "core";
  if (text.startsWith("compulsory")) return "compulsory";
  if (text.startsWith("selective")) return "selective";
  if (text.startsWith("extracurricular")) return "extracurricular";
  if (text.startsWith("elective")) return "elective";
  return "elective";
}

function parseCodeAndTitle(linkText: string): { code: string; title: string } | null {
  const cleaned = stripTags(linkText);
  const match = cleaned.match(/^([0-9]{5})\s+(.+)$/);
  if (!match) return null;
  return {
    code: match[1],
    title: match[2].trim(),
  };
}

export function parseDegreeStructureHtml(
  html: string,
  options: {
    studyYear: number;
    academicYearLabel: string;
  },
): ParsedOffering[] {
  const out: ParsedOffering[] = [];
  const sectionRegex = /<h1>([^<]+)<\/h1>([\s\S]*?)(?=<h1>|$)/g;
  let sectionMatch: RegExpExecArray | null = sectionRegex.exec(html);

  while (sectionMatch) {
    const degreePath = stripTags(sectionMatch[1]);
    const body = sectionMatch[2];
    const tokenRegex = /<h2>([^<]+)<\/h2>|<li><a[^>]*>([\s\S]*?)<\/a>\s*<\/li>/g;

    let currentTerm = "unknown";
    let currentOfferingType = "elective";
    let tokenMatch: RegExpExecArray | null = tokenRegex.exec(body);
    while (tokenMatch) {
      const heading = tokenMatch[1];
      const linkText = tokenMatch[2];

      if (heading) {
        const normalizedHeading = stripTags(heading);
        if (
          normalizedHeading.toLowerCase().startsWith("core") ||
          normalizedHeading.toLowerCase().startsWith("compulsory") ||
          normalizedHeading.toLowerCase().startsWith("elective") ||
          normalizedHeading.toLowerCase().startsWith("selective") ||
          normalizedHeading.toLowerCase().startsWith("extracurricular")
        ) {
          currentOfferingType = normalizedHeading;
        } else {
          currentTerm = normalizedHeading;
        }
      } else if (linkText) {
        const parsed = parseCodeAndTitle(linkText);
        if (parsed) {
          out.push({
            code: parsed.code,
            title: parsed.title,
            studyYear: options.studyYear,
            term: normalizeTerm(currentTerm),
            offeringType: normalizeOfferingType(currentOfferingType),
            degreePath,
            academicYearLabel: options.academicYearLabel,
          });
        }
      }

      tokenMatch = tokenRegex.exec(body);
    }

    sectionMatch = sectionRegex.exec(html);
  }

  return out;
}

export function parseModuleDetailHtml(html: string): {
  title: string;
  description: string;
  moduleLeaders: string[];
} {
  const titleMatch = html.match(/<div[^>]+id=["']dss-mainview["'][^>]*>[\s\S]*?<h2>([^<]+)<\/h2>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : "";

  const aimsMatch = html.match(
    /<h3>\s*Module aims\s*<\/h3>\s*<p>([\s\S]*?)<\/p>/i,
  );
  const description = aimsMatch ? stripTags(aimsMatch[1]) : "";

  const leadersMatch = html.match(
    /<h3>\s*Module leaders\s*<\/h3>([\s\S]*?)(?:<h2>|<\/div>)/i,
  );
  const moduleLeaders = leadersMatch
    ? leadersMatch[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .split("\n")
        .map((value) => stripTags(value))
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
    : [];

  return {
    title,
    description,
    moduleLeaders,
  };
}
