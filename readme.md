# Eslint-parse

## eslintparse: eslint 辅助工具
- `eslintparse -f vue`: 格式化 vue 文件
  - 默认顺序是 `<script></script><template></template><style></style>`
  - 指定顺序 `-fi [0,1,2]`
    - `0: script`
    - `1: template`
    - `2: style`
- `eslintparse -c modify`: 增量检查文件
- `eslintparse -c all`: 全量检查文件
- `eslintparse -i ./examples/vite-demo`: 指定格式化项目路径(必选项)
- `eslintparse -i ./examples/vite-demo -c modify`: 校验 vite 示例 demo
