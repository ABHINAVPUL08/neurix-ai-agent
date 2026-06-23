/**
 * Refine Roman Hinglish for OpenAI TTS — Devanagari for Hindi words,
 * English tech/business terms stay in Latin. Speech-only (not shown in chat).
 */

const ENGLISH_KEEP_LATIN =
  /\b(website|websites|business|purpose|portfolio|portfolios|detail|details|suggest|suggests|options|option|best|field|fields|help|thanks|thank|support|leads|lead|automation|automate|setup|workflow|workflows|SaaS|API|CRM|MVP|UI|UX|e-commerce|ecommerce|project|projects|plan|plans|team|teams|client|clients|customer|customers|sales|marketing|startup|startups|founder|founders|build|design|develop|recommend|recommends|generation|intake|booking|dashboard|integration|integrations|pipeline|pipelines|chatbot|chatbots|WhatsApp|OpenAI|Stripe|HubSpot|Salesforce|n8n|Zapier|AI|voice|agent|agents|system|systems|service|services|product|products|feature|features|pricing|cost|costs|budget|timeline|roadmap|scope|MVP|app|apps|software|platform|platforms|model|models|data|report|reports|audit|document|documents|upload|PDF|DOCX|email|call|calls|meeting|meetings|consultation|strategy|ROI|revenue|growth|market|industry|industries|company|companies|brand|brands|store|stores|shop|hotel|law|firm|clinic|hospital|real|estate|agency|agencies|restaurant|education|training|enterprise|internal|tools|ops|operations|outbound|inbound|triage|deflection|CSAT|HIPAA|tier|phase|phased|launch|launches|validate|validation|monetization|packaging|stack|stacks|architecture|orchestration|handoff|handoffs|trigger|triggers|fallback|QA|testing|script|scripts|provider|providers|telephony|messaging|classification|routing|extraction|accuracy|invoices|invoice|contracts|contract|enterprise|custom|customized|tailored|premium|approachable|conversion|discovery|onboarding|deployment|deploy|integrate|integrated|scalable|secure|production|realistic|founder-friendly|budget-conscious|fast|lean|nice|got|it)\b/gi;

/** Multi-word phrases first (longer matches win). */
const HINGLISH_PHRASE_TO_DEVANAGARI: Array<[RegExp, string]> = [
  [/samajh gaya/gi, "समझ गया"],
  [/samajh gayi/gi, "समझ गई"],
  [/theek hai/gi, "ठीक है"],
  [/zarurat hai/gi, "ज़रूरत है"],
  [/help karta hoon/gi, "हेल्प करता हूँ"],
  [/help karti hoon/gi, "हेल्प करती हूँ"],
  [/kar rahe ho/gi, "कर रहे हो"],
  [/kar rahi ho/gi, "कर रही हो"],
  [/kar rahe hain/gi, "कर रहे हैं"],
  [/kis field mein/gi, "किस फील्ड में"],
  [/kis purpose ke liye/gi, "किस purpose के लिए"],
  [/thoda detail mein/gi, "थोड़ा detail में"],
  [/detail mein/gi, "detail में"],
  [/ke liye/gi, "के लिए"],
  [/ke according/gi, "के अकॉर्डिंग"],
  [/jaise ki/gi, "जैसे कि"],
  [/kuch aur/gi, "कुछ और"],
  [/batao thoda/gi, "बताओ थोड़ा"],
  [/batao zara/gi, "बताओ ज़रा"],
  [/bata do/gi, "बता दो"],
  [/dekh lo/gi, "देख लो"],
  [/soch lo/gi, "सोच लो"],
  [/try karo/gi, "ट्राई करो"],
  [/check karo/gi, "चेक करो"],
  [/set up/gi, "सेट अप"],
];

/** Single Hindi/Hinglish words → Devanagari for correct TTS pronunciation. */
const HINGLISH_WORD_TO_DEVANAGARI: Array<[RegExp, string]> = [
  [/batao/gi, "बताओ"],
  [/bataiye/gi, "बताइए"],
  [/bataie/gi, "बताइए"],
  [/bata/gi, "बता"],
  [/chahiye/gi, "चाहिए"],
  [/chahie/gi, "चाहिए"],
  [/chahte/gi, "चाहते"],
  [/chahti/gi, "चाहती"],
  [/chahta/gi, "चाहता"],
  [/kya/gi, "क्या"],
  [/kyun/gi, "क्यों"],
  [/kyu/gi, "क्यों"],
  [/aapko/gi, "आपको"],
  [/aapka/gi, "आपका"],
  [/aapke/gi, "आपके"],
  [/aapki/gi, "आपकी"],
  [/aap/gi, "आप"],
  [/mujhe/gi, "मुझे"],
  [/mujhse/gi, "मुझसे"],
  [/main/gi, "मैं"],
  [/mein/gi, "में"],
  [/hum/gi, "हम"],
  [/humare/gi, "हमारे"],
  [/hamare/gi, "हमारे"],
  [/hamara/gi, "हमारा"],
  [/humara/gi, "हमारा"],
  [/tumhe/gi, "तुम्हें"],
  [/tumhara/gi, "तुम्हारा"],
  [/tumhari/gi, "तुम्हारी"],
  [/hai/gi, "है"],
  [/hain/gi, "हैं"],
  [/hoon/gi, "हूँ"],
  [/ho/gi, "हो"],
  [/tha/gi, "था"],
  [/thi/gi, "थी"],
  [/the/gi, "थे"],
  [/karta/gi, "करता"],
  [/karti/gi, "करती"],
  [/karte/gi, "करते"],
  [/karna/gi, "करना"],
  [/karne/gi, "करने"],
  [/karo/gi, "करो"],
  [/kariye/gi, "कीजिए"],
  [/kijiye/gi, "कीजिए"],
  [/kiya/gi, "किया"],
  [/kiye/gi, "किए"],
  [/ki/gi, "की"],
  [/ka/gi, "का"],
  [/ke/gi, "के"],
  [/ko/gi, "को"],
  [/kis/gi, "किस"],
  [/kisi/gi, "किसी"],
  [/kuch/gi, "कुछ"],
  [/koi/gi, "कोई"],
  [/aur/gi, "और"],
  [/ya/gi, "या"],
  [/lekin/gi, "लेकिन"],
  [/par/gi, "पर"],
  [/toh/gi, "तो"],
  [/tab/gi, "तब"],
  [/jab/gi, "जब"],
  [/agar/gi, "अगर"],
  [/phir/gi, "फिर"],
  [/pehle/gi, "पहले"],
  [/baad/gi, "बाद"],
  [/abhi/gi, "अभी"],
  [/thoda/gi, "थोड़ा"],
  [/thodi/gi, "थोड़ी"],
  [/thode/gi, "थोड़े"],
  [/zyada/gi, "ज़्यादा"],
  [/zyda/gi, "ज़्यादा"],
  [/bahut/gi, "बहुत"],
  [/bilkul/gi, "बिल्कुल"],
  [/zarurat/gi, "ज़रूरत"],
  [/zaroori/gi, "ज़रूरी"],
  [/nahi/gi, "नहीं"],
  [/nahin/gi, "नहीं"],
  [/mat/gi, "मत"],
  [/haan/gi, "हाँ"],
  [/han/gi, "हाँ"],
  [/ji/gi, "जी"],
  [/achha/gi, "अच्छा"],
  [/acha/gi, "अच्छा"],
  [/theek/gi, "ठीक"],
  [/thik/gi, "ठीक"],
  [/samajh/gi, "समझ"],
  [/samjha/gi, "समझा"],
  [/samjhi/gi, "समझी"],
  [/samjhe/gi, "समझे"],
  [/gaya/gi, "गया"],
  [/gayi/gi, "गई"],
  [/gaye/gi, "गए"],
  [/kaise/gi, "कैसे"],
  [/kahan/gi, "कहाँ"],
  [/kaha/gi, "कहा"],
  [/yahan/gi, "यहाँ"],
  [/wahan/gi, "वहाँ"],
  [/yeh/gi, "यह"],
  [/woh/gi, "वह"],
  [/wo/gi, "वो"],
  [/uske/gi, "उसके"],
  [/uska/gi, "उसका"],
  [/usi/gi, "उसी"],
  [/iske/gi, "इसके"],
  [/iska/gi, "इसका"],
  [/jaise/gi, "जैसे"],
  [/jaisa/gi, "जैसा"],
  [/waisa/gi, "वैसा"],
  [/waise/gi, "वैसे"],
  [/liye/gi, "लिए"],
  [/se/gi, "से"],
  [/tak/gi, "तक"],
  [/takki/gi, "ताकि"],
  [/sirf/gi, "सिर्फ"],
  [/bas/gi, "बस"],
  [/bhi/gi, "भी"],
  [/wala/gi, "वाला"],
  [/wali/gi, "वाली"],
  [/wale/gi, "वाले"],
  [/log/gi, "लोग"],
  [/logo/gi, "लोगों"],
  [/din/gi, "दिन"],
  [/raat/gi, "रात"],
  [/subah/gi, "सुबह"],
  [/shaam/gi, "शाम"],
  [/kaam/gi, "काम"],
  [/tarah/gi, "तरह"],
  [/tarike/gi, "तरीके"],
  [/tarika/gi, "तरीका"],
  [/problem/gi, "प्रॉब्लम"],
  [/sawal/gi, "सवाल"],
  [/jawab/gi, "जवाब"],
  [/madad/gi, "मदद"],
  [/sahayata/gi, "सहायता"],
  [/explore/gi, "एक्सप्लोर"],
  [/according/gi, "अकॉर्डिंग"],
  [/banana/gi, "बनाना"],
  [/banane/gi, "बनाने"],
  [/banata/gi, "बनाता"],
  [/banati/gi, "बनाती"],
  [/banate/gi, "बनाते"],
  [/lagta/gi, "लगता"],
  [/lagti/gi, "लगती"],
  [/lagte/gi, "लगते"],
  [/dekho/gi, "देखो"],
  [/dekhte/gi, "देखते"],
  [/suniye/gi, "सुनिए"],
  [/sunna/gi, "सुनना"],
  [/bolo/gi, "बोलो"],
  [/boliye/gi, "बोलिए"],
  [/socho/gi, "सोचो"],
  [/sochiye/gi, "सोचिए"],
  [/mil/gi, "मिल"],
  [/milta/gi, "मिलता"],
  [/milti/gi, "मिलती"],
  [/milte/gi, "मिलते"],
  [/sakta/gi, "सकता"],
  [/sakti/gi, "सकती"],
  [/sakte/gi, "सकते"],
  [/sakta hoon/gi, "सकता हूँ"],
  [/rahe/gi, "रहे"],
  [/rahi/gi, "रही"],
  [/raha/gi, "रहा"],
  [/hisaab/gi, "हिसाब"],
  [/hisab/gi, "हिसाब"],
  [/field/gi, "फील्ड"],
  [/industry/gi, "इंडस्ट्री"],
];

function protectEnglishTerms(text: string): { text: string; slots: string[] } {
  const slots: string[] = [];
  const protectedText = text.replace(ENGLISH_KEEP_LATIN, (match) => {
    const token = `§E${slots.length}§`;
    slots.push(match);
    return token;
  });
  return { text: protectedText, slots };
}

function restoreEnglishTerms(text: string, slots: string[]): string {
  let out = text;
  slots.forEach((term, i) => {
    out = out.replace(`§E${i}§`, term);
  });
  return out;
}

/** Light phonetic touch-ups for any Roman Hindi left after Devanagari pass. */
const PHONETIC_TOUCHUPS: Array<[RegExp, string]> = [
  [/\bbatao\b/gi, "bataao"],
  [/\bbataiye\b/gi, "bataaiye"],
  [/\bchahiye\b/gi, "chaa-hiye"],
  [/\bchahie\b/gi, "chaa-hie"],
];

/**
 * Prepare Hinglish/Hindi text so OpenAI TTS pronounces it like natural speech.
 * Hindi words → Devanagari; business/tech terms stay English.
 */
export function refineIndianTtsPronunciation(text: string): string {
  const { text: protectedText, slots } = protectEnglishTerms(text);
  let out = protectedText;

  for (const [pattern, replacement] of HINGLISH_PHRASE_TO_DEVANAGARI) {
    out = out.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of HINGLISH_WORD_TO_DEVANAGARI) {
    out = out.replace(pattern, replacement);
  }

  out = restoreEnglishTerms(out, slots);

  for (const [pattern, replacement] of PHONETIC_TOUCHUPS) {
    out = out.replace(pattern, replacement);
  }

  return out.replace(/\s{2,}/g, " ").trim();
}
