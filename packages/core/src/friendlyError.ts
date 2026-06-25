export function toUserFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '未知错误');
  const lower = message.toLowerCase();
  if (lower.includes('qwen') || lower.includes('dashscope') || lower.includes('api 调用失败')) {
    return 'AI 导演服务暂时没有完成处理。请检查 Qwen Key、模型名称和网络连接后重试。';
  }
  if (lower.includes('ffmpeg') || lower.includes('ffprobe') || lower.includes('codec')) {
    return '素材转码失败。请换一个常见格式的视频或图片后重试，例如 MP4、MOV、JPG、PNG。';
  }
  if (lower.includes('remotion') || lower.includes('render') || lower.includes('chromium')) {
    return '视频渲染失败。系统已记录日志，请减少素材数量或缩短视频后重试。';
  }
  if (lower.includes('schema') || lower.includes('directorplan') || lower.includes('校验失败') || lower.includes('ai 返回')) {
    return 'AI 导演返回的剪辑方案不完整，系统已尝试自修复但仍未通过校验。请重新生成一次。';
  }
  if (lower.includes('enoent') || lower.includes('找不到文件')) {
    return '素材文件缺失或路径无效。请重新上传素材后再生成。';
  }
  return message.slice(0, 220);
}
