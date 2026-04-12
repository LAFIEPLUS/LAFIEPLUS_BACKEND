import axios from "axios";
import { GROQ_API_KEY } from "../config/env.js";

// Rule-based fallback - used when GROK_API_KEY is not set
const ruleBaseRisk = (symptoms) => {
    const s = symptoms.map((x) => x.toLowerCase());

    const emergency = ["chest pain", "difficulty breathing", "shortness of breath", "unconscious", "seizure", "stroke", "severe bleeding"];

    const high = ["high fever", "severe headache", "vomiting blood", "coughing blood", "severe abdominal pain"];

    const moderate = ["fever", "headache", "persistent cough", "abdominal pain", "dizziness", "rash", "nausea", "fatigue", "vomiting"];

    if (s.some((x) => emergency.some((k) => x.includes(k)))) {
        return {
            riskLevel: "emergency",
            summary: "Your symptoms may indicate a medical emergency. Seek immediate care.",
            nextSteps: ["Call emergency services immediately (112)", "Go to the nearest emergency room", "Do not drive yourself"],
            preventiveTips: [],
            seekCareImmediately: true,
        };
    }

    if (s.some((x) => high.some((k) => x.includes(k))) || symptoms.length >= 5) {
        return {
            riskLevel: "high",
            summary: "Your symptoms suggest you should see a doctor urgently.",
            nextSteps: ["Visit a clinic or hospital within 24 hours", "Monitor your symptoms closely", "Consider a health partner consultation"],
            preventiveTips: ["Stay hydrated", "Rest as much as possible"],
            seekCareImmediately: false,
        };
    }
    if (s.some((x) => moderate.some((k) => x.includes(k))) || symptoms.length >= 3) {
        return {
            riskLevel: "moderate",
            summary: "Your symptoms are moderate. Monitor closely and consider seeking advice.",
            nextSteps: ["Monitor symptoms over 24–48 hours", "Consider a virtual consultation", "Visit a clinic if symptoms worsen"],
            preventiveTips: ["Stay hydrated", "Get adequate rest", "Eat light, nutritious meals"],
            seekCareImmediately: false,
        };
    }
    return {
        riskLevel: "low",
        summary: "Your symptoms appear mild. Self-care measures should help.",
        nextSteps: ["Rest and stay hydrated", "Monitor your symptoms", "Visit a clinic if symptoms persist beyond 3 days"],
        preventiveTips: ["Maintain good hand hygiene", "Eat a balanced diet", "Get enough sleep"],
        seekCareImmediately: false,
    };
};

export const aiSymptomCheck = async (symptoms, userContext = {}) => {
    if (!GROQ_API_KEY || GROQ_API_KEY === "") {
        console.log("[AI Service] No API key configured - using rule-based fallback");
        return ruleBaseRisk(symptoms);
    }

    const context = userContext.age
        ? `Patient: ${userContext.age}-year-old ${userContext.gender || "person"}${userContext.maternalStatus ? `, ${userContext.maternalStatus}` : ""}.`
        : "";

    const prompt = `You are a medical triage assistant for LafiePlus, a health platform in Ghana - West Africa.
${context}
Reported symptoms: ${symptoms.join(", ")}.
    
Respond ONLY with a JSON object (no markdown, no backticks)
:
{
  "riskLevel": "low|moderate|high|emergency",
  "summary": "1-2 sentence plain-language summary",
  "nextSteps": ["step 1", "step 2", "step 3"],
  "preventiveTips": ["tip 1", "tip 2"],
  "seekCareImmediately": true|false
}

Risk guide: low=self-care, moderate=see doctor soon, high=see doctor urgently, emergency=call ambulance.
Use simple, culturally appropriate language for West Africa.`;

    try {
        const { data } = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 400,
                temperature: 0.2,
            },
            {
                headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
                timeout: 10000,
            }
        );
        const text = data.choices[0].message.content.trim().replace(/```json|```/g, "").trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("[AI Service] groq error:", error.message, "— falling back to rule-based");
        return ruleBaseRisk(symptoms);
    }
};