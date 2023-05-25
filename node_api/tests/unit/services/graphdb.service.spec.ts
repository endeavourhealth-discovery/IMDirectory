import { desanitise, sanitise } from "@/services/graphdb.service";
import { describe, it, expect } from "vitest";

describe("graphdb service", () => {
  describe("desanitise", () => {
    it("can desanitise", () => {
      expect(
        desanitise(
          '"{`version`:`v2.4.0`,`title`:`v2.4.0 Release`,`createdDate`:`30/2/2023 15:39:11`,`publishedDate`:`30/2/2023 16:49:7`,`releaseNotes`:[`- Numerous visual improvements`,`- Icon updates (Font Awesome Pro)`,`- Themes`,`- Search optimisations`,`- ECL builder extensions`,`- Data model viewer enhancements`,`- Java code generation`,`- Latest SNOMED`,`- Query display enhancements`,`- Improved error handling & reporting`],`author`:`VororRich`,`url`:`https://github.com/endeavourhealth-discovery/IMDirectory/releases/tag/v2.4.0`}"'
        )
      ).toEqual({
        version: "v2.4.0",
        title: "v2.4.0 Release",
        createdDate: "30/2/2023 15:39:11",
        publishedDate: "30/2/2023 16:49:7",
        releaseNotes: [
          "- Numerous visual improvements",
          "- Icon updates (Font Awesome Pro)",
          "- Themes",
          "- Search optimisations",
          "- ECL builder extensions",
          "- Data model viewer enhancements",
          "- Java code generation",
          "- Latest SNOMED",
          "- Query display enhancements",
          "- Improved error handling & reporting"
        ],
        author: "VororRich",
        url: "https://github.com/endeavourhealth-discovery/IMDirectory/releases/tag/v2.4.0"
      });
    });
  });

  describe("sanitise", () => {
    it("can sanitise", () => {
      expect(
        sanitise({
          version: "v2.4.0",
          title: "v2.4.0 Release",
          createdDate: "30/2/2023 15:39:11",
          publishedDate: "30/2/2023 16:49:7",
          releaseNotes: [
            "- Numerous visual improvements",
            "- Icon updates (Font Awesome Pro)",
            "- Themes",
            "- Search optimisations",
            "- ECL builder extensions",
            "- Data model viewer enhancements",
            "- Java code generation",
            "- Latest SNOMED",
            "- Query display enhancements",
            "- Improved error handling & reporting"
          ],
          author: "VororRich",
          url: "https://github.com/endeavourhealth-discovery/IMDirectory/releases/tag/v2.4.0"
        })
      ).toBe(
        "'{`version`:`v2.4.0`,`title`:`v2.4.0 Release`,`createdDate`:`30/2/2023 15:39:11`,`publishedDate`:`30/2/2023 16:49:7`,`releaseNotes`:[`- Numerous visual improvements`,`- Icon updates (Font Awesome Pro)`,`- Themes`,`- Search optimisations`,`- ECL builder extensions`,`- Data model viewer enhancements`,`- Java code generation`,`- Latest SNOMED`,`- Query display enhancements`,`- Improved error handling & reporting`],`author`:`VororRich`,`url`:`https://github.com/endeavourhealth-discovery/IMDirectory/releases/tag/v2.4.0`}'"
      );
    });
  });
});
