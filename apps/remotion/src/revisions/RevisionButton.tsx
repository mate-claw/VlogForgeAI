import React from 'react';
import type { DirectorRevisionSuggestion } from '@ai-vlog/shared';
export const RevisionButton:React.FC<{suggestion:DirectorRevisionSuggestion; loading?:boolean; disabled?:boolean; onClick:()=>void}> = ({suggestion,loading,disabled,onClick}) => <button className="revisionButton" disabled={disabled} onClick={onClick}><strong>{loading?'生成中...':suggestion.label}</strong><span>{suggestion.reason || suggestion.expectedChange || suggestion.instruction}</span></button>;
