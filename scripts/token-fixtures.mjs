// Generated fixtures for scripts/test-token-count.mjs — DO NOT hand-edit.
// `actual` is the token count each model's OWN tokenizer produces for `text`
// (@huggingface/tokenizers against the tokenizer.json in that model's HF repo,
// content tokens only, special tokens such as BOS excluded), measured 2026-09-24. Regenerate alongside the
// weights in index.html's TOKEN-COUNT block; the two are fitted together.
export const TOKEN_FIXTURES = [
 {
  "name": "en-prose-a",
  "text": "The context builder decides which turns survive into the next request. It works from a token budget, and the budget is only as good as the count that feeds it. When the count is a character heuristic, a conversation in a script that packs fewer characters per token will overflow the window without ever tripping the guard. The fix is not a better constant; it is a count that knows what script it is looking at.",
  "actual": {
   "qwen35-4b": 84,
   "bonsai-ternary-4b": 84,
   "lfm2-1.2b": 85,
   "gemma4-e2b": 83,
   "minicpm5-2b-gguf": 83
  }
 },
 {
  "name": "en-chat-a",
  "text": "sure, can you rewrite that paragraph so it is shorter and a bit less formal? also drop the last sentence, it repeats the second one.",
  "actual": {
   "qwen35-4b": 29,
   "bonsai-ternary-4b": 29,
   "lfm2-1.2b": 30,
   "gemma4-e2b": 29,
   "minicpm5-2b-gguf": 29
  }
 },
 {
  "name": "code-js-a",
  "text": "function approxTokens(text) {\n  if (!text) return 0;\n  return Math.ceil(String(text).length / 3.5);\n}\n\nconst budgetForHistory = maxCtx - 2048 - 300;\nfor (const msg of allMessages) {\n  historyTokens += approxTokens(typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content));\n}",
  "actual": {
   "qwen35-4b": 88,
   "bonsai-ternary-4b": 81,
   "lfm2-1.2b": 85,
   "gemma4-e2b": 98,
   "minicpm5-2b-gguf": 82
  }
 },
 {
  "name": "code-py-a",
  "text": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
  "actual": {
   "qwen35-4b": 58,
   "bonsai-ternary-4b": 53,
   "lfm2-1.2b": 58,
   "gemma4-e2b": 61,
   "minicpm5-2b-gguf": 55
  }
 },
 {
  "name": "json-a",
  "text": "{\"id\":\"lmcc-8f2a\",\"object\":\"chat.completion\",\"created\":1758672000,\"model\":\"qwen35-4b\",\"choices\":[{\"index\":0,\"message\":{\"role\":\"assistant\",\"content\":\"done\"},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":128,\"completion_tokens\":16,\"total_tokens\":144}}",
  "actual": {
   "qwen35-4b": 84,
   "bonsai-ternary-4b": 84,
   "lfm2-1.2b": 91,
   "gemma4-e2b": 89,
   "minicpm5-2b-gguf": 74
  }
 },
 {
  "name": "hi-a",
  "text": "संदर्भ बनाने वाला तय करता है कि अगली अनुरोध में कौन सी बातचीत बचेगी। यह एक टोकन बजट से काम करता है, और वह बजट उतना ही अच्छा है जितनी उसमें जाने वाली गिनती। जब गिनती सिर्फ अक्षरों का अनुमान हो, तो जिस लिपि में हर टोकन कम अक्षर रखता है, वहाँ बातचीत खिड़की से बाहर निकल जाएगी और चेतावनी कभी नहीं आएगी।",
  "actual": {
   "qwen35-4b": 128,
   "bonsai-ternary-4b": 283,
   "lfm2-1.2b": 375,
   "gemma4-e2b": 74,
   "minicpm5-2b-gguf": 228
  }
 },
 {
  "name": "mr-a",
  "text": "संदर्भ तयार करणारा ठरवतो की पुढील विनंतीमध्ये कोणती संभाषणे टिकतील. तो टोकन बजेटवर काम करतो, आणि ते बजेट त्यात जाणाऱ्या मोजणीइतकेच चांगले असते. जेव्हा मोजणी फक्त अक्षरांचा अंदाज असते, तेव्हा संभाषण खिडकीबाहेर जाते.",
  "actual": {
   "qwen35-4b": 111,
   "bonsai-ternary-4b": 204,
   "lfm2-1.2b": 277,
   "gemma4-e2b": 67,
   "minicpm5-2b-gguf": 171
  }
 },
 {
  "name": "bn-a",
  "text": "প্রসঙ্গ নির্মাতা ঠিক করে কোন কথোপকথন পরবর্তী অনুরোধে টিকে থাকবে। এটি একটি টোকেন বাজেট থেকে কাজ করে, এবং সেই বাজেট ততটাই ভালো যতটা তাতে যাওয়া গণনা। গণনা যদি কেবল অক্ষরের অনুমান হয়, তবে কথোপকথন জানালার বাইরে চলে যাবে।",
  "actual": {
   "qwen35-4b": 100,
   "bonsai-ternary-4b": 229,
   "lfm2-1.2b": 427,
   "gemma4-e2b": 52,
   "minicpm5-2b-gguf": 338
  }
 },
 {
  "name": "kn-a",
  "text": "ಸಂದರ್ಭ ನಿರ್ಮಾಪಕವು ಮುಂದಿನ ವಿನಂತಿಯಲ್ಲಿ ಯಾವ ಸಂಭಾಷಣೆಗಳು ಉಳಿಯುತ್ತವೆ ಎಂಬುದನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ಇದು ಟೋಕನ್ ಬಜೆಟ್‌ನಿಂದ ಕೆಲಸ ಮಾಡುತ್ತದೆ, ಮತ್ತು ಆ ಬಜೆಟ್ ಅದರೊಳಗೆ ಹೋಗುವ ಎಣಿಕೆಯಷ್ಟೇ ಉತ್ತಮವಾಗಿದೆ.",
  "actual": {
   "qwen35-4b": 102,
   "bonsai-ternary-4b": 251,
   "lfm2-1.2b": 464,
   "gemma4-e2b": 62,
   "minicpm5-2b-gguf": 228
  }
 },
 {
  "name": "ta-a",
  "text": "சூழல் உருவாக்கி அடுத்த கோரிக்கையில் எந்த உரையாடல்கள் தங்கும் என்பதைத் தீர்மானிக்கிறது. இது ஒரு டோக்கன் பட்ஜெட்டில் இருந்து வேலை செய்கிறது, அந்த பட்ஜெட் அதில் செல்லும் எண்ணிக்கையைப் போலவே நல்லது.",
  "actual": {
   "qwen35-4b": 85,
   "bonsai-ternary-4b": 218,
   "lfm2-1.2b": 422,
   "gemma4-e2b": 46,
   "minicpm5-2b-gguf": 332
  }
 },
 {
  "name": "te-a",
  "text": "సందర్భ నిర్మాత తదుపరి అభ్యర్థనలో ఏ సంభాషణలు మిగులుతాయో నిర్ణయిస్తుంది. ఇది టోకెన్ బడ్జెట్ నుండి పనిచేస్తుంది, ఆ బడ్జెట్ దానిలోకి వెళ్లే లెక్కింపు అంత మంచిది.",
  "actual": {
   "qwen35-4b": 90,
   "bonsai-ternary-4b": 237,
   "lfm2-1.2b": 408,
   "gemma4-e2b": 58,
   "minicpm5-2b-gguf": 292
  }
 },
 {
  "name": "gu-a",
  "text": "સંદર્ભ બનાવનાર નક્કી કરે છે કે આગલી વિનંતીમાં કઈ વાતચીત ટકી રહેશે. તે ટોકન બજેટથી કામ કરે છે, અને તે બજેટ તેમાં જતી ગણતરી જેટલું જ સારું છે.",
  "actual": {
   "qwen35-4b": 85,
   "bonsai-ternary-4b": 199,
   "lfm2-1.2b": 333,
   "gemma4-e2b": 56,
   "minicpm5-2b-gguf": 360
  }
 },
 {
  "name": "ar-a",
  "text": "يقرر منشئ السياق أي المحادثات ستبقى في الطلب التالي. إنه يعمل من ميزانية رموز، وتلك الميزانية جيدة بقدر جودة العد الذي يغذيها. عندما يكون العد مجرد تقدير للأحرف، فإن المحادثة ستتجاوز النافذة.",
  "actual": {
   "qwen35-4b": 55,
   "bonsai-ternary-4b": 69,
   "lfm2-1.2b": 86,
   "gemma4-e2b": 67,
   "minicpm5-2b-gguf": 175
  }
 },
 {
  "name": "zh-a",
  "text": "上下文构建器决定哪些对话会保留到下一次请求。它基于一个令牌预算工作，而这个预算的好坏取决于输入它的计数。当计数只是一个字符启发式时，对话会在不触发保护的情况下溢出窗口。",
  "actual": {
   "qwen35-4b": 44,
   "bonsai-ternary-4b": 51,
   "lfm2-1.2b": 73,
   "gemma4-e2b": 49,
   "minicpm5-2b-gguf": 44
  }
 },
 {
  "name": "ja-a",
  "text": "コンテキストビルダーは、次のリクエストにどの会話が残るかを決めます。トークン予算に基づいて動作し、その予算はそこに入る数え方と同じくらいの精度しかありません。",
  "actual": {
   "qwen35-4b": 39,
   "bonsai-ternary-4b": 51,
   "lfm2-1.2b": 54,
   "gemma4-e2b": 40,
   "minicpm5-2b-gguf": 56
  }
 },
 {
  "name": "ru-a",
  "text": "Построитель контекста решает, какие реплики попадут в следующий запрос. Он работает от бюджета токенов, и этот бюджет настолько хорош, насколько хорош счёт, который его питает.",
  "actual": {
   "qwen35-4b": 41,
   "bonsai-ternary-4b": 53,
   "lfm2-1.2b": 65,
   "gemma4-e2b": 43,
   "minicpm5-2b-gguf": 49
  }
 },
 {
  "name": "mixed-hi-en-a",
  "text": "यह function context window को manage करता है। अगर token count गलत है तो conversation silently truncate हो जाएगी, और user को कोई warning नहीं मिलेगी।",
  "actual": {
   "qwen35-4b": 35,
   "bonsai-ternary-4b": 66,
   "lfm2-1.2b": 94,
   "gemma4-e2b": 29,
   "minicpm5-2b-gguf": 60
  }
 },
 {
  "name": "en-prose-b",
  "text": "A budget that cannot see the script it is counting will always fail the same way: quietly, and only for the people whose language packs the fewest characters into a token. The remedy is dull and mechanical. Classify the characters, weight each class by what the model's own tokenizer does to it, and add the parts up.",
  "actual": {
   "qwen35-4b": 67,
   "bonsai-ternary-4b": 67,
   "lfm2-1.2b": 68,
   "gemma4-e2b": 67,
   "minicpm5-2b-gguf": 68
  }
 },
 {
  "name": "en-chat-b",
  "text": "hey, quick one — does the reranker run before or after the window is cut? asking because my long threads keep losing the first message.",
  "actual": {
   "qwen35-4b": 29,
   "bonsai-ternary-4b": 29,
   "lfm2-1.2b": 31,
   "gemma4-e2b": 29,
   "minicpm5-2b-gguf": 30
  }
 },
 {
  "name": "code-js-b",
  "text": "const out = [];\nif (effectiveSystem) out.push({ role: 'system', content: effectiveSystem });\nlet used = countTokens(effectiveSystem, modelKey);\nwhile (i < allMessages.length) {\n  const msg = allMessages[i++];\n  if (!msg || !msg.content) continue;\n}",
  "actual": {
   "qwen35-4b": 70,
   "bonsai-ternary-4b": 63,
   "lfm2-1.2b": 66,
   "gemma4-e2b": 73,
   "minicpm5-2b-gguf": 65
  }
 },
 {
  "name": "code-py-b",
  "text": "class Window:\n    def __init__(self, limit):\n        self.limit = limit\n        self.items = []\n\n    def add(self, item):\n        self.items.append(item)\n        while self.cost() > self.limit:\n            self.items.pop(0)",
  "actual": {
   "qwen35-4b": 58,
   "bonsai-ternary-4b": 52,
   "lfm2-1.2b": 59,
   "gemma4-e2b": 68,
   "minicpm5-2b-gguf": 56
  }
 },
 {
  "name": "json-b",
  "text": "{\"model\":\"ternary-bonsai-2-27b-webgpu\",\"messages\":[{\"role\":\"system\",\"content\":\"You are concise.\"},{\"role\":\"user\",\"content\":\"summarise\"}],\"stream\":true,\"temperature\":0,\"max_tokens\":512,\"tools\":[{\"type\":\"function\",\"function\":{\"name\":\"get_time\"}}]}",
  "actual": {
   "qwen35-4b": 70,
   "bonsai-ternary-4b": 70,
   "lfm2-1.2b": 81,
   "gemma4-e2b": 72,
   "minicpm5-2b-gguf": 67
  }
 },
 {
  "name": "hi-b",
  "text": "भारत में बाईस भाषाएँ आधिकारिक हैं और उनमें से अधिकतर देवनागरी में नहीं लिखी जातीं। एक ही नियम सब पर लागू करने से वही होता है जो हमेशा होता है — जिनकी लिपि अलग है, उनके लिए औज़ार चुपचाप टूट जाता है।",
  "actual": {
   "qwen35-4b": 82,
   "bonsai-ternary-4b": 189,
   "lfm2-1.2b": 246,
   "gemma4-e2b": 52,
   "minicpm5-2b-gguf": 158
  }
 },
 {
  "name": "mr-b",
  "text": "पुण्यातील एका छोट्या कार्यशाळेत आम्ही हेच तपासले. मराठी मजकूर टोकनमध्ये किती जागा घेतो हे मोजल्याशिवाय कोणतेही बजेट विश्वासार्ह नाही.",
  "actual": {
   "qwen35-4b": 62,
   "bonsai-ternary-4b": 126,
   "lfm2-1.2b": 165,
   "gemma4-e2b": 41,
   "minicpm5-2b-gguf": 100
  }
 },
 {
  "name": "bn-b",
  "text": "ঢাকার একটি ছোট কর্মশালায় আমরা ঠিক এটাই পরীক্ষা করেছি। বাংলা লেখা টোকেনে কতটা জায়গা নেয় তা না মেপে কোনো বাজেট নির্ভরযোগ্য নয়।",
  "actual": {
   "qwen35-4b": 59,
   "bonsai-ternary-4b": 139,
   "lfm2-1.2b": 253,
   "gemma4-e2b": 29,
   "minicpm5-2b-gguf": 198
  }
 },
 {
  "name": "kn-b",
  "text": "ಬೆಂಗಳೂರಿನ ಒಂದು ಸಣ್ಣ ಕಾರ್ಯಾಗಾರದಲ್ಲಿ ನಾವು ಇದನ್ನೇ ಪರೀಕ್ಷಿಸಿದೆವು. ಕನ್ನಡ ಪಠ್ಯವು ಟೋಕನ್‌ಗಳಲ್ಲಿ ಎಷ್ಟು ಜಾಗ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ ಎಂದು ಅಳೆಯದೆ ಯಾವ ಬಜೆಟ್ಟೂ ನಂಬಲರ್ಹವಲ್ಲ.",
  "actual": {
   "qwen35-4b": 88,
   "bonsai-ternary-4b": 216,
   "lfm2-1.2b": 400,
   "gemma4-e2b": 51,
   "minicpm5-2b-gguf": 196
  }
 },
 {
  "name": "ta-b",
  "text": "சென்னையில் ஒரு சிறிய பட்டறையில் நாங்கள் இதையே சோதித்தோம். தமிழ் உரை டோக்கன்களில் எவ்வளவு இடம் எடுக்கிறது என்பதை அளக்காமல் எந்த பட்ஜெட்டும் நம்பகமானது அல்ல.",
  "actual": {
   "qwen35-4b": 71,
   "bonsai-ternary-4b": 171,
   "lfm2-1.2b": 331,
   "gemma4-e2b": 40,
   "minicpm5-2b-gguf": 266
  }
 },
 {
  "name": "te-b",
  "text": "హైదరాబాద్‌లోని ఒక చిన్న కార్యశాలలో మేము దీన్నే పరీక్షించాము. తెలుగు పాఠ్యం టోకెన్లలో ఎంత స్థలం తీసుకుంటుందో కొలవకుండా ఏ బడ్జెట్టూ నమ్మదగినది కాదు.",
  "actual": {
   "qwen35-4b": 91,
   "bonsai-ternary-4b": 218,
   "lfm2-1.2b": 382,
   "gemma4-e2b": 50,
   "minicpm5-2b-gguf": 273
  }
 },
 {
  "name": "gu-b",
  "text": "અમદાવાદની એક નાની વર્કશોપમાં અમે આ જ ચકાસ્યું. ગુજરાતી લખાણ ટોકનમાં કેટલી જગ્યા લે છે તે માપ્યા વિના કોઈ બજેટ ભરોસાપાત્ર નથી.",
  "actual": {
   "qwen35-4b": 79,
   "bonsai-ternary-4b": 184,
   "lfm2-1.2b": 308,
   "gemma4-e2b": 47,
   "minicpm5-2b-gguf": 329
  }
 },
 {
  "name": "ml-b",
  "text": "കൊച്ചിയിലെ ഒരു ചെറിയ ശില്പശാലയിൽ ഞങ്ങൾ ഇതുതന്നെ പരിശോധിച്ചു. മലയാളം വാചകം ടോക്കണുകളിൽ എത്ര സ്ഥലം എടുക്കുന്നു എന്ന് അളക്കാതെ ഒരു ബജറ്റും വിശ്വസനീയമല്ല.",
  "actual": {
   "qwen35-4b": 85,
   "bonsai-ternary-4b": 206,
   "lfm2-1.2b": 395,
   "gemma4-e2b": 48,
   "minicpm5-2b-gguf": 317
  }
 },
 {
  "name": "pa-b",
  "text": "ਅੰਮ੍ਰਿਤਸਰ ਦੀ ਇੱਕ ਛੋਟੀ ਵਰਕਸ਼ਾਪ ਵਿੱਚ ਅਸੀਂ ਇਹੀ ਪਰਖਿਆ। ਪੰਜਾਬੀ ਲਿਖਤ ਟੋਕਨਾਂ ਵਿੱਚ ਕਿੰਨੀ ਥਾਂ ਲੈਂਦੀ ਹੈ, ਇਹ ਮਾਪੇ ਬਿਨਾਂ ਕੋਈ ਬਜਟ ਭਰੋਸੇਯੋਗ ਨਹੀਂ।",
  "actual": {
   "qwen35-4b": 104,
   "bonsai-ternary-4b": 196,
   "lfm2-1.2b": 320,
   "gemma4-e2b": 75,
   "minicpm5-2b-gguf": 341
  }
 },
 {
  "name": "or-b",
  "text": "ଭୁବନେଶ୍ୱରର ଏକ ଛୋଟ କର୍ମଶାଳାରେ ଆମେ ଏହାହିଁ ପରୀକ୍ଷା କଲୁ। ଓଡ଼ିଆ ଲେଖା ଟୋକେନରେ କେତେ ସ୍ଥାନ ନିଏ ତାହା ନ ମାପି କୌଣସି ବଜେଟ ବିଶ୍ୱସନୀୟ ନୁହେଁ।",
  "actual": {
   "qwen35-4b": 110,
   "bonsai-ternary-4b": 253,
   "lfm2-1.2b": 316,
   "gemma4-e2b": 99,
   "minicpm5-2b-gguf": 331
  }
 },
 {
  "name": "ar-b",
  "text": "في ورشة صغيرة اختبرنا الأمر نفسه. لا يمكن الوثوق بأي ميزانية دون قياس المساحة التي يشغلها النص العربي داخل الرموز.",
  "actual": {
   "qwen35-4b": 31,
   "bonsai-ternary-4b": 39,
   "lfm2-1.2b": 49,
   "gemma4-e2b": 36,
   "minicpm5-2b-gguf": 102
  }
 },
 {
  "name": "zh-b",
  "text": "我们在一个小型工作坊里测试了同样的问题。不先测量中文文本在令牌中占多少空间，任何预算都不可信。",
  "actual": {
   "qwen35-4b": 28,
   "bonsai-ternary-4b": 29,
   "lfm2-1.2b": 38,
   "gemma4-e2b": 29,
   "minicpm5-2b-gguf": 27
  }
 },
 {
  "name": "ja-b",
  "text": "小さなワークショップで同じことを検証しました。日本語のテキストがトークンでどれだけの場所を取るかを測らずに、予算は信用できません。",
  "actual": {
   "qwen35-4b": 29,
   "bonsai-ternary-4b": 43,
   "lfm2-1.2b": 40,
   "gemma4-e2b": 31,
   "minicpm5-2b-gguf": 40
  }
 },
 {
  "name": "ru-b",
  "text": "В небольшой мастерской мы проверили то же самое. Ни один бюджет не заслуживает доверия, пока не измерено, сколько места занимает русский текст в токенах.",
  "actual": {
   "qwen35-4b": 38,
   "bonsai-ternary-4b": 51,
   "lfm2-1.2b": 49,
   "gemma4-e2b": 36,
   "minicpm5-2b-gguf": 41
  }
 },
 {
  "name": "mixed-hi-en-b",
  "text": "RAG pipeline में chunk size 900 characters है, लेकिन Kannada text के लिए यह लगभग 400 tokens बन जाता है — budget check pass हो जाता है और window फिर भी overflow करती है।",
  "actual": {
   "qwen35-4b": 47,
   "bonsai-ternary-4b": 90,
   "lfm2-1.2b": 104,
   "gemma4-e2b": 43,
   "minicpm5-2b-gguf": 75
  }
 },
 {
  "name": "mixed-code-ta-b",
  "text": "// தமிழ் உரைக்கு token எண்ணிக்கை\nconst n = countTokens(text, 'ternary-bonsai-2-27b-webgpu');\nif (n > budget) { trim(); }",
  "actual": {
   "qwen35-4b": 45,
   "bonsai-ternary-4b": 61,
   "lfm2-1.2b": 89,
   "gemma4-e2b": 43,
   "minicpm5-2b-gguf": 76
  }
 }
];
