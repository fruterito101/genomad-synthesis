// src/hooks/__tests__/useGenomadNFT.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useRegisterAgent,
  useActivateAgent,
  useDeactivateAgent,
  useTransferAgent,
} from "../useGenomadNFT";

// Mock wagmi with custom implementation for these tests
vi.mock("wagmi", () => ({
  useWriteContract: () => ({
    writeContract: vi.fn(),
    writeContractAsync: vi.fn().mockResolvedValue("0xmockhash123"),
    data: "0xmockhash123" as `0x${string}`,
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: true,
    error: null,
  }),
}));

describe("useGenomadNFT hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useRegisterAgent", () => {
    it("should return register function and states", () => {
      const { result } = renderHook(() => useRegisterAgent());

      expect(result.current.register).toBeDefined();
      expect(result.current.registerAsync).toBeDefined();
      expect(typeof result.current.register).toBe("function");
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });

    it("should have correct initial states", () => {
      const { result } = renderHook(() => useRegisterAgent());

      expect(result.current.hash).toBe("0xmockhash123");
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("useActivateAgent", () => {
    it("should return activate function", () => {
      const { result } = renderHook(() => useActivateAgent());

      expect(result.current.activate).toBeDefined();
      expect(result.current.activateAsync).toBeDefined();
      expect(typeof result.current.activate).toBe("function");
    });
  });

  describe("useDeactivateAgent", () => {
    it("should return deactivate function", () => {
      const { result } = renderHook(() => useDeactivateAgent());

      expect(result.current.deactivate).toBeDefined();
      expect(result.current.deactivateAsync).toBeDefined();
    });
  });

  describe("useTransferAgent", () => {
    it("should return transfer function", () => {
      const { result } = renderHook(() => useTransferAgent());

      expect(result.current.transfer).toBeDefined();
      expect(result.current.transferAsync).toBeDefined();
    });
  });
});
