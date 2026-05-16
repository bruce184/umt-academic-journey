import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import StoryViewer from "./StoryViewer";
import CreateStoryModal from "./CreateStoryModal";
import { Plus } from "lucide-react";
import "../styles/Stories.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function StoryRing() {
    const [storyGroups, setStoryGroups] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerGroupIdx, setViewerGroupIdx] = useState(0);
    const [createOpen, setCreateOpen] = useState(false);
    const [myUserId, setMyUserId] = useState(null);
    const [myAvatar, setMyAvatar] = useState(null);

    const fetchStories = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            const res = await fetch(`${API_BASE}/api/v1/stories/feed`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
                const json = await res.json();
                setStoryGroups(json.data?.storyGroups || []);
            }
        } catch (_) { }
    }, []);

    // Get current user info
    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!session) return;
            setMyUserId(session.user?.id || null);
            try {
                const res = await fetch(`${API_BASE}/api/v1/me`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (res.ok) {
                    const json = await res.json();
                    setMyAvatar(json.data?.profile?.avatar_url || null);
                }
            } catch (_) { }
        });
    }, []);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    const openViewer = (idx) => {
        setViewerGroupIdx(idx);
        setViewerOpen(true);
    };

    // Find the current user's story group by matching user_id
    const myGroupIdx = storyGroups.findIndex(g => g.user.user_id === myUserId);
    const hasMyStories = myGroupIdx >= 0;

    return (
        <>
            <div className="story-ring-container">
                {/* Add Story / My Story */}
                <div
                    className="story-ring-item story-ring-add"
                    onClick={() => {
                        if (hasMyStories) {
                            openViewer(myGroupIdx);
                        } else {
                            setCreateOpen(true);
                        }
                    }}
                >
                    <div className="story-ring-avatar">
                        {myAvatar
                            ? <img src={myAvatar} alt="Your story" />
                            : <div className="story-ring-avatar-fallback">+</div>
                        }
                    </div>
                    <span
                        className="story-ring-add-icon"
                        onClick={(e) => { e.stopPropagation(); setCreateOpen(true); }}
                    >
                        +
                    </span>
                    <span className="story-ring-username">Your story</span>
                </div>

                {/* Other users' stories (skip own group) */}
                {storyGroups.map((group, idx) => {
                    // Skip own stories — already shown as "Your story"
                    if (group.user.user_id === myUserId) return null;

                    const user = group.user;
                    const allSeen = !group.has_unseen;

                    return (
                        <div
                            key={user.user_id}
                            className="story-ring-item"
                            onClick={() => openViewer(idx)}
                        >
                            <div className={`story-ring-avatar ${allSeen ? "seen" : ""}`}>
                                {user.avatar_url
                                    ? <img src={user.avatar_url} alt={user.username} />
                                    : <div className="story-ring-avatar-fallback">{(user.username || "?")[0].toUpperCase()}</div>
                                }
                            </div>
                            <span className="story-ring-username">{user.username}</span>
                        </div>
                    );
                })}
            </div>

            {/* Viewer */}
            {viewerOpen && storyGroups.length > 0 && (
                <StoryViewer
                    storyGroups={storyGroups}
                    initialGroupIndex={viewerGroupIdx}
                    onClose={() => {
                        setViewerOpen(false);
                        fetchStories(); // Refresh seen states
                    }}
                />
            )}

            {/* Create Modal */}
            <CreateStoryModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onStoryCreated={fetchStories}
            />
        </>
    );
}
