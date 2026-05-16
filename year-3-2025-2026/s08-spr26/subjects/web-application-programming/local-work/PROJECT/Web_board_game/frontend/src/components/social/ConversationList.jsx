import React from 'react';

const ConversationList = ({ items, selectedUserId, onSelect, emptyMessage }) => {
    if (items.length === 0) {
        return (
            <div className="page-center-state social-empty-state">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="conversation-list">
            {items.map((conversation) => (
                <button
                    key={conversation.id}
                    type="button"
                    className={`conversation-card${selectedUserId === conversation.id ? ' conversation-card-active' : ''}`}
                    onClick={() => onSelect(conversation.id)}
                >
                    <div className="conversation-card-header">
                        <div>
                            <strong>{conversation.displayName || conversation.username}</strong>
                            <span>@{conversation.username}</span>
                        </div>
                        <span className="conversation-time">
                            {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleString() : 'No messages'}
                        </span>
                    </div>

                    <p className="conversation-preview">{conversation.lastMessage || 'Open this chat to send the first message.'}</p>

                    <div className="conversation-card-footer">
                        <span>{conversation.favoriteGame || 'Social Lobby'}</span>
                        {conversation.unreadCount > 0 ? (
                            <span className="conversation-badge">{conversation.unreadCount} new</span>
                        ) : (
                            <span className="conversation-muted">Read</span>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
};

export default ConversationList;
