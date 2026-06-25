# v15 稳定画面 + 视觉风格差异化

这版针对真实生成反馈修复两个问题：

1. 0:13–0:15 一类“画面抖动 / 跳动 / 不稳”的问题。
2. 宠物、亲子、吃饭、城市、旅行生成出来像同一个温暖渐变模板的问题。

## 抖动根因

这次不是单纯转场问题，代码里还有几个会造成“看起来抖”的来源：

- 视频素材在部分 layout 中被前景和模糊背景同时解码，浏览器预览时容易卡顿或抖动。
- `DynamicDecorations`、`HeartSticker`、`StarSticker`、`PawSticker`、`BokehOverlayLayer`、`LightLeakLayer` 等装饰层每帧都在移动。
- `PolaroidLayout` 每帧轻微旋转。
- `BeatPulseController` 在非 dynamic 场景也可能叠加闪动层。
- stable 模式虽然限制了主体 motion，但没有限制贴纸/装饰/overlay 的运动。

## 解决方案

- 新增 `utils/stability.ts`，统一做 motion / transition / background decode 安全策略。
- stable 模式下：
  - 视频主体不再做 Remotion scale/translate/rotate。
  - 禁止双视频解码背景，除非是 dynamic。
  - 贴纸、bokeh、light leak、decorations 都改成静态或极轻微。
  - `BeatPulseController` 只在 dynamic 开启。
  - `PolaroidLayout` stable 下不再每帧旋转。

## 视觉差异化

新增/重写 `visualStylePacks.ts`，把不同场景做成不同视觉语言：

- `cute_pet`: 圆润字体、气泡字幕、爪印/爱心/星星、可爱明亮背景。
- `kid_playful`: 明亮童趣、圆润/手写字体、亲子贴纸。
- `food_diary`: 暖色咖啡/餐桌感、food label、优雅标题。
- `city_rec`: REC 框、timecode、mono 字体、记录仪底栏。
- `travel_postcard`: 明信片/电影边框、travel label、film grain。
- `night_mood`: 深色、少贴纸、电影字幕。
- `warm_family`: 温暖家庭回忆。

## 重要原则

仍然不写死故事文案、不写死字幕、不写死结尾金句。
Qwen 仍然负责故事、素材顺序、标题、字幕、BGM、优化按钮。
Remotion 只负责根据 `visualStylePack` 做视觉表现。
