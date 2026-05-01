import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

vi.stubGlobal("fetch", vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      candidates: [{ content: { parts: [{ text: "Test response" }] } }]
    })
  })
));

describe("ElectIQ App", () => {
  it("renders the app header", () => {
    render(<App />);
    expect(screen.getByText("ElectIQ")).toBeInTheDocument();
  });

  it("renders the timeline tab by default", () => {
    render(<App />);
    expect(screen.getByText("Election phases — Lok Sabha")).toBeInTheDocument();
  });

  it("renders all 7 election phases", () => {
    render(<App />);
    const buttons = screen.getAllByRole("button");
    const titles = buttons.map(b => b.textContent);
    expect(titles.some(t => t.includes("Election Announcement"))).toBe(true);
    expect(titles.some(t => t.includes("Nomination Filing"))).toBe(true);
    expect(titles.some(t => t.includes("Voting Day"))).toBe(true);
  });

  it("expands phase detail on click", () => {
    render(<App />);
    const btn = screen.getAllByRole("button", { name: /Election Announcement/i })[0];
    fireEvent.click(btn);
    expect(screen.getByText(/ECI is a constitutional body/i)).toBeInTheDocument();
  });

  it("switches to quiz tab", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: /Knowledge Quiz/i }));
    expect(screen.getByText(/minimum age to vote/i)).toBeInTheDocument();
  });

  it("renders quiz question 1", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: /Knowledge Quiz/i }));
    expect(screen.getByText("Question 1 of 6 · Score: 0")).toBeInTheDocument();
  });

  it("answers quiz question correctly", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: /Knowledge Quiz/i }));
    fireEvent.click(screen.getByRole("button", { name: /Option B: 18 years/i }));
    expect(screen.getAllByText(/Article 326/i).length).toBeGreaterThan(0);
  });

  it("renders chat assistant", () => {
    render(<App />);
    expect(screen.getAllByText("Ask ElectIQ").length).toBeGreaterThan(0);
    expect(screen.getAllByPlaceholderText("Ask anything...").length).toBeGreaterThan(0);
  });

  it("renders suggestion buttons", () => {
    render(<App />);
    expect(screen.getAllByText("Who can vote in India?").length).toBeGreaterThan(0);
  });

  it("renders footer with ECI link", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: /Election Commission of India/i })).toBeInTheDocument();
  });
});