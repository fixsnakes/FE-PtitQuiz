const formatCurrency = (amount) => {
  // Chuyển string '0.0000' thành số float trước
  const number = parseFloat(amount); 

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(number);
};

export default formatCurrency
