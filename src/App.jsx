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
    note: "左右各一张，适合横向对比或前后效果展示。",
    count: 2,
    cols: 2,
    rows: 1,
    width: 1600,
    height: 900,
    slotClass: "wide",
    badge: "两张横拼",
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

function CopyFormatter({ showToast }) {
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
    <section className="tool-view active">
      <div className="tool-grid" aria-label="转换工具">
        <article className="panel input-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">输入</p>
              <h2>原始文案</h2>
            </div>
            <span className="count-pill">{input.length} 字</span>
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="请粘贴微信群推广文案..."
            aria-label="原始文案"
          />

          <div className="button-row">
            <button className="danger-button" type="button" onClick={() => setInput("")}>
              一键删除
            </button>
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

function PosterComposer({ showToast }) {
  const canvasRef = useRef(null);
  const [templateKey, setTemplateKey] = useState("two");
  const [images, setImages] = useState(() => Array(stitchTemplates.two.count).fill(null));
  const [activeSlot, setActiveSlot] = useState(0);
  const [gap, setGap] = useState(0);
  const [format, setFormat] = useState("image/png");
  const [watermark, setWatermark] = useState({
    enabled: true,
    line1: "淘宝闪购搜",
    line2: "300466",
    line3: "领外卖红包",
    size: 28,
    opacity: 30,
    groupGap: 180,
    color: "#ffffff",
  });
  const [headline, setHeadline] = useState({
    enabled: false,
    line1: "爆品热销榜",
    line2: "京鲜生水果",
    size: 96,
  });
  const [downloadHref, setDownloadHref] = useState("#");
  const template = stitchTemplates[templateKey];

  const resetPoster = () => {
    setImages(Array(template.count).fill(null));
    setActiveSlot(0);
    showToast("图片已清空");
  };

  const applyImage = async (file, slot = activeSlot) => {
    const image = await loadImageFromFile(file);
    setImages((current) => current.map((item, index) => (index === slot ? image : item)));
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
      setImages((current) => current.map((item, index) => (index === activeSlot ? image : item)));
      setActiveSlot(Math.min(activeSlot + 1, template.count - 1));
      showToast(`图 ${activeSlot + 1} 已放入`);
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [activeSlot, showToast, template.count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = template.width;
    canvas.height = template.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const safeGap = Math.max(0, Number(gap) || 0);
    const cellWidth = (canvas.width - safeGap * (template.cols - 1)) / template.cols;
    const cellHeight = (canvas.height - safeGap * (template.rows - 1)) / template.rows;

    images.forEach((image, index) => {
      const col = index % template.cols;
      const row = Math.floor(index / template.cols);
      const x = col * (cellWidth + safeGap);
      const y = row * (cellHeight + safeGap);
      drawImageFit(ctx, image, x, y, cellWidth, cellHeight, "cover");
    });

    if (watermark.enabled) {
      const lines = [watermark.line1.trim(), watermark.line2.trim(), watermark.line3.trim()];
      if (lines.some(Boolean)) {
        const size = Math.max(10, Number(watermark.size) || 28);
        const opacity = Math.max(0, Math.min(1, (Number(watermark.opacity) || 30) / 100));
        const groupGap = Math.max(80, Number(watermark.groupGap) || 180);
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
        ctx.font = `900 ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeStyle = "#111111";
        ctx.fillStyle = "#ffd82f";
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
  }, [format, gap, headline, images, template, watermark]);

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
    setImages(Array(stitchTemplates[nextKey].count).fill(null));
    setActiveSlot(0);
    showToast(`已切换到：${stitchTemplates[nextKey].name}`);
  };

  const handleDrop = async (event, slot) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) await applyImage(file, slot);
  };

  return (
    <section className="tool-view active">
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
                  key={index}
                  onClick={() => setActiveSlot(index)}
                  onFocus={() => setActiveSlot(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, index)}
                  role="button"
                  tabIndex={0}
                >
                  {image ? <img alt={`图 ${index + 1}`} src={image.src} /> : <span className="plus">＋</span>}
                  <em>图 {index + 1}</em>
                </div>
              ))}
            </div>
            <p className="small-note">复制图片后点格子按 ⌘V / Ctrl+V，或把图片直接拖进格子；连续粘贴会自动填下一个格子。</p>
          </section>

          <ControlSection title="拼接设置">
            <div className="field-grid">
              <NumberField label="图片间距" value={gap} onChange={setGap} min="0" max="60" />
              <label>
                导出格式
                <select value={format} onChange={(event) => setFormat(event.target.value)}>
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPG</option>
                </select>
              </label>
            </div>
            <p className="small-note">图片会按每个格子的比例居中裁剪，所有处理都在浏览器本地完成。</p>
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
              <NumberField
                label="字号"
                value={watermark.size}
                onChange={(value) => setWatermark((current) => ({ ...current, size: value }))}
                min="10"
                max="80"
              />
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
              <NumberField
                label="组间距"
                value={watermark.groupGap}
                onChange={(value) => setWatermark((current) => ({ ...current, groupGap: value }))}
                min="80"
                max="360"
              />
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
            <NumberField
              label="字号"
              value={headline.size}
              onChange={(value) => setHeadline((current) => ({ ...current, size: value }))}
              min="24"
              max="180"
            />
            <p className="small-note">花字横向居中，黄色加粗并带黑色描边，可随时关闭。</p>
          </ControlSection>

          <div className="poster-actions">
            <button className="ghost-button" type="button" onClick={resetPoster}>清空图片</button>
            <button className="copy-button" type="button" onClick={copyPoster}>复制成品图</button>
            <a className="fallback-link" download={`拼接成品-${templateKey}.${format === "image/png" ? "png" : "jpg"}`} href={downloadHref}>备用下载</a>
          </div>
        </aside>

        <div className="poster-stage">
          <div className="preview-head">
            <h2>成品预览</h2>
            <span className="preview-badge">{template.badge}</span>
          </div>
          <canvas ref={canvasRef} width={template.width} height={template.height} aria-label="成品预览" />
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
          <h1>微信文案与作图工具</h1>
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

      {mode === "copy" ? (
        <CopyFormatter showToast={showToast} />
      ) : (
        <PosterComposer showToast={showToast} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
