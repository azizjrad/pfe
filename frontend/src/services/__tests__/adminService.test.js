import { describe, it, expect, vi } from "vitest";
import { adminService } from "../adminService";
import http from "../http";

vi.mock("../http", () => ({
  default: { put: vi.fn() },
}));

describe("Test unitaire du cas d'utilisation Bloquer/Debloquer une agence", () => {
  it("doit bloquer puis debloquer une agence", async () => {
    const id = 7;

    http.put
      .mockResolvedValueOnce({
        data: {
          success: true,
          message: "Agence bloquee",
          data: { id, status: "inactive" },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          message: "Agence debloquee",
          data: { id, status: "active" },
        },
      });

    const blocked = await adminService.suspendAgency(id, "inactive");
    const unblocked = await adminService.suspendAgency(id, "active");

    expect(http.put).toHaveBeenNthCalledWith(1, `/admin/agencies/${id}`, {
      status: "inactive",
    });
    expect(http.put).toHaveBeenNthCalledWith(2, `/admin/agencies/${id}`, {
      status: "active",
    });
    expect(blocked.data.status).toBe("inactive");
    expect(unblocked.data.status).toBe("active");
  });
});
