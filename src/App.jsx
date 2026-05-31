import { useState } from "react";

export default function NumericFontConverter() {

  const fontMaps = [
    {
      name: "粗体数字 + 字母",
      description: "适合标题、海报、电商价格",

      digits: [
        "𝟬","𝟭","𝟮","𝟯","𝟰",
        "𝟱","𝟲","𝟳","𝟴","𝟵"
      ],

      lower: [
        "𝗮","𝗯","𝗰","𝗱","𝗲",
        "𝗳","𝗴","𝗵","𝗶","𝗷",
        "𝗸","𝗹","𝗺","𝗻","𝗼",
        "𝗽","𝗾","𝗿","𝘀","𝘁",
        "𝘂","𝘃","𝘄","𝘅","𝘆",
        "𝘇"
      ],

      upper: [
        "𝗔","𝗕","𝗖","𝗗","𝗘",
        "𝗙","𝗚","𝗛","𝗜","𝗝",
        "𝗞","𝗟","𝗠","𝗡","𝗢",
        "𝗣","𝗤","𝗥","𝗦","𝗧",
        "𝗨","𝗩","𝗪","𝗫","𝗬",
        "𝗭"
      ],
    },

    {
      name: "圆圈数字",
      description: "适合步骤说明",

      digits: [
        "⓪","①","②","③","④",
        "⑤","⑥","⑦","⑧","⑨"
      ],
    },

    {
      name: "全角数字",
      description: "适合特殊排版",

      digits: [
        "０","１","２","３","４",
        "５","６","７","８","９"
      ],
    },
  ];

  const [input, setInput] = useState(
`活动时间：5月30日20点-6月1日24点

SALE 618 OFF 50%

立即领取：
https://abc123.com/sale618`
  );

  const [copied, setCopied] = useState("");

  const convertText = (text, font) => {

    // 匹配链接
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    // 按链接拆分
    const parts = text.split(urlRegex);

    return parts.map((part) => {

      // 链接不转换
      if (part.match(urlRegex)) {
        return part;
      }

      // 转换数字
      let result = part.replace(/\d/g, (d) => {
        return font.digits[Number(d)] || d;
      });

      // 转换小写字母
      if (font.lower) {
        result = result.replace(/[a-z]/g, (c) => {
          return font.lower[c.charCodeAt(0) - 97] || c;
        });
      }

      // 转换大写字母
      if (font.upper) {
        result = result.replace(/[A-Z]/g, (c) => {
          return font.upper[c.charCodeAt(0) - 65] || c;
        });
      }

      return result;

    }).join("");
  };

  const copyText = async (text, name) => {

    try {

      await navigator.clipboard.writeText(text);

      setCopied(`${name} 已复制`);

      setTimeout(() => {
        setCopied("");
      }, 1500);

    } catch (err) {

      setCopied("复制失败");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-3">
          数字字体转换器
        </h1>

        <p className="text-gray-600 mb-8">
          支持数字、英文加粗，自动跳过链接
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border rounded-2xl p-4 min-h-[180px] mb-8"
        />

        <div className="grid md:grid-cols-2 gap-5">

          {fontMaps.map((font) => {

            const output = convertText(input, font);

            return (
              <div
                key={font.name}
                className="bg-white rounded-2xl border p-5"
              >

                <div className="flex justify-between items-center mb-4">

                  <div>
                    <h2 className="text-xl font-bold">
                      {font.name}
                    </h2>

                    <p className="text-gray-500 text-sm">
                      {font.description}
                    </p>
                  </div>

                  <button
                    onClick={() => copyText(output, font.name)}
                    className="bg-black text-white px-4 py-2 rounded-xl"
                  >
                    复制
                  </button>

                </div>

                <div className="bg-gray-100 rounded-xl p-4 break-words text-lg whitespace-pre-wrap">
                  {output}
                </div>

              </div>
            );
          })}

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