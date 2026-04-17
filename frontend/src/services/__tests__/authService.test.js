import { describe, it, expect, vi } from "vitest";
import { authService } from "../authService";
import http from "../http";

vi.mock("../http", () => ({
  default: { post: vi.fn() },
}));

describe("Test unitaire du cas d'utilisation S'authentifier", () => {
  it("doit authentifier l'utilisateur avec succes", async () => {
    const creds = { email: "user@test.com", password: "secret" };
    const user = {
      id: 1,
      name: "Test User",
      email: "user@test.com",
      role: "client",
    };
    http.post.mockResolvedValue({ data: { success: true, data: { user } } });

    const store = {};
    global.localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => (store[k] = String(v)),
    };

    const result = await authService.login(creds);

    expect(http.post).toHaveBeenCalledWith("/login", creds);
    expect(result.user).toEqual(user);
    expect(localStorage.getItem("user")).toBe(JSON.stringify(user));
  });
});
