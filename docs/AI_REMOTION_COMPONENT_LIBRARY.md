# AI 可调用 Remotion 组件库 v5

本版本不是多模板，而是一个组件库。Qwen 返回 `DirectorPlan`，Remotion 根据字段组合组件：

- `visualStyle`：整体风格
- `typography`：所有屏幕字体、字号、颜色、标题/字幕位置、文本动画
- `opening`：标题页组件
- `scenes[].transitionIn`：转场组件
- `scenes[].motion`：镜头运动组件
- `scenes[].layout`：版式组件
- `scenes[].captionStyle`：字幕组件
- `scenes[].stickers`：贴纸组件
- `scenes[].overlays`：滤镜覆盖层组件
- `ending`：结尾页组件
- `revisionSuggestions`：AI 动态优化按钮

## 12 类组件目录

```text
apps/remotion/src
├── runtime          # 核心导演组件
├── transitions      # 转场组件
├── motions          # 镜头运动组件
├── captions         # 字幕组件
├── stickers         # 贴纸组件
├── overlays         # 风格滤镜组件
├── openings         # 标题页组件
├── endings          # 结尾页组件
├── audio            # BGM 与音频组件
├── layouts          # 版式组件
├── sceneRoles       # AI 场景角色组件
└── revisions        # AI 动态优化按钮组件
```

固定模板、固定故事文案、固定优化按钮已移除。真实生成必须由 Qwen 返回完整结构。
