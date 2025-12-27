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


// payload example:
// {
//     "bankName": "ACB",
//     "bankAccountName": "DAO TUNG LAM",
//     "bankAccountNumber": "22929031",
//     "amount": 200000
// }
// response example:
// {
//     "success": true,
//     "message": "Tạo yêu cầu rút tiền thành công",
//     "data": {
//         "withdraw_id": 1,
//         "withdraw_code": "WTH123456",
//         "withdraw_status": "pending",
//         "amount": 200000
//     }
// }

export const createWithdrawRequest = async (payload) => {
    try {
        const response = await apiClient.post("/api/wallet/withdraw", payload);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getWithdrawHistory = async (page, limit) => {
    try {
        const response = await apiClient.get(`/api/wallet/withdraw-history?page=${page}&limit=${limit}`);
        return response;
    } catch (error) {
        throw error;
    }
}

// Gửi OTP cho rút tiền
// payload example:
// {
//     "bankName": "ACB",
//     "bankAccountName": "DAO TUNG LAM",
//     "bankAccountNumber": "22929031",
//     "amount": 200000
// }
export const sendOTPForWithdraw = async (payload) => {
    try {
        const response = await apiClient.post("/api/wallet/withdraw/send-otp", payload);
        return response;
    } catch (error) {
        throw error;
    }
}

// Xác thực OTP và thực hiện rút tiền
// payload example:
// {
//     "otp": "123456"
// }
export const verifyOTPAndWithdraw = async (payload) => {
    try {
        const response = await apiClient.post("/api/wallet/withdraw/verify-otp", payload);
        return response;
    } catch (error) {
        throw error;
    }
}