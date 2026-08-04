import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const fontMap = {
  digits: ["𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗"],
  lower: [
    "𝐚", "𝐛", "𝐜", "𝐝", "𝐞", "𝐟", "𝐠", "𝐡", "𝐢", "𝐣", "𝐤", "𝐥", "𝐦",
    "𝐧", "𝐨", "𝐩", "𝐪", "𝐫", "𝐬", "𝐭", "𝐮", "𝐯", "𝐰", "𝐱", "𝐲", "𝐳",
  ],
  upper: [
    "𝐀", "𝐁", "𝐂", "𝐃", "𝐄", "𝐅", "𝐆", "𝐇", "𝐈", "𝐉", "𝐊", "𝐋", "𝐌",
    "𝐍", "𝐎", "𝐏", "𝐐", "𝐑", "𝐒", "𝐓", "𝐔", "𝐕", "𝐖", "𝐗", "𝐘", "𝐙",
  ],
};

const oldDigits = {
  "𝟬": "0", "𝟭": "1", "𝟮": "2", "𝟯": "3", "𝟰": "4",
  "𝟱": "5", "𝟲": "6", "𝟳": "7", "𝟴": "8", "𝟵": "9",
};

const oldUpper = {
  "𝗔": "A", "𝗕": "B", "𝗖": "C", "𝗗": "D", "𝗘": "E", "𝗙": "F", "𝗚": "G",
  "𝗛": "H", "𝗜": "I", "𝗝": "J", "𝗞": "K", "𝗟": "L", "𝗠": "M", "𝗡": "N",
  "𝗢": "O", "𝗣": "P", "𝗤": "Q", "𝗥": "R", "𝗦": "S", "𝗧": "T", "𝗨": "U",
  "𝗩": "V", "𝗪": "W", "𝗫": "X", "𝗬": "Y", "𝗭": "Z",
};

const oldLower = {
  "𝗮": "a", "𝗯": "b", "𝗰": "c", "𝗱": "d", "𝗲": "e", "𝗳": "f", "𝗴": "g",
  "𝗵": "h", "𝗶": "i", "𝗷": "j", "𝗸": "k", "𝗹": "l", "𝗺": "m", "𝗻": "n",
  "𝗼": "o", "𝗽": "p", "𝗾": "q", "𝗿": "r", "𝘀": "s", "𝘁": "t", "𝘂": "u",
  "𝘃": "v", "𝘄": "w", "𝘅": "x", "𝘆": "y", "𝘇": "z",
};

const emojiNums = {
  "1️⃣": "❶",
  "2️⃣": "❷",
  "3️⃣": "❸",
  "4️⃣": "❹",
  "5️⃣": "❺",
  "6️⃣": "❻",
  "7️⃣": "❼",
  "8️⃣": "❽",
  "9️⃣": "❾",
};

const sampleText = `活动时间：5月30日20点-6月1日24点

SALE 618 OFF 50%

立即领取：
https://abc123.com/sale618`;

const stitchTemplates = {
  two: {
    name: "两张横向拼接",
    note: "按原图比例等高横向拼接，不预设成品比例。",
    count: 2,
    cols: 2,
    rows: 1,
    width: 1600,
    height: 900,
    slotClass: "wide",
    badge: "等高拼接",
  },
  vertical: {
    name: "两张上下拼接",
    note: "按原图比例等宽上下拼接，不预设成品比例。",
    count: 2,
    cols: 1,
    rows: 2,
    width: 900,
    height: 1600,
    slotClass: "wide",
    badge: "等宽拼接",
  },
  four: {
    name: "四张 3:4 拼接",
    note: "上面两张，下面两张，成品仍为 3:4。",
    count: 4,
    cols: 2,
    rows: 2,
    width: 1200,
    height: 1600,
    slotClass: "portrait",
    badge: "3:4 成品",
  },
  six: {
    name: "六张 3:4 拼接",
    note: "上面三张，下面三张，成品为 9:8。",
    count: 6,
    cols: 3,
    rows: 2,
    width: 1800,
    height: 1600,
    slotClass: "portrait",
    badge: "9:8 成品",
  },
};

const storageKey = "wechat-tool-collage-state-v2";

const defaultWatermark = {
  enabled: true,
  line1: "淘宝闪购搜",
  line2: "300466",
  line3: "领外卖红包",
  size: 28,
  opacity: 30,
  groupGap: 180,
  color: "#ffffff",
};

const defaultHeadline = {
  enabled: false,
  line1: "爆品热销榜",
  line2: "京鲜生水果",
  size: 96,
  color: "#ffd82f",
};

const defaultTwoLayout = {
  width: 1600,
  height: 900,
  rects: [
    { x: 0, y: 0, width: 800, height: 900 },
    { x: 800, y: 0, width: 800, height: 900 },
  ],
  imageRects: [
    { x: 0, y: 0, width: 800, height: 900 },
    { x: 800, y: 0, width: 800, height: 900 },
  ],
  views: [
    { scale: 1, offsetX: 0, offsetY: 0 },
    { scale: 1, offsetX: 0, offsetY: 0 },
  ],
};

const defaultVerticalLayout = {
  width: 900,
  height: 1600,
  rects: [
    { x: 0, y: 0, width: 900, height: 800 },
    { x: 0, y: 800, width: 900, height: 800 },
  ],
  imageRects: [
    { x: 0, y: 0, width: 900, height: 800 },
    { x: 0, y: 800, width: 900, height: 800 },
  ],
  views: [
    { scale: 1, offsetX: 0, offsetY: 0 },
    { scale: 1, offsetX: 0, offsetY: 0 },
  ],
};

const resizeEdges = ["top", "right", "bottom", "left"];
const adjustableTemplateKeys = ["two", "vertical"];

function clampNumber(value, min, max = Number.POSITIVE_INFINITY) {
  return Math.min(max, Math.max(min, value));
}

function isAdjustableTemplate(templateKey) {
  return adjustableTemplateKeys.includes(templateKey);
}

function getStitchOrientation(templateKey) {
  return templateKey === "vertical" ? "vertical" : "horizontal";
}

function getDefaultLayout(templateKey) {
  return templateKey === "vertical" ? defaultVerticalLayout : defaultTwoLayout;
}

function emptyImagesByTemplate() {
  return Object.fromEntries(
    Object.entries(stitchTemplates).map(([key, template]) => [
      key,
      Array(template.count).fill(null),
    ]),
  );
}

function readSavedPosterState() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    return {
      templateKey: stitchTemplates[saved.templateKey] ? saved.templateKey : "two",
      gap: saved.gap ?? 0,
      format: saved.format || "image/png",
      watermark: { ...defaultWatermark, ...(saved.watermark || {}) },
      headline: { ...defaultHeadline, ...(saved.headline || {}) },
    };
  } catch {
    return {
      templateKey: "two",
      gap: 0,
      format: "image/png",
      watermark: defaultWatermark,
      headline: defaultHeadline,
    };
  }
}

function replaceByMap(text, map) {
  return Object.entries(map).reduce(
    (result, [from, to]) => result.split(from).join(to),
    text,
  );
}

function convertBlock(text) {
  let result = text;

  result = replaceByMap(result, oldDigits);
  result = replaceByMap(result, oldUpper);
  result = replaceByMap(result, oldLower);
  result = replaceByMap(result, emojiNums);
  result = result.split("*").join("✘");

  result = result.replace(/\d/g, (digit) => fontMap.digits[Number(digit)] || digit);
  result = result.replace(/[a-z]/g, (letter) => fontMap.lower[letter.charCodeAt(0) - 97] || letter);
  result = result.replace(/[A-Z]/g, (letter) => fontMap.upper[letter.charCodeAt(0) - 65] || letter);

  return result;
}

function convertText(text) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

  return text
    .split(urlRegex)
    .map((part) => (urlRegex.test(part) ? part : convertBlock(part)))
    .join("");
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function pickBaseImage(images, orientation = "horizontal") {
  const presentImages = images
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => image);

  if (presentImages.length === 0) return null;

  return presentImages.reduce((base, item) => {
    if (orientation === "vertical") {
      if (item.image.height < base.image.height) return item;
      if (item.image.height === base.image.height && item.image.width < base.image.width) return item;
      return base;
    }
    if (item.image.width < base.image.width) return item;
    if (item.image.width === base.image.width && item.image.height < base.image.height) return item;
    return base;
  });
}

function getTwoRects(images, gap = 0, sizeOverride = null, orientation = "horizontal") {
  const safeGap = Math.max(0, Number(gap) || 0);
  const base = pickBaseImage(images, orientation);
  const defaultLayout = orientation === "vertical" ? defaultVerticalLayout : defaultTwoLayout;
  const rects = images.map((image) => {
    const ratio = image ? image.width / image.height : defaultLayout.rects[0].width / defaultLayout.rects[0].height;
    if (orientation === "vertical") {
      const baseWidth = sizeOverride?.width || base?.image.width || defaultLayout.width;
      return {
        x: 0,
        y: 0,
        width: baseWidth,
        height: Math.max(80, Math.round(baseWidth / ratio)),
      };
    }
    const baseHeight = sizeOverride?.height || base?.image.height || defaultLayout.height;
    return {
      x: 0,
      y: 0,
      width: Math.max(80, Math.round(baseHeight * ratio)),
      height: baseHeight,
    };
  });

  if (sizeOverride) {
    if (orientation === "vertical") {
      const totalHeight = rects.reduce((total, rect) => total + rect.height, 0) + safeGap;
      const scale = sizeOverride.height / Math.max(1, totalHeight);
      rects.forEach((rect) => {
        rect.width = sizeOverride.width;
        rect.height = Math.max(80, Math.round(rect.height * scale));
      });
    } else {
      const totalWidth = rects.reduce((total, rect) => total + rect.width, 0) + safeGap;
      const scale = sizeOverride.width / Math.max(1, totalWidth);
      rects.forEach((rect) => {
        rect.width = Math.max(80, Math.round(rect.width * scale));
        rect.height = sizeOverride.height;
      });
    }
  }

  rects[0].x = 0;
  rects[0].y = 0;
  if (orientation === "vertical") {
    rects[1].x = 0;
    rects[1].y = rects[0].height + safeGap;
  } else {
    rects[1].x = rects[0].width + safeGap;
    rects[1].y = 0;
  }
  return rects;
}

function createTwoLayout(images = [], gap = 0, views = defaultTwoLayout.views, sizeOverride = null, orientation = "horizontal") {
  const rects = getTwoRects(images, gap, sizeOverride, orientation);
  const safeGap = Math.max(0, Number(gap) || 0);
  const defaultLayout = orientation === "vertical" ? defaultVerticalLayout : defaultTwoLayout;
  const width = orientation === "vertical"
    ? rects[0]?.width || defaultLayout.width
    : rects.reduce((total, rect) => total + rect.width, 0) + safeGap;
  const height = orientation === "vertical"
    ? rects.reduce((total, rect) => total + rect.height, 0) + safeGap
    : rects[0]?.height || defaultLayout.height;

  return {
    width: sizeOverride?.width || Math.max(240, width),
    height: sizeOverride?.height || Math.max(160, height),
    rects,
    imageRects: rects.map((rect) => ({ ...rect })),
    views: views.map((view) => ({ ...view })),
  };
}

function drawImageCropped(ctx, image, rect, imageRect = rect) {
  const { x, y, width, height } = rect;
  if (!image) {
    drawImageFit(ctx, image, x, y, width, height, "cover");
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.drawImage(image, imageRect.x, imageRect.y, imageRect.width, imageRect.height);
  ctx.restore();
}

function swapItems(items, from, to) {
  return items.map((item, index) => {
    if (index === from) return items[to];
    if (index === to) return items[from];
    return item;
  });
}

function resizeTwoLayout(resizeState, dx, dy) {
  const next = {
    ...resizeState.layout,
    rects: resizeState.layout.rects.map((rect) => ({ ...rect })),
    imageRects: resizeState.layout.imageRects.map((rect) => ({ ...rect })),
    views: resizeState.layout.views.map((view) => ({ ...view })),
  };
  const { edge, type } = resizeState;

  if (type === "canvas") {
    if (edge === "right") {
      next.width = Math.round(clampNumber(resizeState.layout.width + dx, 240, 4000));
    }
    if (edge === "bottom") {
      next.height = Math.round(clampNumber(resizeState.layout.height + dy, 160, 4000));
    }
    if (edge === "left") {
      const width = Math.round(clampNumber(resizeState.layout.width - dx, 240, 4000));
      const shift = resizeState.layout.width - width;
      next.width = width;
      next.rects = next.rects.map((rect) => ({ ...rect, x: rect.x - shift }));
      next.imageRects = next.imageRects.map((rect) => ({ ...rect, x: rect.x - shift }));
    }
    if (edge === "top") {
      const height = Math.round(clampNumber(resizeState.layout.height - dy, 160, 4000));
      const shift = resizeState.layout.height - height;
      next.height = height;
      next.rects = next.rects.map((rect) => ({ ...rect, y: rect.y - shift }));
      next.imageRects = next.imageRects.map((rect) => ({ ...rect, y: rect.y - shift }));
    }
    return next;
  }

  return cropImageRect(next, resizeState, dx, dy);
}

function cropImageRect(layout, resizeState, dx, dy) {
  const minSize = 80;
  const safeGap = Math.max(0, Number(resizeState.gap) || 0);
  const orientation = resizeState.orientation || "horizontal";
  const rect = layout.rects[resizeState.index];
  const imageRect = layout.imageRects[resizeState.index];
  if (!rect) return layout;

  const cropOffsets = layout.rects.map((item, itemIndex) => ({
    left: item.x - layout.imageRects[itemIndex].x,
    top: item.y - layout.imageRects[itemIndex].y,
  }));

  if (resizeState.edge === "left") {
    cropOffsets[resizeState.index].left = clampNumber(
      cropOffsets[resizeState.index].left + dx,
      0,
      imageRect.width - minSize,
    );
    rect.width = imageRect.width - cropOffsets[resizeState.index].left;
  }
  if (resizeState.edge === "right") {
    rect.width = clampNumber(
      resizeState.rect.width + dx,
      minSize,
      imageRect.width - cropOffsets[resizeState.index].left,
    );
  }
  if (resizeState.edge === "top") {
    cropOffsets[resizeState.index].top = clampNumber(
      cropOffsets[resizeState.index].top + dy,
      0,
      imageRect.height - minSize,
    );
    rect.height = imageRect.height - cropOffsets[resizeState.index].top;
  }
  if (resizeState.edge === "bottom") {
    rect.height = clampNumber(
      resizeState.rect.height + dy,
      minSize,
      imageRect.height - cropOffsets[resizeState.index].top,
    );
  }

  if (orientation === "vertical") {
    layout.rects[0].y = 0;
    layout.rects[1].y = layout.rects[0].height + safeGap;
    const minX = Math.min(...layout.rects.map((item) => item.x));
    layout.rects = layout.rects.map((item) => ({ ...item, x: item.x - minX }));
  } else {
    layout.rects[0].x = 0;
    layout.rects[1].x = layout.rects[0].width + safeGap;
    const minY = Math.min(...layout.rects.map((item) => item.y));
    layout.rects = layout.rects.map((item) => ({ ...item, y: item.y - minY }));
  }
  layout.imageRects = layout.imageRects.map((item, itemIndex) => ({
    ...item,
    x: layout.rects[itemIndex].x - cropOffsets[itemIndex].left,
    y: layout.rects[itemIndex].y - cropOffsets[itemIndex].top,
  }));
  layout.width = orientation === "vertical"
    ? Math.max(240, Math.round(Math.max(...layout.rects.map((item) => item.x + item.width))))
    : Math.max(240, Math.round(layout.rects[0].width + layout.rects[1].width + safeGap));
  layout.height = orientation === "vertical"
    ? Math.max(160, Math.round(layout.rects[0].height + layout.rects[1].height + safeGap))
    : Math.max(160, Math.round(Math.max(...layout.rects.map((item) => item.y + item.height))));

  return layout;
}

function drawImageFit(ctx, image, x, y, width, height, fit) {
  if (!image) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.strokeStyle = "rgba(255,255,255,.56)";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "rgba(255,255,255,.86)";
    ctx.font = `700 ${Math.max(20, Math.round(width * 0.045))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("粘贴图片", x + width / 2, y + height / 2);
    ctx.restore();
    return;
  }

  const imageRatio = image.width / image.height;
  const targetRatio = width / height;
  let drawWidth;
  let drawHeight;

  if (fit === "cover" ? imageRatio > targetRatio : imageRatio < targetRatio) {
    drawWidth = fit === "cover" ? height * imageRatio : width;
    drawHeight = fit === "cover" ? height : width / imageRatio;
  } else {
    drawWidth = fit === "cover" ? width : height * imageRatio;
    drawHeight = fit === "cover" ? width / imageRatio : height;
  }

  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function CopyFormatter({ active, showToast }) {
  const [input, setInput] = useState(sampleText);
  const output = useMemo(() => convertText(input), [input]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(output);
      showToast("已复制到剪贴板");
    } catch {
      showToast("复制失败，请手动复制");
    }
  };

  return (
    <section className={`tool-view ${active ? "active" : ""}`} hidden={!active}>
      <div className="tool-grid" aria-label="转换工具">
        <article className="panel input-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">输入</p>
              <h2>原始文案</h2>
            </div>
            <div className="header-actions">
              <span className="count-pill">{input.length} 字</span>
              <button className="danger-button" type="button" onClick={() => setInput("")}>
                一键删除
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="请粘贴微信群推广文案..."
            aria-label="原始文案"
          />

          <div className="button-row">
            <button className="ghost-button" type="button" onClick={() => setInput(sampleText)}>
              恢复示例
            </button>
          </div>
        </article>

        <article className="panel output-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">结果</p>
              <h2>美化文案</h2>
            </div>
            <button className="copy-button" type="button" onClick={copyText}>
              一键复制
            </button>
          </div>

          <div className="output-box" aria-label="转换结果">
            {output || "转换结果会显示在这里"}
          </div>

          <div className="tips-row">
            <span>链接自动保护</span>
            <span>数字自动加粗</span>
            <span>* 自动替换为 ✘</span>
          </div>
        </article>
      </div>
    </section>
  );
}

function PosterComposer({ active, showToast }) {
  const canvasRef = useRef(null);
  const previewWrapRef = useRef(null);
  const resizeRef = useRef(null);
  const [savedState] = useState(() => readSavedPosterState());
  const [templateKey, setTemplateKey] = useState(savedState.templateKey);
  const [imagesByTemplate, setImagesByTemplate] = useState(emptyImagesByTemplate);
  const [activeSlot, setActiveSlot] = useState(0);
  const [gap, setGap] = useState(savedState.gap);
  const [format, setFormat] = useState(savedState.format);
  const [watermark, setWatermark] = useState(savedState.watermark);
  const [headline, setHeadline] = useState(savedState.headline);
  const [pairLayouts, setPairLayouts] = useState({
    two: defaultTwoLayout,
    vertical: defaultVerticalLayout,
  });
  const [downloadHref, setDownloadHref] = useState("#");
  const template = stitchTemplates[templateKey];
  const images = imagesByTemplate[templateKey] || Array(template.count).fill(null);
  const orientation = getStitchOrientation(templateKey);
  const activeLayout = useMemo(() => (
    isAdjustableTemplate(templateKey) ? pairLayouts[templateKey] : {
      width: template.width,
      height: template.height,
      rects: [],
    }
  ), [pairLayouts, template.height, template.width, templateKey]);

  const updatePairLayout = useCallback((updater, key = templateKey) => {
    setPairLayouts((current) => {
      const previous = current[key] || getDefaultLayout(key);
      const nextLayout = typeof updater === "function" ? updater(previous) : updater;
      return {
        ...current,
        [key]: nextLayout,
      };
    });
  }, [templateKey]);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        templateKey,
        gap,
        format,
        watermark,
        headline,
      }),
    );
  }, [format, gap, headline, templateKey, watermark]);

  const deleteImage = useCallback((slot = activeSlot) => {
    setImagesByTemplate((current) => ({
      ...current,
      [templateKey]: current[templateKey].map((item, index) => (index === slot ? null : item)),
    }));
    setActiveSlot(slot);
    showToast(`图 ${slot + 1} 已删除`);
  }, [activeSlot, showToast, templateKey]);

  const resetPoster = () => {
    setImagesByTemplate((current) => ({
      ...current,
      [templateKey]: Array(template.count).fill(null),
    }));
    if (isAdjustableTemplate(templateKey)) updatePairLayout(getDefaultLayout(templateKey));
    setActiveSlot(0);
    showToast("当前模板图片已清空");
  };

  const resetTwoLayout = useCallback(() => {
    updatePairLayout(createTwoLayout(images, gap, getDefaultLayout(templateKey).views, null, orientation));
    showToast(templateKey === "vertical" ? "已恢复等宽上下拼接" : "已恢复等高横向拼接");
  }, [gap, images, orientation, showToast, templateKey, updatePairLayout]);

  const updateGap = useCallback((value) => {
    setGap(value);
    if (!isAdjustableTemplate(templateKey)) return;

    updatePairLayout((current) => {
      const safeGap = Math.max(0, Number(value) || 0);
      const rects = current.rects.map((rect) => ({ ...rect }));
      const imageRects = current.imageRects.map((rect) => ({ ...rect }));
      const cropOffsets = rects.map((rect, index) => ({
        left: rect.x - imageRects[index].x,
        top: rect.y - imageRects[index].y,
      }));
      if (orientation === "vertical") {
        rects[0].y = 0;
        rects[1].y = rects[0].height + safeGap;
        imageRects[0].y = rects[0].y - cropOffsets[0].top;
        imageRects[1].y = rects[1].y - cropOffsets[1].top;
      } else {
        rects[0].x = 0;
        rects[1].x = rects[0].width + safeGap;
        imageRects[0].x = rects[0].x - cropOffsets[0].left;
        imageRects[1].x = rects[1].x - cropOffsets[1].left;
      }

      return {
        ...current,
        imageRects,
        rects,
        width: orientation === "vertical"
          ? Math.max(240, Math.round(Math.max(...rects.map((rect) => rect.x + rect.width))))
          : Math.max(240, Math.round(rects[0].width + rects[1].width + safeGap)),
        height: orientation === "vertical"
          ? Math.max(160, Math.round(rects[0].height + rects[1].height + safeGap))
          : current.height,
      };
    });
  }, [orientation, templateKey, updatePairLayout]);

  const applyImage = async (file, slot = activeSlot) => {
    const image = await loadImageFromFile(file);
    setImagesByTemplate((current) => ({
      ...current,
      [templateKey]: current[templateKey].map((item, index) => (index === slot ? image : item)),
    }));
    if (isAdjustableTemplate(templateKey)) {
      const nextImages = images.map((item, index) => (index === slot ? image : item));
      updatePairLayout((current) => createTwoLayout(
        nextImages,
        gap,
        current.views.map((view, index) => (index === slot ? getDefaultLayout(templateKey).views[index] : view)),
        null,
        orientation,
      ));
    }
    setActiveSlot(Math.min(slot + 1, template.count - 1));
    showToast(`图 ${slot + 1} 已放入`);
  };

  useEffect(() => {
    const handlePaste = async (event) => {
      const imageItem = Array.from(event.clipboardData?.items || []).find((item) =>
        item.type.startsWith("image/"),
      );
      const imageFile = Array.from(event.clipboardData?.files || []).find((file) =>
        file.type.startsWith("image/"),
      );
      if (!imageItem && !imageFile) return;
      event.preventDefault();
      const file = imageItem?.getAsFile() || imageFile;
      if (!file) return;
      const image = await loadImageFromFile(file);
      setImagesByTemplate((current) => ({
        ...current,
        [templateKey]: current[templateKey].map((item, index) => (index === activeSlot ? image : item)),
      }));
      if (isAdjustableTemplate(templateKey)) {
        const nextImages = images.map((item, index) => (index === activeSlot ? image : item));
        updatePairLayout((current) => createTwoLayout(
          nextImages,
          gap,
          current.views.map((view, index) => (index === activeSlot ? getDefaultLayout(templateKey).views[index] : view)),
          null,
          orientation,
        ));
      }
      setActiveSlot(Math.min(activeSlot + 1, template.count - 1));
      showToast(`图 ${activeSlot + 1} 已放入`);
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [activeSlot, gap, images, orientation, showToast, template.count, templateKey, updatePairLayout]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return;
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (!images[activeSlot]) return;

      event.preventDefault();
      deleteImage(activeSlot);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeSlot, deleteImage, images]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = activeLayout.width;
    canvas.height = activeLayout.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const safeGap = Math.max(0, Number(gap) || 0);
    const cellWidth = (canvas.width - safeGap * (template.cols - 1)) / template.cols;
    const cellHeight = (canvas.height - safeGap * (template.rows - 1)) / template.rows;

    if (isAdjustableTemplate(templateKey)) {
      activeLayout.rects.forEach((rect, index) => {
        drawImageCropped(ctx, images[index], rect, activeLayout.imageRects[index]);
      });
    } else {
      images.forEach((image, index) => {
        const col = index % template.cols;
        const row = Math.floor(index / template.cols);
        const x = col * (cellWidth + safeGap);
        const y = row * (cellHeight + safeGap);
        drawImageFit(ctx, image, x, y, cellWidth, cellHeight, "cover");
      });
    }

    if (watermark.enabled) {
      const lines = [watermark.line1.trim(), watermark.line2.trim(), watermark.line3.trim()];
      if (lines.some(Boolean)) {
        const size = defaultWatermark.size;
        const opacity = Math.max(0, Math.min(1, (Number(watermark.opacity) || 30) / 100));
        const groupGap = defaultWatermark.groupGap;
        const lineHeight = size * 1.05;
        const watermarkHeight = lineHeight * 3;
        const y = template.rows > 1
          ? Math.max(0, cellHeight - watermarkHeight * 0.52)
          : Math.max(0, canvas.height - watermarkHeight - canvas.height * 0.05);

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = watermark.color;
        ctx.font = `700 ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        for (let x = -8; x < canvas.width + groupGap; x += groupGap) {
          lines.forEach((line, index) => {
            if (line) ctx.fillText(line, x, y + index * lineHeight);
          });
        }
        ctx.restore();
      }
    }

    if (headline.enabled) {
      const lines = [headline.line1.trim(), headline.line2.trim()].filter(Boolean);
      if (lines.length > 0) {
        const size = Math.max(24, Number(headline.size) || 96);
        const lineHeight = size * 1.05;
        const blockHeight = lineHeight * lines.length;
        const centerY = canvas.height / 2;
        const startY = centerY - blockHeight / 2 + lineHeight * 0.08;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = `900 ${size}px "Heiti SC", "SimHei", "PingFang SC", "Microsoft YaHei", sans-serif`;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeStyle = "#111111";
        ctx.fillStyle = headline.color || "#ffd82f";
        ctx.lineWidth = Math.max(8, size * 0.13);
        lines.forEach((line, index) => {
          const y = startY + index * lineHeight;
          ctx.strokeText(line, canvas.width / 2, y);
          ctx.fillText(line, canvas.width / 2, y);
        });
        ctx.restore();
      }
    }

    setDownloadHref(canvas.toDataURL(format, 0.95));
  }, [activeLayout, format, gap, headline, images, template, templateKey, watermark]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const resizeState = resizeRef.current;
      if (!resizeState) return;
      const wrap = previewWrapRef.current;
      if (!wrap) return;

      const bounds = wrap.getBoundingClientRect();
      const dx = (event.clientX - resizeState.startX) * (resizeState.layout.width / bounds.width);
      const dy = (event.clientY - resizeState.startY) * (resizeState.layout.height / bounds.height);
      if (resizeState.type === "headline") {
        setHeadline((current) => ({
          ...current,
          size: Math.round(clampNumber(resizeState.startSize + dx * 0.45, 24, 220)),
        }));
        return;
      }
      updatePairLayout(() => resizeTwoLayout(resizeState, dx, dy), resizeState.templateKey);
    };

    const handlePointerUp = () => {
      resizeRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [updatePairLayout]);

  const beginResize = (event, type, edge, index = null) => {
    if (!isAdjustableTemplate(templateKey) && type !== "headline") return;
    event.preventDefault();
    event.stopPropagation();
    if (type === "headline") {
      resizeRef.current = {
        layout: activeLayout,
        startSize: Number(headline.size) || defaultHeadline.size,
        startX: event.clientX,
        startY: event.clientY,
        type,
      };
      return;
    }
    const rect = index === null ? null : activeLayout.rects[index];
    const view = index === null ? null : activeLayout.views[index];
    resizeRef.current = {
      edge,
      gap,
      images,
      index,
      orientation,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      templateKey,
      layout: {
        ...activeLayout,
        views: activeLayout.views.map((item) => ({ ...item })),
      },
      type,
      view,
    };
    if (index !== null) setActiveSlot(index);
  };

  const copyPoster = () => {
    const canvas = canvasRef.current;
    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast("当前浏览器不支持直接复制图片，可用备用下载");
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        showToast("复制失败，请再试一次");
        return;
      }

      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        showToast("成品图已复制，可以直接粘贴");
      } catch {
        showToast("复制被浏览器拦截，可用备用下载");
      }
    }, "image/png");
  };

  const handleTemplateChange = (event) => {
    const nextKey = event.target.value;
    setTemplateKey(nextKey);
    setActiveSlot((current) => Math.min(current, stitchTemplates[nextKey].count - 1));
    showToast(`已切换到：${stitchTemplates[nextKey].name}`);
  };

  const handleDrop = async (event, slot) => {
    event.preventDefault();
    const fromSlot = Number(event.dataTransfer.getData("text/x-image-slot"));
    if (Number.isInteger(fromSlot) && fromSlot >= 0 && fromSlot !== slot) {
      setImagesByTemplate((current) => {
        const nextImages = swapItems(current[templateKey], fromSlot, slot);
        if (isAdjustableTemplate(templateKey)) {
          updatePairLayout((layout) => createTwoLayout(nextImages, gap, layout.views, null, orientation));
        }
        return {
          ...current,
          [templateKey]: nextImages,
        };
      });
      setActiveSlot(slot);
      showToast(`图 ${fromSlot + 1} 和图 ${slot + 1} 已调换`);
      return;
    }
    const file = event.dataTransfer.files?.[0];
    if (file) await applyImage(file, slot);
  };

  const handleSlotDragStart = (event, slot) => {
    if (!images[slot]) return;
    event.dataTransfer.setData("text/x-image-slot", String(slot));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSlotKeyDown = (event, slot) => {
    if (event.key !== "Delete" && event.key !== "Backspace") return;
    if (!images[slot]) return;

    event.preventDefault();
    deleteImage(slot);
  };

  return (
    <section className={`tool-view ${active ? "active" : ""}`} hidden={!active}>
      <div className="poster-layout">
        <aside className="poster-controls">
          <section className="control-section">
            <p className="panel-kicker">模板</p>
            <div className="stitch-templates">
              {Object.entries(stitchTemplates).map(([key, item]) => (
                <button
                  className={`stitch-template ${templateKey === key ? "active" : ""}`}
                  key={key}
                  onClick={() => handleTemplateChange({ target: { value: key } })}
                  type="button"
                >
                  <span className={`stitch-icon ${key}`}>
                    {Array.from({ length: item.count }, (_, index) => <span key={index} />)}
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.note}</small>
                  </span>
                </button>
              ))}
            </div>
            <p className="small-note">{template.note}</p>
          </section>

          <section className="control-section">
            <p className="panel-kicker">图片</p>
            <div className={`upload-grid ${templateKey}`}>
              {images.map((image, index) => (
                <div
                  className={`image-slot ${template.slotClass} ${activeSlot === index ? "active" : ""}`}
                  draggable={Boolean(image)}
                  key={index}
                  onClick={() => setActiveSlot(index)}
                  onDragStart={(event) => handleSlotDragStart(event, index)}
                  onFocus={() => setActiveSlot(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, index)}
                  onKeyDown={(event) => handleSlotKeyDown(event, index)}
                  role="button"
                  tabIndex={0}
                >
                  {image ? <img alt={`图 ${index + 1}`} src={image.src} /> : <span className="plus">＋</span>}
                  <em>图 {index + 1}</em>
                  {image && (
                    <button
                      aria-label={`删除图 ${index + 1}`}
                      className="slot-delete"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteImage(index);
                      }}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="small-note">复制图片后点格子按 ⌘V / Ctrl+V，或把图片直接拖进格子；贴错时点 × 或按 Delete 删除。</p>
          </section>

          <ControlSection title="拼接设置">
            <div className="field-grid">
              <NumberField label="图片间距" value={gap} onChange={updateGap} min="0" max="60" />
              <label>
                导出格式
                <select value={format} onChange={(event) => setFormat(event.target.value)}>
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPG</option>
                </select>
              </label>
            </div>
            {isAdjustableTemplate(templateKey) && (
              <button className="ghost-button compact-button" type="button" onClick={() => resetTwoLayout()}>
                {templateKey === "vertical" ? "恢复等宽拼接" : "恢复等高拼接"}
              </button>
            )}
            <p className="small-note">{isAdjustableTemplate(templateKey) ? `${templateKey === "vertical" ? "两张图按原比例等宽上下拼接" : "两张图按原比例等高横向拼接"}；拖单图或成品四边只裁切不拉伸。` : "图片会按每个格子的比例居中裁剪，所有处理都在浏览器本地完成。"}</p>
          </ControlSection>

          <ControlSection title="水印">
            <label className="toggle-row">
              <input
                checked={watermark.enabled}
                onChange={(event) => setWatermark((current) => ({ ...current, enabled: event.target.checked }))}
                type="checkbox"
              />
              显示水印
            </label>
            <div className="field-grid">
              <TextField
                label="第一行"
                value={watermark.line1}
                onChange={(value) => setWatermark((current) => ({ ...current, line1: value }))}
              />
              <TextField
                label="第二行"
                value={watermark.line2}
                onChange={(value) => setWatermark((current) => ({ ...current, line2: value }))}
              />
            </div>
            <TextField
              label="第三行"
              value={watermark.line3}
              onChange={(value) => setWatermark((current) => ({ ...current, line3: value }))}
            />
            <div className="field-grid">
              <label>
                透明度
                <input
                  max="80"
                  min="5"
                  onChange={(event) => setWatermark((current) => ({ ...current, opacity: event.target.value }))}
                  type="range"
                  value={watermark.opacity}
                />
              </label>
              <ColorField
                label="颜色"
                value={watermark.color}
                onChange={(value) => setWatermark((current) => ({ ...current, color: value }))}
              />
            </div>
            <p className="small-note">水印会横向铺满一排；多排模板默认放在上下图片交接处。</p>
          </ControlSection>

          <ControlSection title="花字">
            <label className="toggle-row">
              <input
                checked={headline.enabled}
                onChange={(event) => setHeadline((current) => ({ ...current, enabled: event.target.checked }))}
                type="checkbox"
              />
              显示花字
            </label>
            <div className="field-grid">
              <TextField
                label="内容 1"
                value={headline.line1}
                onChange={(value) => setHeadline((current) => ({ ...current, line1: value }))}
              />
              <TextField
                label="内容 2"
                value={headline.line2}
                onChange={(value) => setHeadline((current) => ({ ...current, line2: value }))}
              />
            </div>
            <ColorField
              label="文字颜色"
              value={headline.color}
              onChange={(value) => setHeadline((current) => ({ ...current, color: value }))}
            />
            <p className="small-note">花字为加粗黑体并带黑色描边；打开后在预览中左右拖动“字”手柄调整大小。</p>
          </ControlSection>

          <div className="poster-actions">
            <button className="ghost-button" type="button" onClick={resetPoster}>清空图片</button>
            <button className="copy-button" type="button" onClick={copyPoster}>复制成品图</button>
            <a className="fallback-link" download={`拼接成品-${templateKey}.${format === "image/png" ? "png" : "jpg"}`} href={downloadHref}>备用下载</a>
          </div>
        </aside>

        <div className={`poster-stage template-${templateKey}`}>
          <div className="preview-head">
            <h2>成品预览</h2>
            <span className="preview-badge">{template.badge}</span>
          </div>
          <div
            className={`canvas-wrap ${isAdjustableTemplate(templateKey) ? "resizable" : ""}`}
            ref={previewWrapRef}
            style={{ aspectRatio: `${activeLayout.width} / ${activeLayout.height}` }}
          >
            <canvas ref={canvasRef} width={activeLayout.width} height={activeLayout.height} aria-label="成品预览" />
            {isAdjustableTemplate(templateKey) && (
              <>
                <div className="canvas-resize-layer" aria-hidden="true">
                  {resizeEdges.map((edge) => (
                    <button
                      className={`resize-handle canvas-handle ${edge}`}
                      key={edge}
                      onPointerDown={(event) => beginResize(event, "canvas", edge)}
                      type="button"
                    />
                  ))}
                </div>
                {activeLayout.rects.map((rect, index) => (
                  <div
                    className={`image-resize-box ${activeSlot === index ? "active" : ""}`}
                    key={index}
                    style={{
                      height: `${(rect.height / activeLayout.height) * 100}%`,
                      left: `${(rect.x / activeLayout.width) * 100}%`,
                      top: `${(rect.y / activeLayout.height) * 100}%`,
                      width: `${(rect.width / activeLayout.width) * 100}%`,
                    }}
                  >
                    {resizeEdges.map((edge) => (
                      <button
                        className={`resize-handle image-handle ${edge}`}
                        key={edge}
                        onPointerDown={(event) => beginResize(event, "image", edge, index)}
                        type="button"
                      />
                    ))}
                  </div>
                ))}
              </>
            )}
            {headline.enabled && (
              <button
                aria-label="拖动调整花字大小"
                className="headline-size-handle"
                onPointerDown={(event) => beginResize(event, "headline", "right")}
                type="button"
              >
                字
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ControlSection({ children, title }) {
  return (
    <section className="control-section">
      <p className="panel-kicker">{title}</p>
      {children}
    </section>
  );
}

function NumberField({ label, max, min, onChange, value }) {
  return (
    <label>
      {label}
      <input type="number" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextField({ label, onChange, value }) {
  return (
    <label>
      {label}
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ColorField({ label, onChange, value }) {
  return (
    <label>
      {label}
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export default function App() {
  const [mode, setMode] = useState("copy");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 1800);
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">WeChat Toolkit</p>
          <h1>大强传媒内部工具</h1>
          <p className="hero-subtitle">
            文案美化和图片合成放在一个入口里，后续模板可以继续加到同一套工具中。
          </p>
        </div>

        <div className="mode-tabs" role="tablist" aria-label="工具切换">
          <button className={`mode-tab ${mode === "copy" ? "active" : ""}`} type="button" onClick={() => setMode("copy")}>
            文案美化
          </button>
          <button className={`mode-tab ${mode === "poster" ? "active" : ""}`} type="button" onClick={() => setMode("poster")}>
            图片合成
          </button>
        </div>
      </section>

      <CopyFormatter active={mode === "copy"} showToast={showToast} />
      <PosterComposer active={mode === "poster"} showToast={showToast} />

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
