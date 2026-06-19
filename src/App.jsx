import { useState } from "react";

export default function NumericFontConverter() {

  const fontMap = {
    digits: [
      "𝟎","𝟏","𝟐","𝟑","𝟒",
      "𝟓","𝟔","𝟕","𝟖","𝟗"
    ],

    lower: [
      "𝐚","𝐛","𝐜","𝐝","𝐞",
      "𝐟","𝐠","𝐡","𝐢","𝐣",
      "𝐤","𝐥","𝐦","𝐧","𝐨",
      "𝐩","𝐪","𝐫","𝐬","𝐭",
      "𝐮","𝐯","𝐰","𝐱","𝐲",
      "𝐳"
    ],

    upper: [
      "𝐀","𝐁","𝐂","𝐃","𝐄",
      "𝐅","𝐆","𝐇","𝐈","𝐉",
      "𝐊","𝐋","𝐌","𝐍","𝐎",
      "𝐏","𝐐","𝐑","𝐒","𝐓",
      "𝐔","𝐕","𝐖","𝐗","𝐘",
      "𝐙"
    ]
  };

  const [input, setInput] = useState(
`活动时间：5月30日20点-6月1日24点

SALE 618 OFF 50%

立即领取：
https://abc123.com/sale618`
  );

  const [copied, setCopied] = useState("");

  const convertText = (text) => {

    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    const parts = text.split(urlRegex);

    return parts.map((part) => {

      if (part.match(urlRegex)) {
        return part;
      }

      let result = part;

// 1️⃣~9️⃣ 转 ❶~❾
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

Object.entries(emojiNums).forEach(([from, to]) => {
  result = result.split(from).join(to);
});

// * 转 ✘
result = result.split("*").join("✘");

// 普通数字转数学粗体
result = result.replace(/\d/g, (d) => {
  return fontMap.digits[Number(d)] || d;
});

      result = result.replace(/[a-z]/g, (c) => {
        return fontMap.lower[c.charCodeAt(0) - 97] || c;
      });

      result = result.replace(/[A-Z]/g, (c) => {
        return fontMap.upper[c.charCodeAt(0) - 65] || c;
      });

      return result;

    }).join("");
  };

  const output = convertText(input);

  const copyText = async () => {

    try {

      await navigator.clipboard.writeText(output);

      setCopied("已复制");

      setTimeout(() => {
        setCopied("");
      }, 1500);

    } catch {

      setCopied("复制失败");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-3">
          微信文案粗体转换器
        </h1>

        <p className="text-gray-600 mb-8">
          自动转换数字与英文字母，链接保持不变
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border rounded-2xl p-4 min-h-[180px] mb-8"
        />

        <div className="bg-white rounded-2xl border p-5">

          <div className="flex justify-between items-center mb-4">

            <div>
              <h2 className="text-xl font-bold">
                数学粗体
              </h2>

              <p className="text-gray-500 text-sm">
                𝐀𝐁𝐂 + 𝟏𝟐𝟑
              </p>
            </div>

            <button
              onClick={copyText}
              className="bg-black text-white px-4 py-2 rounded-xl"
            >
              一键复制
            </button>

          </div>

          <div className="bg-gray-100 rounded-xl p-4 break-words text-lg whitespace-pre-wrap">
            {output}
          </div>

        </div>

        {copied && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-xl">
            {copied}
          </div>
        )}

      </div>

    </div>
  );
}