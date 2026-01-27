import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchCategories,
  fetchActions,
  fetchDailyResult,
  createPlay,
} from "../client";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function textResponse(text: string, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(text),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchCategories", () => {
  it("fetches visible categories by default", async () => {
    const payload = { categories: [{ id: "c1", name: "Test" }] };
    mockFetch.mockResolvedValue(jsonResponse(payload));

    const result = await fetchCategories();

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/categories?visible=true",
      expect.objectContaining({ cache: "no-store" })
    );
    expect(result).toEqual(payload);
  });

  it("fetches all categories when visibleOnly=false", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ categories: [] }));

    await fetchCategories(false);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/categories?visible=false",
      expect.anything()
    );
  });
});

describe("fetchActions", () => {
  it("builds URL with categoryId and visible flag", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ actions: [] }));

    await fetchActions("cat-1", true);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/actions?categoryId=cat-1&visible=true",
      expect.anything()
    );
  });
});

describe("fetchDailyResult", () => {
  it("builds URL with dayKey", async () => {
    const payload = { dailyResult: { dayKey: "2025-01-01" }, categoryResults: [] };
    mockFetch.mockResolvedValue(jsonResponse(payload));

    const result = await fetchDailyResult("2025-01-01");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/results/2025-01-01",
      expect.anything()
    );
    expect(result).toEqual(payload);
  });
});

describe("createPlay", () => {
  it("sends POST with JSON body and Content-Type", async () => {
    const payload = { playLog: { id: "p1" } };
    mockFetch.mockResolvedValue(jsonResponse(payload));

    const result = await createPlay({ actionId: "a1", note: "test" });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/plays");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ actionId: "a1", note: "test" });
    expect(result).toEqual(payload);
  });
});

describe("Content-Type header", () => {
  it("does NOT set Content-Type for GET requests", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ categories: [] }));

    await fetchCategories();

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("sets Content-Type for requests with body", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ playLog: {} }));

    await createPlay({ actionId: "a1" });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers["Content-Type"]).toBe("application/json");
  });
});

describe("error handling", () => {
  it("throws with API error message on non-ok response", async () => {
    const errorPayload = { error: { code: "NOT_FOUND", message: "Not found" } };
    mockFetch.mockResolvedValue(jsonResponse(errorPayload, 404));

    await expect(fetchCategories()).rejects.toThrow("Not found");
  });

  it("throws with raw text if response is not JSON error", async () => {
    mockFetch.mockResolvedValue(textResponse("Server error", 500));

    await expect(fetchCategories()).rejects.toThrow("Server error");
  });

  it("throws on empty response body", async () => {
    mockFetch.mockResolvedValue(textResponse("", 200));

    await expect(fetchCategories()).rejects.toThrow("Empty response from");
  });
});
