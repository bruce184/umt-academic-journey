import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ExplorePostModal from "../components/ExplorePostModal";
import "../styles/PostDetail.css";

export default function PostDetail() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const handleClose = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate("/feed", { replace: true });
    };

    return (
        <MainLayout variant="feed" shellClassName="feed-layout-shell--flush" mainClassName="feed-layout-main--stretch">
            <div className="post-detail-route-backdrop" />

            {postId ? (
                <ExplorePostModal
                    postId={postId}
                    onClose={handleClose}
                    onPostDeleted={() => navigate("/feed", { replace: true })}
                />
            ) : null}
        </MainLayout>
    );
}
