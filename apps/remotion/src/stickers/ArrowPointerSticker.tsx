import React from 'react';
export const ArrowPointerSticker: React.FC<{color:string}> = ({color}) => <div style={{position:'absolute',right:120,top:500,color,fontSize:80,transform:'rotate(-18deg)',textShadow:'0 6px 18px rgba(0,0,0,.3)'}}>↙</div>;
