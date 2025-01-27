const API_BASE_URL = '/api';

export const API_URLS = {
    // Rezervasyon endpoint'leri
    GET_RESERVATIONS: `${API_BASE_URL}/reservations`,
    CREATE_RESERVATION: `${API_BASE_URL}/reservations`,
    UPDATE_RESERVATION: (id) => `${API_BASE_URL}/reservations/${id}`,
    DELETE_RESERVATION: (id) => `${API_BASE_URL}/reservations/${id}`,
};

export default API_URLS; 