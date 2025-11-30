import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
    it("renders button with text", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("renders button with variant", () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByText("Delete");
        expect(button).toBeInTheDocument();
    });

    it("renders disabled button", () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByText("Disabled");
        expect(button).toBeDisabled();
    });

    it("handles click events", async () => {
        let clicked = false;
        const handleClick = () => {
            clicked = true;
        };

        render(<Button onClick={handleClick}>Click me</Button>);
        const button = screen.getByText("Click me");
        button.click();

        expect(clicked).toBe(true);
    });
});
