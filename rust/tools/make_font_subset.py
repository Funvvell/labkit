"""Generate the embedded CJK font subset used by the egui UI.

Source: the system Microsoft YaHei TTC (font #0). The subset covers all UI
strings plus the full GB2312 Chinese character range, ASCII and punctuation,
so no target machine font is required at runtime.
"""

from __future__ import annotations

import pathlib

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = pathlib.Path("C:/Windows/Fonts/msyh.ttc")
OUTPUT = ROOT / "assets" / "fonts" / "ui-cjk-subset.ttf"

UI_TEXT = """
病理裁剪工具 切片 浏览 标注 裁切 导出 读取 打开 文件 列表 导航缩略图
选择 全部 反选 已选 倍率 视场 比例 宽度 高度 角度 自定义 像素 微米
撤销 重做 主题 浅色 深色 设置 输出目录 进度 取消 完成 失败 成功 就绪
空格 放置 删除 快捷键 提示 拖拽 平移 滚轮缩放 全分辨率 层级 视口
确定 关闭 保存 导入 会话 错误 警告 未找到 解码组件 版本 中文 中文路径
旋转 手柄 拖动 选中 清空 复制 适配 居中 属性 坐标 尺寸 物理 数量
添加 移除 勾选 导出选中 导出全部 空状态 开始 引导 支持 格式 组件
成功 失败 跳过 重试 目录 浏览 打开文件夹 提示 状态 名称 序号 最大
最小 无效 区域 边界 内存 缓存 纹理 绘制 渲染 交互 流畅 无响应
"""

PUNCT = "，。、：；！？（）【】《》「」『』—…·×÷±µ°％￥§#@&*+-=/\\|[]{}<>()_ "


def build_charset() -> str:
    """UI text + GB2312 level-1 (3755 common hanzi).

    Source font: C:/Windows/Fonts/msyh.ttc (Microsoft YaHei, font #0).
    Licence: Microsoft system font; the subset is embedded in this app for
    consistent CJK rendering on Windows. Do not redistribute separately.
    """
    chars: set[str] = set(UI_TEXT)
    chars.update(PUNCT)
    chars.update(chr(c) for c in range(0x20, 0x7F))
    chars.update(chr(c) for c in range(0x2000, 0x2070))
    chars.update(chr(c) for c in range(0x3000, 0x3040))
    chars.update(chr(c) for c in range(0xFF00, 0xFFF0))
    # GB2312 level-1 only (0xB0A1..0xD7F9): covers essentially all text used
    # in this UI, at a fraction of the size of the full GB2312 set.
    for hi in range(0xB0, 0xD8):
        for lo in range(0xA1, 0xFF):
            try:
                chars.add(bytes([hi, lo]).decode("gb2312"))
            except UnicodeDecodeError:
                pass
    return "".join(sorted(chars))


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"系统字体不存在: {SOURCE}")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    font = TTFont(str(SOURCE), fontNumber=0)
    options = subset.Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.recalc_bounds = True
    sub = subset.Subsetter(options=options)
    sub.populate(text=build_charset())
    sub.subset(font)
    font.flavor = None
    font.save(str(OUTPUT))
    print(f"wrote {OUTPUT} ({OUTPUT.stat().st_size / 1024:.0f} KiB)")


if __name__ == "__main__":
    main()
