# BGM 与风格参考

v4 中 template_catalog.json 不再作为固定模板让用户选择，只作为 AI 的风格参考资料。

BGM 仍然只允许从用户提供的候选中自动选择。AI 在 DirectorPlan 中返回 `bgmId`，后端根据 `bgmId` 映射到本地 MP3 文件。

没有固定 BGM 兜底逻辑。如果 AI 返回了不在候选列表中的 `bgmId`，接口会报错，要求模型修正或重新生成。
