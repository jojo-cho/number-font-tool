import { useEffect, useMemo, useRef, useState } from "react";
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

const posterTemplates = {
  apparelOrder: {
    name: "服饰主图 + 订单截图",
    note: "主图在左上，订单截图压在左下，三行水印铺在交接处。",
    defaults: {
      bgColor: "#7b5d55",
      sizePreset: "1200x1600",
      mainX: 32,
      mainY: 44,
      mainW: 76,
      mainFit: "contain",
      orderX: 23,
      orderBottom: 24,
      orderW: 79,
      orderH: 28,
      wmLine1: "淘宝闪购搜",
      wmLine2: "300466",
      wmLine3: "领外卖红包",
      wmSize: 23,
      wmOpacity: 30,
      wmGap: 160,
      wmColor: "#ffffff",
    },
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
  const [templateKey, setTemplateKey] = useState("apparelOrder");
  const [controls, setControls] = useState(posterTemplates.apparelOrder.defaults);
  const [images, setImages] = useState({ main: null, order: null });
  const [activeSlot, setActiveSlot] = useState("main");
  const [downloadHref, setDownloadHref] = useState("#");
  const template = posterTemplates[templateKey];

  const updateControl = (key, value) => {
    setControls((current) => ({ ...current, [key]: value }));
  };

  const resetPoster = () => {
    setControls(template.defaults);
    setImages({ main: null, order: null });
    setActiveSlot("main");
    showToast("图片模板已恢复默认");
  };

  const applyImage = async (file, slot = activeSlot) => {
    const image = await loadImageFromFile(file);
    setImages((current) => ({ ...current, [slot]: image }));
    setActiveSlot(slot === "main" ? "order" : "main");
    showToast(`${slot === "main" ? "主图" : "订单图"}已粘贴`);
  };

  useEffect(() => {
    const handlePaste = async (event) => {
      const imageItem = Array.from(event.clipboardData?.items || []).find((item) =>
        item.type.startsWith("image/"),
      );
      if (!imageItem) return;
      event.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;
      const image = await loadImageFromFile(file);
      setImages((current) => ({ ...current, [activeSlot]: image }));
      setActiveSlot(activeSlot === "main" ? "order" : "main");
      showToast(`${activeSlot === "main" ? "主图" : "订单图"}已粘贴`);
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [activeSlot, showToast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const [width, height] = controls.sizePreset.split("x").map(Number);
    canvas.width = width;
    canvas.height = height;
    const scale = width / 1200;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = controls.bgColor;
    ctx.fillRect(0, 0, width, height);

    const mainX = Number(controls.mainX) * scale;
    const mainY = Number(controls.mainY) * scale;
    const mainWidth = (width * Number(controls.mainW)) / 100;
    const mainHeight = (mainWidth * 4) / 3;
    drawImageFit(ctx, images.main, mainX, mainY, mainWidth, mainHeight, controls.mainFit);

    const orderWidth = (width * Number(controls.orderW)) / 100;
    const orderHeight = (height * Number(controls.orderH)) / 100;
    const orderX = (width * Number(controls.orderX)) / 100;
    const orderY = height - orderHeight - Number(controls.orderBottom) * scale;
    const watermarkHeight = Number(controls.wmSize) * 3.15;
    const watermarkY = Math.max(
      mainY + mainHeight - watermarkHeight * 0.55,
      orderY - watermarkHeight - 8 * scale,
    );

    const lines = [controls.wmLine1.trim(), controls.wmLine2.trim(), controls.wmLine3.trim()];
    if (lines.some(Boolean)) {
      const opacity = Math.max(0, Math.min(1, Number(controls.wmOpacity) / 100));
      const size = Number(controls.wmSize);
      const gap = Number(controls.wmGap);
      const lineHeight = size * 1.05;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = controls.wmColor;
      ctx.font = `700 ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      for (let x = -8; x < canvas.width + gap; x += gap) {
        lines.forEach((line, index) => {
          if (line) ctx.fillText(line, x, watermarkY + index * lineHeight);
        });
      }
      ctx.restore();
    }

    drawImageFit(ctx, images.order, orderX, orderY, orderWidth, orderHeight, "cover");
    setDownloadHref(canvas.toDataURL("image/png"));
  }, [controls, images]);

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
    setControls(posterTemplates[nextKey].defaults);
    showToast(`已切换到：${posterTemplates[nextKey].name}`);
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
            <label>
              选择模板
              <select value={templateKey} onChange={handleTemplateChange}>
                {Object.entries(posterTemplates).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </label>
            <p className="small-note">{template.note}</p>
          </section>

          <section className="control-section">
            <p className="panel-kicker">图片</p>
            {[
              ["main", "主图", "点这里后直接粘贴图1"],
              ["order", "订单图", "点这里后直接粘贴图2"],
            ].map(([slot, title, desc]) => (
              <div
                className={`drop ${activeSlot === slot ? "active" : ""}`}
                key={slot}
                onClick={() => setActiveSlot(slot)}
                onFocus={() => setActiveSlot(slot)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, slot)}
                role="button"
                tabIndex={0}
              >
                <span><strong>{title}</strong>{desc}</span>
              </div>
            ))}
            <p className="small-note">也可以连续粘贴：第一张进主图，第二张进订单图。</p>
          </section>

          <ControlSection title="整体">
            <div className="field-grid">
              <ColorField label="背景色" value={controls.bgColor} onChange={(value) => updateControl("bgColor", value)} />
              <label>
                导出尺寸
                <select value={controls.sizePreset} onChange={(event) => updateControl("sizePreset", event.target.value)}>
                  <option value="1200x1600">1200 x 1600</option>
                  <option value="1080x1440">1080 x 1440</option>
                  <option value="900x1200">900 x 1200</option>
                </select>
              </label>
            </div>
          </ControlSection>

          <ControlSection title="主图位置">
            <div className="field-grid">
              <NumberField label="左边距" value={controls.mainX} onChange={(value) => updateControl("mainX", value)} min="0" max="500" />
              <NumberField label="上边距" value={controls.mainY} onChange={(value) => updateControl("mainY", value)} min="0" max="500" />
              <NumberField label="宽度 %" value={controls.mainW} onChange={(value) => updateControl("mainW", value)} min="30" max="100" />
              <label>
                裁切方式
                <select value={controls.mainFit} onChange={(event) => updateControl("mainFit", event.target.value)}>
                  <option value="contain">完整显示</option>
                  <option value="cover">铺满裁切</option>
                </select>
              </label>
            </div>
          </ControlSection>

          <ControlSection title="订单图位置">
            <div className="field-grid">
              <NumberField label="左边距" value={controls.orderX} onChange={(value) => updateControl("orderX", value)} min="0" max="80" />
              <NumberField label="下边距" value={controls.orderBottom} onChange={(value) => updateControl("orderBottom", value)} min="0" max="300" />
              <NumberField label="宽度 %" value={controls.orderW} onChange={(value) => updateControl("orderW", value)} min="30" max="100" />
              <NumberField label="高度 %" value={controls.orderH} onChange={(value) => updateControl("orderH", value)} min="10" max="50" />
            </div>
          </ControlSection>

          <ControlSection title="水印">
            <div className="field-grid">
              <TextField label="第一行" value={controls.wmLine1} onChange={(value) => updateControl("wmLine1", value)} />
              <TextField label="第二行" value={controls.wmLine2} onChange={(value) => updateControl("wmLine2", value)} />
            </div>
            <TextField label="第三行" value={controls.wmLine3} onChange={(value) => updateControl("wmLine3", value)} />
            <div className="field-grid">
              <NumberField label="字号" value={controls.wmSize} onChange={(value) => updateControl("wmSize", value)} min="10" max="80" />
              <label>
                透明度
                <input type="range" value={controls.wmOpacity} min="5" max="80" onChange={(event) => updateControl("wmOpacity", event.target.value)} />
              </label>
              <NumberField label="组间距" value={controls.wmGap} onChange={(value) => updateControl("wmGap", value)} min="80" max="360" />
              <ColorField label="颜色" value={controls.wmColor} onChange={(value) => updateControl("wmColor", value)} />
            </div>
          </ControlSection>

          <div className="poster-actions">
            <button className="ghost-button" type="button" onClick={resetPoster}>恢复默认</button>
            <button className="copy-button" type="button" onClick={copyPoster}>复制成品图</button>
            <a className="fallback-link" download="poster-watermarked.png" href={downloadHref}>备用下载</a>
          </div>
        </aside>

        <div className="poster-stage">
          <canvas ref={canvasRef} width="1200" height="1600" aria-label="成品预览" />
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

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 1800);
  };

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
