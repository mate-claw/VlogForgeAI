import React from 'react';
export const BgmMissingWarning: React.FC<{ bgmId?: string }> = ({ bgmId }) => bgmId ? <div style={{position:'absolute',left:60,right:60,bottom:38,textAlign:'center',color:'rgba(255,255,255,.5)',fontSize:18}}>BGM 文件未上传：{bgmId}</div> : null;
