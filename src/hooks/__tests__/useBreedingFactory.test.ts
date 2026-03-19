// src/hooks/__tests__/useBreedingFactory.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useBreedingFee,
  useRequestBreeding,
  useApproveBreeding,
  useExecuteBreeding,
  useCancelBreeding,
  useBreedingRequest,
} from "../useBreedingFactory";

// Mock wagmi
vi.mock("wagmi", () => ({
  useWriteContract: () => ({
    writeContract: vi.fn(),
    writeContractAsync: vi.fn().mockResolvedValue("0xbreedinghash"),
    data: "0xbreedinghash" as `0x${string}`,
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: true,
    error: null,
  }),
  useReadContract: () => ({
    data: BigInt(1000000000000000000), // 1 MON fee
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe("useBreedingFactory hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useBreedingFee", () => {
    it("should return breeding fee", () => {
      const { result } = renderHook(() => useBreedingFee());

      expect(result.current.fee).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.refetch).toBeDefined();
    });
  });

  describe("useRequestBreeding", () => {
    it("should return request function and states", () => {
      const { result } = renderHook(() => useRequestBreeding());

      expect(result.current.request).toBeDefined();
      expect(result.current.requestAsync).toBeDefined();
      expect(typeof result.current.request).toBe("function");
      expect(result.current.isPending).toBe(false);
    });

    it("should have transaction hash after request", () => {
      const { result } = renderHook(() => useRequestBreeding());

      expect(result.current.hash).toBe("0xbreedinghash");
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe("useApproveBreeding", () => {
    it("should return approve function", () => {
      const { result } = renderHook(() => useApproveBreeding());

      expect(result.current.approve).toBeDefined();
      expect(result.current.approveAsync).toBeDefined();
    });
  });

  describe("useExecuteBreeding", () => {
    it("should return execute function", () => {
      const { result } = renderHook(() => useExecuteBreeding());

      expect(result.current.execute).toBeDefined();
      expect(result.current.executeAsync).toBeDefined();
    });
  });

  describe("useCancelBreeding", () => {
    it("should return cancel function", () => {
      const { result } = renderHook(() => useCancelBreeding());

      expect(result.current.cancel).toBeDefined();
      expect(result.current.cancelAsync).toBeDefined();
    });
  });

  describe("useBreedingRequest", () => {
    it("should return request data", () => {
      const { result } = renderHook(() => useBreedingRequest(BigInt(1)));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.refetch).toBeDefined();
    });
  });
});
