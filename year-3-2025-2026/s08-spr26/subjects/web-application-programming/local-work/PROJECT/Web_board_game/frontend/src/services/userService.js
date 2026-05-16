import { apiRequest } from './http';

export const searchUsers = ({ query = '', page = 1, pageSize = 6 } = {}) => {
    const params = new URLSearchParams({
        q: query,
        page: String(page),
        pageSize: String(pageSize),
    });

    return apiRequest(`/api/users/search?${params.toString()}`);
};
