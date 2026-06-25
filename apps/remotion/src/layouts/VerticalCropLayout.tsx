import React from 'react'; export const VerticalCropLayout:React.FC<{children:React.ReactNode}> = ({children}) => <div style={{position:'absolute',inset:0,overflow:'hidden'}}>{children}</div>;
