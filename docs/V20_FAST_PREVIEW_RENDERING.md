# v20 极速预览不卡顿修复

v19 会在首个预览版本生成前，对所有视频素材执行 60fps `minterpolate=mci` 插帧代理。
这一步非常耗 CPU，容易让前端长时间停在 `10% · rendering`，用户只能看到“等待极速预览”。

v20 调整策略：

1. 预览阶段默认不跑重插帧：`PREVIEW_NORMALIZE_VIDEO_PROXIES=false`。
2. 预览输出使用 `PREVIEW_RENDER_FPS=30`，优先让用户快速看到可播放版本。
3. 高清/后台版本继续使用 60fps CFR proxy：`FINAL_NORMALIZE_VIDEO_PROXIES=true`。
4. 代理生成只处理当前版本实际用到的素材，不再把全部上传素材都预处理一遍。
5. 生成报告拆分为：
   - `fps-normalization-report-preview.json`
   - `fps-normalization-report-final.json`

如果你希望预览也做轻量 fps 代理，可设置：

```env
PREVIEW_NORMALIZE_VIDEO_PROXIES=true
PREVIEW_VIDEO_PROXY_INTERPOLATION=fps
```

不要在预览阶段使用：

```env
PREVIEW_VIDEO_PROXY_INTERPOLATION=mci
```

否则仍可能卡很久。
