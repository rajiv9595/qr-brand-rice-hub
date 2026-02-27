import api from './api';

export const watchlistService = {
    addToWatchlist: (data) => api.post('/watchlist', data),
    getMyWatchlist: () => api.get('/watchlist'),
    removeFromWatchlist: (id) => api.delete(`/watchlist/${id}`)
};
