const express = require("express");
const axios = require("axios");
const facilities = require("../seedFacilities");

const router = express.Router();
const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "https://izi-health-ml.onrender.com";
const CHATBOT_TIMEOUT_MS = Number(process.env.CHATBOT_TIMEOUT_MS || 15000);

const typoWords = {
  diabets: "diabetes",
  diabtes: "diabetes",
  dibetes: "diabetes",
  diabetis: "diabetes",
  diabetees: "diabetes",
  suger: "sugar",
  glocose: "glucose",
  glucoes: "glucose",
  hedache: "headache",
  headach: "headache",
  migrane: "migraine",
  migren: "migraine",
  insuline: "insulin",
  ramaa: "rama",
  mutuele: "mutuelle",
  mutuel: "mutuelle",
  rss: "rssb",
};

function normalizeText(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => typoWords[word] || word)
    .join(" ");
}

function isEmergency(text) {
  return /chest pain|shortness of breath|difficulty breathing|fainting|stroke|severe bleeding|unconscious|heart attack/.test(text);
}

function wantsFacilities(text) {
  return /show|find|search|facility|facilities|hospital|clinic|where|visit|go|recommend/.test(text);
}

function symptomService(text) {
  if (/diabetes|glucose|blood sugar|insulin|sugar|blurred vision/.test(text)) return "diabetes care";
  if (/headache|migraine|fever|cough|flu|stomach/.test(text)) return "general medicine";
  if (/chest pain|heart|breath|shortness|emergency/.test(text)) return "emergency";
  if (/child|baby|pediatric/.test(text)) return "pediatrics";
  if (/pregnancy|pregnant|maternity/.test(text)) return "maternity";
  return "";
}

function findFacilities(text) {
  const service = symptomService(text);
  const words = [];

  if (service) words.push(service);

  ["rama", "rssb", "mutuelle", "aar", "jubilee", "radiant"].forEach((x) => {
    if (text.includes(x)) words.push(x);
  });

  if (words.length === 0) return [];

  return facilities
    .filter((f) => {
      const searchable = (
        f.name +
        " " +
        f.type +
        " " +
        f.district +
        " " +
        f.services.join(" ") +
        " " +
        f.specialists.join(" ") +
        " " +
        f.insurance.join(" ")
      ).toLowerCase();

      return words.some((w) => searchable.includes(w));
    })
    .slice(0, 3);
}

function shortFallback(text) {
  if (/headache|migraine/.test(text)) {
    return "A headache can be caused by stress, dehydration, lack of sleep, or infection. Rest, drink water, and seek care if it is severe, sudden, or comes with fever, vomiting, vision changes, or weakness.";
  }

  if (/diabetes|glucose|blood sugar|sugar|insulin/.test(text)) {
    return "Diabetes is a condition where blood sugar becomes higher than normal because the body cannot produce enough insulin or cannot use it effectively. Keep monitoring glucose, take medication as prescribed, and seek care if readings stay high.";
  }

  if (/fever|cough|flu/.test(text)) {
    return "Fever, cough, or flu symptoms may need rest, fluids, and monitoring. Seek care if symptoms worsen, breathing becomes difficult, or fever stays high.";
  }

  return "I can provide basic healthcare navigation and health education, but I cannot diagnose or prescribe medication.";
}

router.post("/", async (req, res) => {
  try {
    const originalQuestion = req.body.question || "";
    const question = normalizeText(originalQuestion);

    let answer = "";
    let confidence = null;
    let source = "IZI Health";
    let focus_area = "General Health";
    let mode = "fallback";
    let matchedFacilities = [];

    if (isEmergency(question)) {
      answer =
        "🚨 This may be urgent. Chest pain, shortness of breath, fainting, or stroke-like symptoms can be serious. Please seek emergency medical care immediately.";
      mode = "emergency";
      matchedFacilities = findFacilities("emergency");
    } else {
      try {
        const mlResponse = await axios.post(
          `${ML_SERVICE_URL}/chatbot-qa`,
          {
            question,
          },
          {
            timeout: CHATBOT_TIMEOUT_MS,
          }
        );

        answer = mlResponse.data.answer || "";
        confidence = mlResponse.data.confidence || mlResponse.data.similarity || null;
        source = mlResponse.data.source || "MedQuAD";
        focus_area = mlResponse.data.focus_area || "General Health";
        mode = mlResponse.data.mode || "medquad_semantic";

        if (!answer || confidence < 0.55) {
          answer = shortFallback(question);
          mode = "safe_fallback";
        }
      } catch (error) {
        answer = shortFallback(question);
        mode = "safe_fallback";
      }

      if (wantsFacilities(question)) {
        matchedFacilities = findFacilities(question);

        if (matchedFacilities.length > 0) {
          answer += "\n\nBased on your request, I found some facilities that may help. You can open their profiles below.";
        } else {
          answer += "\n\nI could not find a matching facility in the current prototype list. Try searching by service, district, or insurance.";
        }
      }
    }

    answer += "\n\nSafety note: IZI Health does not diagnose or prescribe medication.";

    res.json({
      answer,
      confidence,
      source,
      focus_area,
      mode,
      facilities: matchedFacilities,
      suggestions: [
        "Find a facility",
        "Diabetes symptoms",
        "Medication reminder",
        "When should I seek care?"
      ],
    });
  } catch (error) {
    res.status(500).json({
      answer: "Sorry, the chatbot is not available right now.",
      facilities: [],
    });
  }
});

module.exports = router;
