import React, { useEffect, useState } from 'react';
import ConversationList from '../../components/social/ConversationList';
import { getFriends } from '../../services/friendService';
import { getConversationMessages, getConversations, sendMessage } from '../../services/messageService';

const CONVERSATION_PAGE_SIZE = 5;
const MESSAGE_PAGE_SIZE = 8;

const MessagesPage = () => {
    const [conversations, setConversations] = useState([]);
    const [conversationPagination, setConversationPagination] = useState({
        page: 1,
        pageSize: CONVERSATION_PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
    });
    const [friends, setFriends] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagePagination, setMessagePagination] = useState({
        page: 1,
        pageSize: MESSAGE_PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
    });
    const [friendSelector, setFriendSelector] = useState('');
    const [draft, setDraft] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');

    const idsInConversation = new Set(conversations.map((item) => item.id));
    const friendOptions = friends.map((friend) => {
        return {
            ...friend,
            hasConversation: idsInConversation.has(friend.id),
        };
    });

    const loadFriends = async () => {
        const data = await getFriends({ page: 1, pageSize: 12 });
        setFriends(data.data.items);
        if (!friendSelector && data.data.items[0]) {
            setFriendSelector(data.data.items[0].id);
        }
    };

    const loadConversations = async (page = 1, preferredUserId = null) => {
        setLoadingConversations(true);

        try {
            const data = await getConversations({
                page,
                pageSize: CONVERSATION_PAGE_SIZE,
            });

            const items = data.data.items;
            setConversations(items);
            setConversationPagination(data.data.pagination);

            const nextSelectedUserId =
                preferredUserId ||
                (items.some((item) => item.id === selectedUserId) ? selectedUserId : items[0]?.id) ||
                '';

            if (nextSelectedUserId !== selectedUserId) {
                setSelectedUserId(nextSelectedUserId);
            }
        } catch (err) {
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoadingConversations(false);
        }
    };

    const loadMessages = async (userId, page = 1) => {
        if (!userId) {
            setMessages([]);
            setSelectedUser(null);
            return;
        }

        setLoadingMessages(true);
        setError('');

        try {
            const data = await getConversationMessages(userId, {
                page,
                pageSize: MESSAGE_PAGE_SIZE,
            });

            setSelectedUser(data.data.user);
            setMessages(data.data.items);
            setMessagePagination(data.data.pagination);
        } catch (err) {
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        const bootstrap = async () => {
            setError('');
            await Promise.all([loadFriends(), loadConversations(1)]);
        };

        bootstrap();
    }, []);

    useEffect(() => {
        loadMessages(selectedUserId, 1);
    }, [selectedUserId]);

    const handleConversationPageChange = async (page) => {
        setFeedback('');
        await loadConversations(page);
    };

    const handleMessagePageChange = async (page) => {
        setFeedback('');
        await loadMessages(selectedUserId, page);
    };

    const handleOpenFriendConversation = () => {
        if (!friendSelector) return;

        if (friendSelector === selectedUserId) {
            loadMessages(friendSelector, 1);
        } else {
            setSelectedUserId(friendSelector);
        }

        setFeedback('');
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!selectedUserId) return;

        setSending(true);
        setError('');
        setFeedback('');

        try {
            await sendMessage({
                recipientId: selectedUserId,
                content: draft,
            });

            setDraft('');
            setFeedback('Message sent.');
            await Promise.all([loadConversations(1, selectedUserId), loadMessages(selectedUserId, 1)]);
        } catch (err) {
            setError(err.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="content-grid single-column-grid">
            <section className="page-panel glass-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Messages</span>
                        <h2>Async conversations with friends</h2>
                    </div>
                    <div className="social-summary-chips">
                        <span className="video-meta-chip">Conversations: {conversationPagination.totalItems}</span>
                        <span className="video-meta-chip">Friends: {friends.length}</span>
                    </div>
                </div>

                <p className="muted-copy">
                    Messaging is intentionally non-realtime. Open a thread, read the latest page, and send your next note when ready.
                </p>

                {error && <div className="error-message">{error}</div>}
                {feedback && <div className="success-message">{feedback}</div>}
            </section>

            <div className="content-grid two-column-grid social-two-column messages-page-layout">
                <section className="page-panel glass-panel">
                    <div className="section-heading">
                        <div>
                            <span className="section-kicker">Conversation List</span>
                            <h2>Recent chats</h2>
                        </div>
                    </div>

                    <div className="conversation-launcher">
                        <select
                            value={friendSelector}
                            onChange={(event) => setFriendSelector(event.target.value)}
                            className="social-select"
                        >
                            <option value="">Select a friend</option>
                            {friendOptions.map((friend) => (
                                <option key={friend.id} value={friend.id}>
                                    {friend.displayName || friend.username}
                                    {friend.hasConversation ? ' (existing chat)' : ' (new chat)'}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className="control-btn enter-btn"
                            onClick={handleOpenFriendConversation}
                            disabled={!friendSelector}
                        >
                            Open Chat
                        </button>
                    </div>

                    {loadingConversations ? (
                        <div className="page-center-state">
                            <p>Loading conversations...</p>
                        </div>
                    ) : (
                        <ConversationList
                            items={conversations}
                            selectedUserId={selectedUserId}
                            onSelect={setSelectedUserId}
                            emptyMessage="No conversations yet. Select a friend above to start one."
                        />
                    )}

                    <div className="pagination-row">
                        <button
                            type="button"
                            className="control-btn nav-btn pagination-btn"
                            onClick={() => handleConversationPageChange(conversationPagination.page - 1)}
                            disabled={loadingConversations || conversationPagination.page <= 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-meta">
                            Page {conversationPagination.page} / {conversationPagination.totalPages}
                        </span>
                        <button
                            type="button"
                            className="control-btn nav-btn pagination-btn"
                            onClick={() => handleConversationPageChange(conversationPagination.page + 1)}
                            disabled={loadingConversations || conversationPagination.page >= conversationPagination.totalPages}
                        >
                            Next
                        </button>
                    </div>
                </section>

                <section className="page-panel glass-panel">
                    <div className="section-heading">
                        <div>
                            <span className="section-kicker">Message Thread</span>
                            <h2>{selectedUser ? `Chat with ${selectedUser.displayName || selectedUser.username}` : 'Choose a conversation'}</h2>
                        </div>
                    </div>

                    {selectedUser ? (
                        <>
                            <div className="message-thread-panel">
                                <div className="message-thread-summary">
                                    <div>
                                        <strong>{selectedUser.displayName || selectedUser.username}</strong>
                                        <span>@{selectedUser.username}</span>
                                    </div>
                                    <div className="message-thread-summary-meta">
                                        <span>{selectedUser.favoriteGame || 'Social Lobby'}</span>
                                        <span>{messagePagination.totalItems} messages</span>
                                    </div>
                                </div>

                                <div className="message-thread">
                                    {loadingMessages ? (
                                        <div className="page-center-state social-empty-state">
                                            <p>Loading messages...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="page-center-state social-empty-state">
                                            <p>No messages yet. Send the first note to start this conversation.</p>
                                        </div>
                                    ) : (
                                        messages.map((message) => (
                                            <article
                                                key={message.id}
                                                className={`message-bubble${message.isMine ? ' message-bubble-mine' : ''}`}
                                            >
                                                <p>{message.content}</p>
                                                <span>{new Date(message.createdAt).toLocaleString()}</span>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="pagination-row">
                                <button
                                    type="button"
                                    className="control-btn nav-btn pagination-btn"
                                    onClick={() => handleMessagePageChange(messagePagination.page - 1)}
                                    disabled={loadingMessages || messagePagination.page <= 1}
                                >
                                    Previous
                                </button>
                                <span className="pagination-meta">
                                    Page {messagePagination.page} / {messagePagination.totalPages} ({messagePagination.totalItems} messages)
                                </span>
                                <button
                                    type="button"
                                    className="control-btn nav-btn pagination-btn"
                                    onClick={() => handleMessagePageChange(messagePagination.page + 1)}
                                    disabled={loadingMessages || messagePagination.page >= messagePagination.totalPages}
                                >
                                    Next
                                </button>
                            </div>

                            <form onSubmit={handleSendMessage} className="message-composer">
                                <textarea
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value)}
                                    placeholder={`Write a message to ${selectedUser.displayName || selectedUser.username}`}
                                    rows="4"
                                />
                                <div className="message-composer-footer">
                                    <span className="muted-copy">Message length: {draft.trim().length} characters</span>
                                    <button type="submit" disabled={sending || !draft.trim()}>
                                        {sending ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="page-center-state social-empty-state">
                            <p>Select a conversation or choose a friend to begin messaging.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MessagesPage;
