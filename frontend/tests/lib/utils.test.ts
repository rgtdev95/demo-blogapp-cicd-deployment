import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Utils", () => {
    describe("cn (className merger)", () => {
        it("merges class names", () => {
            const result = cn("class1", "class2");
            expect(result).toBe("class1 class2");
        });

        it("handles conditional classes", () => {
            const result = cn("base", false && "hidden", true && "visible");
            expect(result).toBe("base visible");
        });

        it("handles undefined and null", () => {
            const result = cn("base", undefined, null, "end");
            expect(result).toBe("base end");
        });

        it("merges tailwind classes correctly", () => {
            const result = cn("px-2 py-1", "px-4");
            // Should keep only px-4 (later override)
            expect(result).toContain("px-4");
            expect(result).toContain("py-1");
        });
    });
});
