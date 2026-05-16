import { apiRequest } from './http';

export const getConversations = ({ page = 1, pageSize = 5 } = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });

    return apiRequest(`/api/messages/conversations?${params.toString()}`);
};

export const getConversationMessages = (userId, { page = 1, pageSize = 8 } = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });

    return apiRequest(`/api/messages/conversations/${userId}?${params.toString()}`);
};

export const sendMessage = ({ recipientId, content }) =>
    apiRequest('/api/messages', {
        method: 'POST',
        body: { recipientId, content },
    });
