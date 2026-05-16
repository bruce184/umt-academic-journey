import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Send, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "./ToastProvider";
import "../styles/ReportProblemModal.css";

const CATEGORY_OPTIONS = [
    { value: "bug", label: "Bug or broken feature" },
    { value: "safety", label: "Safety or abuse" },
    { value: "feedback", label: "Feedback / idea" },
    { value: "other", label: "Other" },
];

export default function ReportProblemModal({ open, onClose, contextPath = "" }) {
    const [category, setCategory] = useState("bug");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useToast();

    const pageContext = useMemo(() => contextPath || window.location.pathname || "/", [contextPath]);

    useEffect(() => {
        if (open) {
            setCategory("bug");
            setDescription("");
            setSubmitted(false);
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            toast.error("Please add a short description.");
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/report/problem`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    category,
                    description: description.trim(),
                    page: pageContext,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || body?.message || "Unable to send report right now.");
            }

            setSubmitted(true);
            toast.success("Report sent to admins. Thank you!");
        } catch (err) {
            console.error(err);
            toast.error(err?.message || "Failed to send report.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-problem-overlay" onClick={onClose}>
            <div className="report-problem-modal" onClick={(e) => e.stopPropagation()}>
                <div className="report-problem-header">
                    <div className="report-problem-title">
                        <AlertCircle size={20} />
                        <span>Report a problem</span>
                    </div>
                    <button type="button" className="report-problem-close" onClick={onClose} aria-label="Close report modal">
                        <X size={18} />
                    </button>
                </div>

                {submitted ? (
                    <div className="report-problem-body report-problem-body--center">
                        <div className="report-problem-success-icon">✓</div>
                        <h3>Thanks for letting us know</h3>
                        <p>Our team will review your report. If we need more details, we’ll reach out via your account email.</p>
                        <button type="button" className="report-problem-button" onClick={onClose}>
                            Close
                        </button>
                    </div>
                ) : (
                    <form className="report-problem-body" onSubmit={handleSubmit}>
                        <div className="report-problem-field">
                            <label htmlFor="problem-category">Category</label>
                            <select
                                id="problem-category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="report-problem-select"
                            >
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="report-problem-field">
                            <label htmlFor="problem-description">What went wrong?</label>
                            <textarea
                                id="problem-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the issue, steps to reproduce, or what you expected to happen."
                                rows={5}
                                maxLength={1000}
                                required
                            />
                            <div className="report-problem-hint">
                                <span>Page: {pageContext}</span>
                                <span>{description.length}/1000</span>
                            </div>
                        </div>

                        <div className="report-problem-actions">
                            <button type="button" className="report-problem-button report-problem-button--ghost" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="report-problem-button" disabled={loading}>
                                <Send size={16} />
                                {loading ? "Sending..." : "Send report"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
