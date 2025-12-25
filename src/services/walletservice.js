import apiClient from "./apiClient";


// payload example:
// {
//     "bankName": "ACB",
//     "bankAccountName": "DAO TUNG LAM",
//     "bankAccountNumber": "22929031",
//     "amount":2000
// }
// response example:
// {
//     "success": true,
//     "message": "Tạo yêu cầu nạp tiền thành công",
//     "data": {
//         "deposit_id": 11,
//         "deposit_code": "UGTGRNJCLZQV",
//         "deposit_status": "pending",
//         "amount": 2000,
//         "qr_base64": ""
//     }
// }

export const createDepositRequest = async (payload) => {
    try {
        const response = await apiClient.post("/api/wallet/deposit", payload);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getDepositHistory = async (page, limit) => {
    try {
        const response = await apiClient.get(`/api/wallet/deposit-history?page=${page}&limit=${limit}`);
        return response;
    } catch (error) {
        throw error;
    }
}