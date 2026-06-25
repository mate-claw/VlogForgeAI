import React from 'react';
export const HandDrawnCircleSticker: React.FC<{color:string}> = ({color}) => <div style={{position:'absolute',left:92,top:360,width:260,height:180,border:`8px solid ${color}`,borderRadius:'50%',transform:'rotate(-8deg)',opacity:.82}}/>;
