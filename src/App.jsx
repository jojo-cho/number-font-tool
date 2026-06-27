import { useMemo, useState } from "react";
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

export default function NumericFontConverter() {
  const [input, setInput] = useState(sampleText);
  const [copied, setCopied] = useState("");
  const output = useMemo(() => convertText(input), [input]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied("已复制到剪贴板");
    } catch {
      setCopied("复制失败，请手动复制");
    }

    window.setTimeout(() => setCopied(""), 1600);
  };

  const resetText = () => {
    setInput(sampleText);
  };

  const clearText = () => {
    setInput("");
  };

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">WeChat Copy Formatter</p>
          <h1>微信文案美化工具</h1>
          <p className="hero-subtitle">
            数字与英文字母自动转成醒目的数学粗体，链接保持原样，适合活动文案、群公告和促销标题。
          </p>
        </div>
      </section>

      <section className="tool-grid" aria-label="转换工具">
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
            <button className="danger-button" type="button" onClick={clearText}>
              一键删除
            </button>
            <button className="ghost-button" type="button" onClick={resetText}>
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
      </section>

      {copied && <div className="toast">{copied}</div>}
    </main>
  );
}
