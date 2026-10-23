# meal-searcher

《Web 开发技术》**第三次作业**：菜谱搜索页面（Recipe Finder），练 HTML / CSS / JS 加 AJAX。

- 线上地址：<https://meal-searcher-tan.vercel.app>
- 仓库：<https://github.com/lingrui0202/meal-searcher>

## 里面是什么

原生三件套 + 一个公开 API：

| 文件 | 行数 | 作用 |
|---|---|---|
| `index.html` | 85 | 搜索栏、结果网格、详情弹层 |
| `style.css` | 358 | 卡片网格、弹层、加载与空状态 |
| `script.js` | 229 | 调 TheMealDB、渲染卡片、详情面板交互 |

## 数据来源

[TheMealDB](https://www.themealdb.com/api.php) 免费开放接口，**不需要 Key**：

```
搜索  https://www.themealdb.com/api/json/v1/1/search.php?s=关键词
详情  https://www.themealdb.com/api/json/v1/1/lookup.php?i=菜品id
```

## 流程

搜索框 → 查 API → 渲染卡片网格 → 点卡片 → 弹详情面板

- 详情里有：菜品图、名称、分类、做法步骤、配料清单、YouTube 视频链接
- 三种关闭方式：右上角关闭按钮、返回按钮、点遮罩层
- 空结果 / 加载中 / 请求出错都有提示，不会白屏
- 附加功能：上次搜的关键词存在 `localStorage`（键 `meal-search-last-keyword`），下次打开自动回填

## 怎么跑

**需要联网**（要调 API）。直接双击 `index.html` 一般能用；浏览器拦跨域的话起个本地服务器：

```bash
npx serve .
# 或
python -m http.server 8000
```

## 部署

Vercel import 这个仓库，Framework Preset 选 **Other**，不需要构建。

> 注意：页面本身是静态的，但运行时要访问 `themealdb.com`，所以**离线打开搜索不可用**，这是设计如此，不是 bug。
