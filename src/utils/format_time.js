const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  
  const date = new Date(isoString);
  
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export default formatDateTime