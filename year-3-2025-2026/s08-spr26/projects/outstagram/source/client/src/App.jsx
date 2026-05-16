import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import RequireAuth from "./components/requireAuth";
import MaintenanceGate from "./components/MaintenanceGate";
import AuthCallback from "./pages/AuthCallback";
import CompleteProfile from "./pages/CompleteProfile";
import NewPost from "./pages/NewPost";
import PostDetail from "./pages/PostDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import FollowersList from "./pages/FollowersList";
import FollowingList from "./pages/FollowingList";
import Notifications from "./pages/Notifications";
import SearchPage from "./pages/SearchPage";
import DirectMessages from "./pages/DirectMessages";
import Activity from "./pages/Activity";
import Suggestions from "./pages/Suggestions";

export default function App() {
    return (
        <BrowserRouter>
            <MaintenanceGate>
                <Routes>
                    {/* Home */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/complete-profile" element={<CompleteProfile />} />
                    <Route
                        path="/feed"
                        element={
                            <RequireAuth>
                                <Feed />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/new"
                        element={
                            <RequireAuth>
                                <NewPost />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/p/:postId"
                        element={
                            <RequireAuth>
                                <PostDetail />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/profile/:username"
                        element={
                            <RequireAuth>
                                <Profile />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/profile/edit"
                        element={
                            <RequireAuth>
                                <EditProfile />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/:username/followers"
                        element={
                            <RequireAuth>
                                <FollowersList />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/:username/following"
                        element={
                            <RequireAuth>
                                <FollowingList />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <RequireAuth>
                                <Notifications />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <RequireAuth>
                                <SearchPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/messages"
                        element={
                            <RequireAuth>
                                <DirectMessages />
                            </RequireAuth>
                        }
                    />
                <Route
                    path="/activity"
                    element={
                        <RequireAuth>
                            <Activity />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/suggestions"
                    element={
                        <RequireAuth>
                            <Suggestions />
                        </RequireAuth>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </MaintenanceGate>
        </BrowserRouter>
    );
}
