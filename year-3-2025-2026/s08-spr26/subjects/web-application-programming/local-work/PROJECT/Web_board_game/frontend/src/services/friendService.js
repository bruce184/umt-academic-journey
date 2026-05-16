import { apiRequest } from './http';

export const getFriends = ({ page = 1, pageSize = 6 } = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });

    return apiRequest(`/api/friends?${params.toString()}`);
};

export const getFriendRequests = () => apiRequest('/api/friends/requests');

export const sendFriendRequest = (receiverId) =>
    apiRequest('/api/friends/requests', {
        method: 'POST',
        body: { receiverId },
    });

export const acceptFriendRequest = (requestId) =>
    apiRequest(`/api/friends/requests/${requestId}/accept`, {
        method: 'PATCH',
    });

export const deleteFriendRequest = (requestId) =>
    apiRequest(`/api/friends/requests/${requestId}`, {
        method: 'DELETE',
    });

export const removeFriend = (friendId) =>
    apiRequest(`/api/friends/${friendId}`, {
        method: 'DELETE',
    });
