import React from 'react';
import type { DirectorRevisionSuggestion } from '@ai-vlog/shared';
import { RevisionButton } from './RevisionButton';
export const RevisionSuggestionPanel: React.FC<{ suggestions: DirectorRevisionSuggestion[]; loading?: string | null; onClick: (s: DirectorRevisionSuggestion) => void }> = ({ suggestions, loading, onClick }) => <div className="revisionActions">{suggestions.map((s) => <RevisionButton key={s.id || s.label} suggestion={s} loading={loading === (s.id || s.label)} disabled={Boolean(loading)} onClick={() => onClick(s)} />)}</div>;
