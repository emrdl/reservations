import axios from 'axios';
import API_URLS from '../config/api';

// Axios varsayılan ayarları
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Axios interceptor ekleyelim
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 403) {
            console.error('Erişim engellendi:', error);
        }
        return Promise.reject(error);
    }
);

const apiService = {
    // Kategori işlemleri
    getCategories: async () => {
        const response = await axios.get(API_URLS.GET_CATEGORIES);
        return response.data;
    },

    createCategory: async (categoryData) => {
        const response = await axios.post(API_URLS.CREATE_CATEGORY, categoryData);
        return response.data;
    },

    updateCategory: async (id, categoryData) => {
        const response = await axios.put(API_URLS.UPDATE_CATEGORY(id), categoryData);
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await axios.delete(API_URLS.DELETE_CATEGORY(id));
        return response.data;
    },

    // Menü işlemleri
    getMenuItems: async () => {
        const response = await axios.get(API_URLS.GET_MENU_ITEMS);
        return response.data;
    },

    createMenuItem: async (menuData) => {
        const response = await axios.post(API_URLS.CREATE_MENU_ITEM, menuData);
        return response.data;
    },

    updateMenuItem: async (id, menuData) => {
        const response = await axios.put(API_URLS.UPDATE_MENU_ITEM(id), menuData);
        return response.data;
    },

    deleteMenuItem: async (id) => {
        const response = await axios.delete(API_URLS.DELETE_MENU_ITEM(id));
        return response.data;
    },

    // Rezervasyon işlemleri
    getReservations: async () => {
        const response = await axios.get(API_URLS.GET_RESERVATIONS);
        return response.data;
    },

    createReservation: async (reservationData) => {
        const response = await axios.post(API_URLS.CREATE_RESERVATION, reservationData);
        return response.data;
    },

    updateReservation: async (id, reservationData) => {
        const response = await axios.put(API_URLS.UPDATE_RESERVATION(id), reservationData);
        return response.data;
    },

    deleteReservation: async (id) => {
        const response = await axios.delete(API_URLS.DELETE_RESERVATION(id));
        return response.data;
    },
};

export default apiService; 