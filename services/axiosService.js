import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// İstek interceptor'ı
axiosInstance.interceptors.request.use(
  (config) => {
    // İstek öncesi yapılacak işlemler (örn: token ekleme)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Hata yönetimi
    if (error.response) {
      // Sunucu yanıtı ile gelen hata
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('Network Error:', error.request);
      return Promise.reject({ error: 'Ağ hatası oluştu' });
    } else {
      // İstek oluşturulurken hata oluştu
      console.error('Request Error:', error.message);
      return Promise.reject({ error: 'İstek hatası oluştu' });
    }
  }
);

export default axiosInstance; 