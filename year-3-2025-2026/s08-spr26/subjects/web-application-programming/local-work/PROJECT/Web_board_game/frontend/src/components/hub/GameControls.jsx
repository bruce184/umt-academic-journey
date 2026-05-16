import React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CornerDownLeft, HelpCircle, Undo2 } from 'lucide-react';

const DIRECTIONAL_ICON_SIZE = 44;
const SIDE_ICON_SIZE = 36;

const GameControls = ({ onLeft, onRight, onEnter, onBack, onHint, onUp, onDown, showDirectionalPad = false }) => {
    return (
        <div className="game-controls glass-panel">
            {showDirectionalPad ? (
                <div className="control-dpad">
                    <button
                        type="button"
                        onClick={onUp}
                        disabled={!onUp}
                        className="control-btn control-pad-btn control-square-btn control-dpad-top"
                    >
                        <ArrowUp size={DIRECTIONAL_ICON_SIZE} className="control-action-icon" strokeWidth={2.8} />
                    </button>

                    <div className="control-dpad-middle">
                        <button type="button" onClick={onLeft} className="control-btn control-pad-btn control-square-btn">
                            <ArrowLeft size={DIRECTIONAL_ICON_SIZE} className="control-action-icon" strokeWidth={2.8} />
                        </button>
                        <button
                            type="button"
                            onClick={onDown}
                            disabled={!onDown}
                            className="control-btn control-pad-btn control-square-btn"
                        >
                            <ArrowDown size={DIRECTIONAL_ICON_SIZE} className="control-action-icon" strokeWidth={2.8} />
                        </button>
                        <button type="button" onClick={onRight} className="control-btn control-pad-btn control-square-btn">
                            <ArrowRight size={DIRECTIONAL_ICON_SIZE} className="control-action-icon" strokeWidth={2.8} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="control-pad-row control-pad-row-top">
                    <div className="control-pad-item">
                        <button type="button" onClick={onLeft} className="control-btn control-pad-btn control-square-btn">
                            <span className="control-direction-icon" aria-hidden="true">
                                <ArrowLeft size={SIDE_ICON_SIZE} strokeWidth={2.8} />
                            </span>
                        </button>
                        <span className="control-pad-label">LEFT</span>
                    </div>

                    <div className="control-pad-item">
                        <button type="button" onClick={onRight} className="control-btn control-pad-btn control-square-btn">
                            <span className="control-direction-icon" aria-hidden="true">
                                <ArrowRight size={SIDE_ICON_SIZE} strokeWidth={2.8} />
                            </span>
                        </button>
                        <span className="control-pad-label">RIGHT</span>
                    </div>
                </div>
            )}

            <div className="control-pad-row control-pad-row-bottom">
                <div className="control-pad-item">
                    <button type="button" onClick={onBack} className="control-btn control-pad-btn control-circle-btn control-variant-back">
                        <Undo2 size={44} strokeWidth={2.8} className="control-action-icon" />
                    </button>
                    <span className="control-pad-label">BACK</span>
                </div>

                <div className="control-pad-item">
                    <button type="button" onClick={onEnter} className="control-btn control-pad-btn control-circle-btn control-variant-enter">
                        <CornerDownLeft size={44} strokeWidth={2.8} className="control-action-icon" />
                    </button>
                    <span className="control-pad-label">ENTER</span>
                </div>

                <div className="control-pad-item">
                    <button type="button" onClick={onHint} className="control-btn control-pad-btn control-circle-btn control-variant-help">
                        <HelpCircle size={44} strokeWidth={2.8} className="control-action-icon" />
                    </button>
                    <span className="control-pad-label">HELP</span>
                </div>
            </div>
        </div>
    );
};

export default GameControls;
