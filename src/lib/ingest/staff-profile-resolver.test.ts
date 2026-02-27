import { describe, expect, it } from "vitest";
import {
  buildStaffDirectoryIndex,
  matchLeaderProfile,
  normalizeStaffName,
  parseStaffDirectoryHtml,
} from "@/lib/ingest/staff-profile-resolver";

describe("normalizeStaffName", () => {
  it("normalizes honorifics, punctuation, and case", () => {
    expect(normalizeStaffName("Dr Iain Phillips")).toBe("iain phillips");
    expect(normalizeStaffName("Professor Maria Valera-Espina")).toBe("maria valera espina");
    expect(normalizeStaffName("  Mr. Duncan   White ")).toBe("duncan white");
  });
});

describe("parseStaffDirectoryHtml", () => {
  it("extracts person names with profile and photo urls", () => {
    const html = `
      <ul>
        <li>
          <div class="person-wrapper">
            <img src="https://img.example.com/tolga.png" class="thumbnail" />
          </div>
          <div class="name-wrapper">
            <a class="name-link" href="https://profiles.imperial.ac.uk/t.birdal">
              <span class="person-name">Dr Tolga Birdal</span>
            </a>
          </div>
        </li>
      </ul>
    `;

    const parsed = parseStaffDirectoryHtml(html, "https://www.imperial.ac.uk/computing/people");
    expect(parsed).toEqual([
      {
        name: "Dr Tolga Birdal",
        normalizedName: "tolga birdal",
        profileUrl: "https://profiles.imperial.ac.uk/t.birdal",
        photoUrl: "https://img.example.com/tolga.png",
      },
    ]);
  });
});

describe("matchLeaderProfile", () => {
  it("matches leaders by normalized name and returns profile/photo urls", () => {
    const entries = parseStaffDirectoryHtml(
      `
      <ul>
        <li>
          <img src="https://img.example.com/iain.jpg" class="thumbnail" />
          <a class="name-link" href="/profiles/i.phillips">
            <span class="person-name">Dr Iain Phillips</span>
          </a>
        </li>
      </ul>
      `,
      "https://www.imperial.ac.uk/engineering/departments/computing/people/academic-staff/",
    );
    const index = buildStaffDirectoryIndex(entries);

    expect(matchLeaderProfile("Iain Phillips", index)).toEqual({
      canonicalName: "Dr Iain Phillips",
      profileUrl: "https://www.imperial.ac.uk/profiles/i.phillips",
      photoUrl: "https://img.example.com/iain.jpg",
    });
  });

  it("returns null when no directory match exists", () => {
    const index = buildStaffDirectoryIndex([]);
    expect(matchLeaderProfile("Unknown Person", index)).toBeNull();
  });
});
