// Mock data for revenue reports - used for testing before backend API is ready
export const MOCK_REVENUE_DATA = {
  summary: {
    today: {
      current: { deposit: 5000000, withdrawal: 2000000, purchase: 3500000, revenue: 3000000 },
      previous: { deposit: 4500000, withdrawal: 1800000, purchase: 3200000, revenue: 2700000 },
      percentChange: { deposit: 11.1, withdrawal: 11.1, purchase: 9.4, revenue: 11.1 }
    },
    "7days": {
      current: { deposit: 35000000, withdrawal: 12000000, purchase: 24500000, revenue: 23000000 },
      previous: { deposit: 32000000, withdrawal: 11000000, purchase: 22000000, revenue: 21000000 },
      percentChange: { deposit: 9.4, withdrawal: 9.1, purchase: 11.4, revenue: 9.5 }
    },
    "30days": {
      current: { deposit: 150000000, withdrawal: 50000000, purchase: 105000000, revenue: 100000000 },
      previous: { deposit: 145000000, withdrawal: 48000000, purchase: 98000000, revenue: 97000000 },
      percentChange: { deposit: 3.4, withdrawal: 4.2, purchase: 7.1, revenue: 3.1 }
    }
  },
  monthly: [
    { month: "2025-01", revenue: 85000000, deposit: 120000000, withdrawal: 35000000 },
    { month: "2025-02", revenue: 90000000, deposit: 130000000, withdrawal: 40000000 },
    { month: "2025-03", revenue: 95000000, deposit: 140000000, withdrawal: 45000000 },
    { month: "2025-04", revenue: 88000000, deposit: 125000000, withdrawal: 37000000 },
    { month: "2025-05", revenue: 92000000, deposit: 135000000, withdrawal: 43000000 },
    { month: "2025-06", revenue: 98000000, deposit: 145000000, withdrawal: 47000000 },
    { month: "2025-07", revenue: 105000000, deposit: 155000000, withdrawal: 50000000 },
    { month: "2025-08", revenue: 102000000, deposit: 150000000, withdrawal: 48000000 },
    { month: "2025-09", revenue: 96000000, deposit: 142000000, withdrawal: 46000000 },
    { month: "2025-10", revenue: 99000000, deposit: 148000000, withdrawal: 49000000 },
    { month: "2025-11", revenue: 103000000, deposit: 152000000, withdrawal: 49000000 },
    { month: "2025-12", revenue: 100000000, deposit: 150000000, withdrawal: 50000000 }
  ],
  daily: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2025, 11, i + 1).toISOString().split('T')[0],
    deposit: Math.floor(Math.random() * 3000000) + 3000000,
    withdrawal: Math.floor(Math.random() * 1000000) + 1000000,
    purchase: Math.floor(Math.random() * 2500000) + 2000000
  }))
};
