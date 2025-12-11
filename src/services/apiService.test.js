import axios from "axios";

// Mock axios before importing apiService
jest.mock("axios", () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return {
    create: jest.fn(() => mockAxiosInstance),
    ...mockAxiosInstance,
  };
});

// Import apiService after mocking
import { apiService } from "./apiService";

// Get the mocked axios instance
const mockedAxios = axios.create();

describe("apiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPatients - Fetching patients", () => {
    const mockPatientsResponse = {
      data: {
        patients: [
          {
            id: "patient-001",
            name: "John Doe",
            email: "john@example.com",
            dateOfBirth: "1990-01-15",
            gender: "Male",
            walletAddress: "0x1234567890abcdef",
          },
          {
            id: "patient-002",
            name: "Jane Smith",
            email: "jane@example.com",
            dateOfBirth: "1985-06-20",
            gender: "Female",
            walletAddress: "0xabcdef1234567890",
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      },
    };

    it("should fetch patients with default parameters", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockPatientsResponse);

      const result = await apiService.getPatients();

      expect(mockedAxios.get).toHaveBeenCalledWith("/patients", {
        params: { page: 1, limit: 10, search: "" },
      });
      expect(result).toEqual(mockPatientsResponse.data);
      expect(result.patients).toHaveLength(2);
    });

    it("should fetch patients with custom pagination", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockPatientsResponse);

      await apiService.getPatients(2, 20);

      expect(mockedAxios.get).toHaveBeenCalledWith("/patients", {
        params: { page: 2, limit: 20, search: "" },
      });
    });

    it("should fetch patients with search term", async () => {
      const searchResponse = {
        data: {
          patients: [mockPatientsResponse.data.patients[0]],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(searchResponse);

      const result = await apiService.getPatients(1, 10, "John");

      expect(mockedAxios.get).toHaveBeenCalledWith("/patients", {
        params: { page: 1, limit: 10, search: "John" },
      });
      expect(result.patients).toHaveLength(1);
      expect(result.patients[0].name).toBe("John Doe");
    });

    it("should handle error when fetching patients fails", async () => {
      const errorMessage = "Network Error";
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(apiService.getPatients()).rejects.toThrow(errorMessage);
    });

    it("should return empty patients array when no patients found", async () => {
      const emptyResponse = {
        data: {
          patients: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(emptyResponse);

      const result = await apiService.getPatients(1, 10, "nonexistent");

      expect(result.patients).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getConsents - Fetching consents", () => {
    const mockConsentsResponse = {
      data: {
        consents: [
          {
            id: "consent-001",
            patientId: "patient-001",
            purpose: "Research Study Participation",
            status: "active",
            walletAddress: "0x1234567890abcdef",
            createdAt: "2024-01-15T10:00:00Z",
            blockchainTxHash: "0xabc123def456",
          },
          {
            id: "consent-002",
            patientId: "patient-002",
            purpose: "Data Sharing with Research Institution",
            status: "pending",
            walletAddress: "0xabcdef1234567890",
            createdAt: "2024-01-16T11:00:00Z",
          },
        ],
      },
    };

    it("should fetch all consents without filters", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockConsentsResponse);

      const result = await apiService.getConsents();

      expect(mockedAxios.get).toHaveBeenCalledWith("/consents", {
        params: {},
      });
      expect(result.consents).toHaveLength(2);
    });

    it("should fetch consents filtered by patient ID", async () => {
      const filteredResponse = {
        data: {
          consents: [mockConsentsResponse.data.consents[0]],
        },
      };
      mockedAxios.get.mockResolvedValueOnce(filteredResponse);

      const result = await apiService.getConsents("patient-001");

      expect(mockedAxios.get).toHaveBeenCalledWith("/consents", {
        params: { patientId: "patient-001" },
      });
      expect(result.consents).toHaveLength(1);
      expect(result.consents[0].patientId).toBe("patient-001");
    });

    it("should fetch consents filtered by status", async () => {
      const activeConsentsResponse = {
        data: {
          consents: [mockConsentsResponse.data.consents[0]],
        },
      };
      mockedAxios.get.mockResolvedValueOnce(activeConsentsResponse);

      const result = await apiService.getConsents(null, "active");

      expect(mockedAxios.get).toHaveBeenCalledWith("/consents", {
        params: { status: "active" },
      });
      expect(result.consents).toHaveLength(1);
      expect(result.consents[0].status).toBe("active");
    });

    it("should fetch consents with both patient ID and status filters", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { consents: [] },
      });

      await apiService.getConsents("patient-001", "pending");

      expect(mockedAxios.get).toHaveBeenCalledWith("/consents", {
        params: { patientId: "patient-001", status: "pending" },
      });
    });

    it("should handle error when fetching consents fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Server Error"));

      await expect(apiService.getConsents()).rejects.toThrow("Server Error");
    });
  });

  describe("updateConsent - Updating consents", () => {
    const mockUpdatedConsent = {
      data: {
        id: "consent-001",
        patientId: "patient-001",
        purpose: "Research Study Participation",
        status: "active",
        walletAddress: "0x1234567890abcdef",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-17T09:00:00Z",
        blockchainTxHash: "0xnew123hash456",
      },
    };

    it("should update consent status to active", async () => {
      mockedAxios.patch.mockResolvedValueOnce(mockUpdatedConsent);

      const result = await apiService.updateConsent("consent-001", {
        status: "active",
      });

      expect(mockedAxios.patch).toHaveBeenCalledWith("/consents/consent-001", {
        status: "active",
      });
      expect(result.status).toBe("active");
      expect(result.id).toBe("consent-001");
    });

    it("should update consent status to revoked", async () => {
      const revokedConsent = {
        data: { ...mockUpdatedConsent.data, status: "revoked" },
      };
      mockedAxios.patch.mockResolvedValueOnce(revokedConsent);

      const result = await apiService.updateConsent("consent-001", {
        status: "revoked",
      });

      expect(mockedAxios.patch).toHaveBeenCalledWith("/consents/consent-001", {
        status: "revoked",
      });
      expect(result.status).toBe("revoked");
    });

    it("should update consent with blockchain transaction hash", async () => {
      mockedAxios.patch.mockResolvedValueOnce(mockUpdatedConsent);

      const result = await apiService.updateConsent("consent-001", {
        status: "active",
        blockchainTxHash: "0xnew123hash456",
      });

      expect(mockedAxios.patch).toHaveBeenCalledWith("/consents/consent-001", {
        status: "active",
        blockchainTxHash: "0xnew123hash456",
      });
      expect(result.blockchainTxHash).toBe("0xnew123hash456");
    });

    it("should handle error when updating consent fails", async () => {
      mockedAxios.patch.mockRejectedValueOnce(new Error("Consent not found"));

      await expect(
        apiService.updateConsent("invalid-id", { status: "active" })
      ).rejects.toThrow("Consent not found");
    });

    it("should handle validation error for invalid status", async () => {
      mockedAxios.patch.mockRejectedValueOnce(
        new Error("Invalid status value")
      );

      await expect(
        apiService.updateConsent("consent-001", { status: "invalid" })
      ).rejects.toThrow("Invalid status value");
    });
  });

  describe("getTransactions - Fetching blockchain transactions", () => {
    const mockTransactionsResponse = {
      data: {
        transactions: [
          {
            id: "tx-001",
            type: "Consent Approval",
            from: "0x1234567890abcdef1234567890abcdef12345678",
            to: "0xabcdef1234567890abcdef1234567890abcdef12",
            amount: 0.001,
            currency: "ETH",
            status: "confirmed",
            timestamp: "2024-01-15T10:30:00Z",
            blockchainTxHash: "0xtx123abc456def",
          },
          {
            id: "tx-002",
            type: "Data Access",
            from: "0xabcdef1234567890abcdef1234567890abcdef12",
            to: "0x1234567890abcdef1234567890abcdef12345678",
            amount: 0.002,
            currency: "ETH",
            status: "pending",
            timestamp: "2024-01-16T14:00:00Z",
          },
        ],
      },
    };

    it("should fetch all transactions with default limit", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockTransactionsResponse);

      const result = await apiService.getTransactions();

      expect(mockedAxios.get).toHaveBeenCalledWith("/transactions", {
        params: { limit: 20 },
      });
      expect(result.transactions).toHaveLength(2);
    });

    it("should fetch transactions filtered by wallet address", async () => {
      const filteredResponse = {
        data: {
          transactions: [mockTransactionsResponse.data.transactions[0]],
        },
      };
      mockedAxios.get.mockResolvedValueOnce(filteredResponse);

      const walletAddress = "0x1234567890abcdef1234567890abcdef12345678";
      const result = await apiService.getTransactions(walletAddress);

      expect(mockedAxios.get).toHaveBeenCalledWith("/transactions", {
        params: { limit: 20, walletAddress },
      });
      expect(result.transactions).toHaveLength(1);
    });

    it("should fetch transactions with custom limit", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockTransactionsResponse);

      await apiService.getTransactions(null, 50);

      expect(mockedAxios.get).toHaveBeenCalledWith("/transactions", {
        params: { limit: 50 },
      });
    });

    it("should fetch transactions with wallet address and custom limit", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockTransactionsResponse);

      const walletAddress = "0x1234567890abcdef";
      await apiService.getTransactions(walletAddress, 10);

      expect(mockedAxios.get).toHaveBeenCalledWith("/transactions", {
        params: { limit: 10, walletAddress },
      });
    });

    it("should handle error when fetching transactions fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(
        new Error("Failed to fetch transactions")
      );

      await expect(apiService.getTransactions()).rejects.toThrow(
        "Failed to fetch transactions"
      );
    });

    it("should return empty array when no transactions found", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { transactions: [] },
      });

      const result = await apiService.getTransactions("0xnonexistentwallet");

      expect(result.transactions).toHaveLength(0);
    });

    it("should correctly return transaction with confirmed status", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockTransactionsResponse);

      const result = await apiService.getTransactions();

      const confirmedTx = result.transactions.find(
        (tx) => tx.status === "confirmed"
      );
      expect(confirmedTx).toBeDefined();
      expect(confirmedTx.blockchainTxHash).toBeDefined();
    });
  });

  describe("getStats - Fetching statistics", () => {
    const mockStatsResponse = {
      data: {
        totalPatients: 150,
        totalRecords: 500,
        totalConsents: 75,
        activeConsents: 50,
        pendingConsents: 25,
        totalTransactions: 1000,
      },
    };

    it("should fetch platform statistics", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockStatsResponse);

      const result = await apiService.getStats();

      expect(mockedAxios.get).toHaveBeenCalledWith("/stats");
      expect(result).toEqual(mockStatsResponse.data);
    });

    it("should return correct total patients count", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockStatsResponse);

      const result = await apiService.getStats();

      expect(result.totalPatients).toBe(150);
    });

    it("should return correct total records count", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockStatsResponse);

      const result = await apiService.getStats();

      expect(result.totalRecords).toBe(500);
    });

    it("should return correct consent statistics", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockStatsResponse);

      const result = await apiService.getStats();

      expect(result.totalConsents).toBe(75);
      expect(result.activeConsents).toBe(50);
      expect(result.pendingConsents).toBe(25);
      expect(
        result.activeConsents + result.pendingConsents
      ).toBeLessThanOrEqual(result.totalConsents);
    });

    it("should return correct total transactions count", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockStatsResponse);

      const result = await apiService.getStats();

      expect(result.totalTransactions).toBe(1000);
    });

    it("should handle error when fetching statistics fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(
        new Error("Statistics unavailable")
      );

      await expect(apiService.getStats()).rejects.toThrow(
        "Statistics unavailable"
      );
    });

    it("should handle zero values in statistics", async () => {
      const emptyStatsResponse = {
        data: {
          totalPatients: 0,
          totalRecords: 0,
          totalConsents: 0,
          activeConsents: 0,
          pendingConsents: 0,
          totalTransactions: 0,
        },
      };
      mockedAxios.get.mockResolvedValueOnce(emptyStatsResponse);

      const result = await apiService.getStats();

      expect(result.totalPatients).toBe(0);
      expect(result.totalRecords).toBe(0);
      expect(result.totalConsents).toBe(0);
    });
  });

  describe("createConsent - Creating consents", () => {
    const mockCreatedConsent = {
      data: {
        id: "consent-003",
        patientId: "patient-001",
        purpose: "Research Study Participation",
        status: "pending",
        walletAddress: "0x1234567890abcdef",
        signature: "0xsignature123",
        createdAt: "2024-01-17T10:00:00Z",
      },
    };

    it("should create a new consent", async () => {
      mockedAxios.post.mockResolvedValueOnce(mockCreatedConsent);

      const consentData = {
        patientId: "patient-001",
        purpose: "Research Study Participation",
        walletAddress: "0x1234567890abcdef",
        signature: "0xsignature123",
      };

      const result = await apiService.createConsent(consentData);

      expect(mockedAxios.post).toHaveBeenCalledWith("/consents", consentData);
      expect(result.id).toBe("consent-003");
      expect(result.status).toBe("pending");
    });

    it("should handle error when creating consent fails", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Invalid signature"));

      await expect(
        apiService.createConsent({
          patientId: "patient-001",
          purpose: "Research",
          walletAddress: "0x123",
          signature: "invalid",
        })
      ).rejects.toThrow("Invalid signature");
    });
  });
});
