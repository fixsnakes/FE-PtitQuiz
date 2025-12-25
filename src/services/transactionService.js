import apiClient from "./apiClient";


// get transaction history
// repsone example
// {
//     "success": true,
//     "message": "Lấy danh sách lịch sử giao dịch thành công",
//     "data": {
//         "transactions": [
//             {
//                 "id": 3,
//                 "user_id": 2,
//                 "transactionType": "deposit",
//                 "referenceId": 11,
//                 "amount": "2000.0000",
//                 "beforeBalance": "140000.0000",
//                 "afterBalance": "142000.0000",
//                 "transactionStatus": "success",
//                 "transferType": "in",
//                 "created_at": "2025-12-24T10:56:31.000Z",
//                 "user": {
//                     "id": 2,
//                     "fullName": "Phạm Anh Duy",
//                     "email": "lamcz040xxx7@gmail.com"
//                 }
//             },
//   
//         ],
//         "pagination": {
//             "total": 3,
//             "page": 1,
//             "limit": 10,
//             "totalPages": 1
//         }
//     }
// }

export const getTransactionHistory = async (params = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            order = 'DESC',
            transactionType,
            transactionStatus,
            user_id,
            fromDate,
            toDate,
            minAmount,
            maxAmount,
            transferType
        } = params;

        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        queryParams.append('sortBy', sortBy);
        queryParams.append('order', order);

        if (transactionType) queryParams.append('transactionType', transactionType);
        if (transactionStatus) queryParams.append('transactionStatus', transactionStatus);
        if (user_id) queryParams.append('user_id', user_id);
        if (fromDate) queryParams.append('fromDate', fromDate);
        if (toDate) queryParams.append('toDate', toDate);
        if (minAmount) queryParams.append('minAmount', minAmount);
        if (maxAmount) queryParams.append('maxAmount', maxAmount);
        if (transferType) queryParams.append('transferType', transferType);

        const response = await apiClient.get(`/api/wallet/transaction-history?${queryParams.toString()}`);
        return response;
    } catch (error) {
        throw error;
    }
}