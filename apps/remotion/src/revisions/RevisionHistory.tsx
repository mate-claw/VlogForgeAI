import React from 'react'; export const RevisionHistory:React.FC<{items?:unknown[]}>=({items=[]})=><div>{items.length?`已生成 ${items.length} 个版本`:''}</div>;
