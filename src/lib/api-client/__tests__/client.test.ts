import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchCategories,
  fetchActions,
  fetchDailyResult,
  fetchPlayLogs,
  createPlay,
  deletePlayLog,
  confirmDailyResult,
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

describe("fetchPlayLogs", () => {
  it("builds URL with dayKey only", async () => {
    const payload = { playLogs: [] };
    mockFetch.mockResolvedValue(jsonResponse(payload));

    const result = await fetchPlayLogs("2026-01-27");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/plays?dayKey=2026-01-27",
      expect.anything()
    );
    expect(result).toEqual(payload);
  });

  it("builds URL with dayKey and categoryId", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ playLogs: [] }));

    await fetchPlayLogs("2026-01-27", "cat-1");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/plays?dayKey=2026-01-27&categoryId=cat-1",
      expect.anything()
    );
  });
});

describe("deletePlayLog", () => {
  it("sends DELETE to play log endpoint", async () => {
    const payload = { ok: true };
    mockFetch.mockResolvedValue(jsonResponse(payload));

    const result = await deletePlayLog("play-1");

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/plays/play-1");
    expect(init.method).toBe("DELETE");
    expect(result).toEqual(payload);
  });
});

describe("confirmDailyResult", () => {
  it("sends POST to confirm endpoint", async () => {
    const payload = { ok: true };
    mockFetch.mockResolvedValue(jsonResponse(payload));

    const result = await confirmDailyResult("2026-01-27");

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/results/2026-01-27/confirm");
    expect(init.method).toBe("POST");
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

describe("fetchPlayLogs error handling", () => {
  it("throws on 404 error", async () => {
    const errorPayload = { error: { code: "NOT_FOUND", message: "Play logs not found" } };
    mockFetch.mockResolvedValue(jsonResponse(errorPayload, 404));

    await expect(fetchPlayLogs("2026-01-27")).rejects.toThrow("Play logs not found");
  });

  it("throws on 500 error", async () => {
    mockFetch.mockResolvedValue(textResponse("Internal Server Error", 500));

    await expect(fetchPlayLogs("2026-01-27")).rejects.toThrow("Internal Server Error");
  });

  it("throws on empty response", async () => {
    mockFetch.mockResolvedValue(textResponse("", 200));

    await expect(fetchPlayLogs("2026-01-27")).rejects.toThrow("Empty response from");
  });
});

describe("deletePlayLog error handling", () => {
  it("throws on 404 error", async () => {
    const errorPayload = { error: { code: "NOT_FOUND", message: "Play log not found" } };
    mockFetch.mockResolvedValue(jsonResponse(errorPayload, 404));

    await expect(deletePlayLog("play-1")).rejects.toThrow("Play log not found");
  });

  it("throws on 500 error", async () => {
    mockFetch.mockResolvedValue(textResponse("Internal Server Error", 500));

    await expect(deletePlayLog("play-1")).rejects.toThrow("Internal Server Error");
  });

  it("throws on empty response", async () => {
    mockFetch.mockResolvedValue(textResponse("", 200));

    await expect(deletePlayLog("play-1")).rejects.toThrow("Empty response from");
  });

  it("encodes special characters in id", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    await deletePlayLog("id/with special&chars");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/plays/id%2Fwith%20special%26chars");
  });
});

describe("confirmDailyResult error handling", () => {
  it("throws on 404 error", async () => {
    const errorPayload = { error: { code: "NOT_FOUND", message: "Result not found" } };
    mockFetch.mockResolvedValue(jsonResponse(errorPayload, 404));

    await expect(confirmDailyResult("2026-01-27")).rejects.toThrow("Result not found");
  });

  it("throws on 500 error", async () => {
    mockFetch.mockResolvedValue(textResponse("Internal Server Error", 500));

    await expect(confirmDailyResult("2026-01-27")).rejects.toThrow("Internal Server Error");
  });

  it("throws on empty response", async () => {
    mockFetch.mockResolvedValue(textResponse("", 200));

    await expect(confirmDailyResult("2026-01-27")).rejects.toThrow("Empty response from");
  });

  it("encodes special characters in dayKey", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    await confirmDailyResult("2026/01/27");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/results/2026%2F01%2F27/confirm");
  });
});
