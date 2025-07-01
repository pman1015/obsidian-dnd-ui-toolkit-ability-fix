import { describe, it, expect, vi } from "vitest";
import { hasTemplateVariables, processTemplate, createTemplateContext } from "./template";
import type { TemplateContext } from "./template";

describe("template", () => {
  describe("hasTemplateVariables", () => {
    it("should detect template variables", () => {
      expect(hasTemplateVariables("Hello {{name}}")).toBe(true);
      expect(hasTemplateVariables("{{value}} is {{other}}")).toBe(true);
      expect(hasTemplateVariables("No variables here")).toBe(false);
      expect(hasTemplateVariables("{{ spaced }}")).toBe(true);
      expect(hasTemplateVariables("{single}")).toBe(false);
      expect(hasTemplateVariables("")).toBe(false);
    });
  });

  describe("processTemplate", () => {
    const mockContext: TemplateContext = {
      frontmatter: { proficiency_bonus: 2 },
      abilities: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      },
      skills: {
        proficiencies: ["Athletics"],
        expertise: [],
        half_proficiencies: [],
        bonuses: [],
      },
    };

    it("should process templates with context variables and math helpers", () => {
      expect(processTemplate("Strength: {{abilities.strength}}", mockContext)).toBe("Strength: 15");
      expect(processTemplate("Proficiency: +{{frontmatter.proficiency_bonus}}", mockContext)).toBe("Proficiency: +2");
      expect(processTemplate("{{add 5 3}}", mockContext)).toBe("8");
      expect(processTemplate("{{subtract 10 4}}", mockContext)).toBe("6");
      expect(processTemplate("{{multiply 3 4}}", mockContext)).toBe("12");
      expect(processTemplate("{{divide 15 3}}", mockContext)).toBe("5");
      expect(processTemplate("{{floor 3.7}}", mockContext)).toBe("3");
      expect(processTemplate("{{ceil 3.2}}", mockContext)).toBe("4");
      expect(processTemplate("{{round 3.6}}", mockContext)).toBe("4");
    });

    it("should handle multiple arguments in add helper and modifier calculations", () => {
      expect(processTemplate("{{add 1 2 3 4}}", mockContext)).toBe("10");
      expect(processTemplate("{{add abilities.strength frontmatter.proficiency_bonus}}", mockContext)).toBe("17");
      expect(processTemplate("STR modifier: {{modifier abilities.strength}}", mockContext)).toBe("STR modifier: 2");
      expect(processTemplate("CHA modifier: {{modifier abilities.charisma}}", mockContext)).toBe("CHA modifier: -1");
    });

    it("should return original text when no template variables", () => {
      expect(processTemplate("No templates here", mockContext)).toBe("No templates here");
    });
  });

  describe("createTemplateContext", () => {
    it("should create context with calculated ability scores including bonuses", () => {
      const mockElement = {} as HTMLElement;
      const mockFileContext = {
        frontmatter: () => ({ proficiency_bonus: 2 }),
        md: () => ({
          getSectionInfo: vi.fn().mockReturnValue({
            text: `
\`\`\`ability
abilities:
  strength: 15
  dexterity: 12
bonuses:
  - name: "Belt of Giant Strength"
    target: "strength"
    value: 4
    modifies: "score"
  - name: "Saving Throw Bonus"
    target: "dexterity"
    value: 2
    modifies: "saving_throw"
\`\`\`
`,
          }),
        }),
      } as any;

      const context = createTemplateContext(mockElement, mockFileContext);

      // Strength should be 15 + 4 = 19 (score bonus applied)
      expect(context.abilities.strength).toBe(19);
      // Dexterity should remain 12 (saving throw bonus doesn't affect score)
      expect(context.abilities.dexterity).toBe(12);
      // Other abilities should remain 0 (default values)
      expect(context.abilities.constitution).toBe(0);
    });

    it("should handle missing ability blocks gracefully", () => {
      const mockElement = {} as HTMLElement;
      const mockFileContext = {
        frontmatter: () => ({ proficiency_bonus: 2 }),
        md: () => ({
          getSectionInfo: vi.fn().mockReturnValue({
            text: "No ability blocks here",
          }),
        }),
      } as any;

      const context = createTemplateContext(mockElement, mockFileContext);

      // Should use default values when no ability block found
      expect(context.abilities.strength).toBe(0);
      expect(context.abilities.dexterity).toBe(0);
      expect(context.frontmatter.proficiency_bonus).toBe(2);
    });
  });
});
