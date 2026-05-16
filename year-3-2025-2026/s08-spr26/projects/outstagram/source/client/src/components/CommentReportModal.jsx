import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Info, X } from "lucide-react";
import { useToast } from "./ToastProvider";
import "../styles/CommentReportModal.css";

const DEFAULT_REASONS = [
    "I just don't like it",
    "Bullying or unwanted contact",
    "Suicide, self-injury or eating disorders",
    "Nudity or sexual activity",
    "Hate speech or symbols",
    "Violence or exploitation",
    "Selling or promoting restricted items",
    "Scam, fraud or spam",
    "False information",
];

export default function ReportModal({
    isOpen,
    title = "Report",
    targetLabel = "this content",
    targetName = "",
    question = "Why are you reporting this?",
    reasons = DEFAULT_REASONS,
    onClose,
    onSubmit,
    submitting = false,
}) {
    const [step, setStep] = useState("list");
    const [error, setError] = useState("");
    const toast = useToast();

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        setStep("list");
        setError("");

        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEscape);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    const feedbackBody = useMemo(() => {
        return targetName
            ? `Thanks for letting us know. We'll review ${targetName}'s ${targetLabel} if it goes against our guidelines.`
            : "Thanks for letting us know. We'll review this content if it goes against our guidelines.";
    }, [targetLabel, targetName]);

    if (!isOpen) return null;

    const handlePickReason = async (reason) => {
        setError("");

        try {
            await onSubmit?.(reason);
            setStep("success");
        } catch (submitError) {
            setError(submitError?.message || "Unable to submit report right now.");
        }
    };

    return (
        <div className="comment-report-overlay" onClick={onClose}>
            <div className="comment-report-modal" onClick={(event) => event.stopPropagation()}>
                {step === "list" ? (
                    <>
                        <div className="comment-report-header">
                            <button type="button" className="comment-report-close" onClick={onClose} aria-label="Close report modal">
                                <X size={24} />
                            </button>
                            <h3>{title}</h3>
                            <span />
                        </div>

                        <div className="comment-report-question">{question}</div>

                        <div className="comment-report-list">
                            {reasons.map((reason) => (
                                <button
                                    key={reason}
                                    type="button"
                                    className="comment-report-item"
                                    onClick={() => handlePickReason(reason)}
                                    disabled={submitting}
                                >
                                    <span>{reason}</span>
                                    <ChevronRight size={18} />
                                </button>
                            ))}
                        </div>

                        {error ? <div className="comment-report-error">{error}</div> : null}
                    </>
                ) : (
                    <>
                        <div className="comment-report-success">
                            <div className="comment-report-success-icon">
                                <CheckCircle2 size={56} />
                            </div>
                            <h3>Thanks for your feedback</h3>
                            <p>{feedbackBody}</p>
                        </div>

                        <div className="comment-report-success-actions">
                            <div className="comment-report-success-item">
                                <Info size={18} />
                                <span>We won't notify the creator that you reported.</span>
                            </div>
                        </div>

                        <div className="comment-report-footer">
                            <button type="button" className="comment-report-primary" onClick={() => { toast.info("We logged your report."); onClose(); }}>
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
