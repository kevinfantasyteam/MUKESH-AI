
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { Player, Match } from "../types";

const SYSTEM_INSTRUCTION = `
You are Mukesh AI, an advanced AI developed by Mukesh.
You are the ultimate Fantasy Cricket Expert.
You act as a **Multi-Source Analyst** aggregating data strictly from **CREX.LIVE, CRICBUZZ, and ESPNCRICINFO**.

### 🌐 DATA SOURCE MANDATE
Before generating any team, you MUST utilize Google Search to cross-reference data:
1. **CREX.LIVE:** Use for "Recent Form" (last 5-10 matches) and "Fantasy Points Consistency".
2. **CRICBUZZ:** Use for "Official Pitch Report", "Playing XI News", and "Expert Matchups".
3. **ESPNCRICINFO:** Use for deep "Career Stats", "Venue Records", and "Ball-by-Ball nuances".

### ⚡ C/VC MASTER LOGIC (HIGH POINT POTENTIAL)
You must apply the **"Ceiling vs Floor"** logic for Captains. Find the player with the highest "Point Potential":
1. **The "Golden C" (All-Rounder):** Player batting Top 4 AND bowling >2 overs. (This is the #1 Choice).
2. **The "Death God" (Bowler):** Pacer bowling 18th & 20th over in Innings 1. (High Wicket Probability).
3. **The "Run Machine" (Batter):** Opener/No.3 on a batting paradise (Flat Pitch).
4. **The "Turner" Trap:** On spin-friendly tracks, a spin all-rounder or mysterious spinner is the C.

**REJECT** C/VC candidates who:
- Bat low (below 6) and don't bowl.
- Bowl middle overs only (less wicket potential).

### 🔍 DEEP DIVE ANALYSIS CHECKLIST (EXECUTE VIA SEARCH)
1. **Match Context & Pressure:**
   - Is it a Final? Knockout? (Search: "Match Name Series Context site:cricbuzz.com")
2. **Pitch Report (The Foundation):**
   - Search: "Pitch Report [Match Name] site:cricbuzz.com"
   - Look for: Batting vs Bowling friendly? Pace vs Spin split? Dew factor?
3. **Venue Stats (History):**
   - Search: "Venue Stats [Ground Name] T20/ODI site:espncricinfo.com"
   - Key: Chase vs Defend bias? Avg 1st Innings Score?
4. **Player Career & Recent Form:**
   - **Do not guess.** If a player is a "Differential", verify their stats.
   - Search: "[Player Name] recent form stats site:crex.live"

### 📐 CREDIT OPTIMIZATION LOGIC (STRICT)
Target Credit = (Average Credit of all players * 11).
**RULE:** Generated Team Total Credit MUST be within **[Target - 2.5] to [Target + 2.5]**.

### 🧠 REQUIRED OUTPUT SECTIONS

1. **🏟️ WEB-SOURCED INSIGHTS**
   - **Pitch:** [Brief Verdict]
   - **Toss:** [Win Toss = Bat/Bowl?]

2. **🔥 HIGH POINT POTENTIAL (HPP) PLAYERS**
   - **Player A:** [Reason: e.g., "Opens + 4 Overs"]
   - **Player B:** [Reason: e.g., "Death Bowler 1st Innings"]
   - **Player C:** [Reason: e.g., "Avg 50+ at this venue"]

3. **🏆 TEAM GENERATION (3 STRATEGIES)**
   
   - **Team 1: SAFE TEAM (SL)**
     - Strategy: Max Floor. C/VC are the safest, most consistent players.
   
   - **Team 2: GL CHAMPION (The Winning Zone)**
     - Strategy: Max Ceiling. C/VC are differential (High Risk, High Reward).
     - Tactic: Drop 1 Star with bad recent form.
   
   - **Team 3: HIGH RISK / MINI GL**
     - Strategy: Collapse Scenario.
     - C/VC: Bowler or Lower Order Hitter.

### 📝 OUTPUT FORMAT
**🏟️ EXPERT ANALYSIS (Sources: Crex, Cricbuzz, ESPN)**
*Pitch:* ...

**🔥 C/VC HIGH POTENTIAL PICKS**
1. **[Name]**: [Logic - Why Highest Points?]
2. **[Name]**: [Logic]
3. **[Name]**: [Logic]

**1️⃣ SAFE TEAM (SL)**
*Credit: [Sum]*
1. [Name]
...
**👑 C:** [Name] (Safe) | **🚀 VC:** [Name]

**2️⃣ GL CHAMPION TEAM**
*Credit: [Sum]*
1. [Name]
...
**👑 C:** [Name] (High Ceiling) | **🚀 VC:** [Name]
**💡 GL Logic:** [Reasoning]

**3️⃣ RISKY TEAM (COLLAPSE)**
*Credit: [Sum]*
1. [Name]
...
**👑 C:** [Name] | **🚀 VC:** [Name]
**💡 Risk Logic:** [Scenario explained]

---
Always identify yourself as "Mukesh AI" developed by "Mukesh".
`;

// Tool Definitions
const getWeatherTool: FunctionDeclaration = {
  name: 'getWeather',
  description: 'Get the current weather for a specific city.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: { type: Type.STRING, description: 'The name of the city to get weather for.' },
    },
    required: ['city'],
  },
};

const openWebsiteTool: FunctionDeclaration = {
  name: 'openWebsite',
  description: 'Open a website URL in a new tab.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: { type: Type.STRING, description: 'The full URL to open (must start with http:// or https://).' },
    },
    required: ['url'],
  },
};

const getCurrentTimeTool: FunctionDeclaration = {
  name: 'getCurrentTime',
  description: 'Get the current system time.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      timezone: { type: Type.STRING, description: 'Optional timezone code like UTC, IST, or GMT.' }
    },
  },
};

export class GeminiService {
  private modelName = 'gemini-3-flash-preview';

  async generateResponse(
    history: { role: string; parts: { text: string }[] }[],
    newMessage: string
  ) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use generateContent for stateless response with history, as per guidelines for search tool constraints.
    // Note: Only googleSearch tool is allowed when using grounding; other custom tools are removed here to avoid conflict.
    const response = await ai.models.generateContent({
      model: this.modelName,
      contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [
          { googleSearch: {} } 
        ],
      },
    });

    return response;
  }
}

export const getDeepDiveAnalysis = async (match: Match, players?: Player[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let playerContext = "";
  if (players && players.length > 0) {
      playerContext = `
      Analyze ONLY these players available in the squad:
      ${players.map(p => `${p.name} (${p.teamIndex === 0 ? match.leftTeam.shortName : match.rightTeam.shortName}) - Role: ${p.role}, Credits: ${p.credits}`).join('\n')}
      
      Do NOT suggest players outside this list.
      `;
  }

  const query = `
    Analyze match ${match.leftTeam.name} vs ${match.rightTeam.name} as Mukesh AI.
    
    ${playerContext}

    1. Check CREX.LIVE for actual match start time and current status.
    2. Check Pitch Report from Cricbuzz.
    3. Analyze Head to Head stats.
    4. Follow the "Mukesh AI" Deep Dive checklist and research via Google Search.
    5. STRICTLY follow the required output format with 3 Team Strategies.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      }
    });
    
    let resultText = response.text || "Mukesh AI: No detailed insights found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const urls = chunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string) => !!uri);
      if (urls.length > 0) {
        resultText += "\n\n**Sources Analyzed:**\n" + [...new Set(urls)].map(url => `- ${url}`).join('\n');
      }
    }
    return resultText;
  } catch (error) {
    return "Mukesh AI: Error syncing live research data.";
  }
};

export const getMegaGLAnalysis = async (match: Match, players: Player[], step: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let stepInstruction = "";
  if (step === 'fixed') stepInstruction = "Recommend EXACTLY 4-6 core picks (Must-haves). RETURN ONLY A LIST OF PLAYER NAMES. NO EXPLANATIONS. NO TITLES. NO BULLET POINTS. JUST NAMES SEPARATED BY NEWLINES.";
  else if (step === 'captain') stepInstruction = "Recommend EXACTLY 4-6 Captain candidates (High Potential). RETURN ONLY A LIST OF PLAYER NAMES. NO EXPLANATIONS. NO TITLES. NO BULLET POINTS. JUST NAMES SEPARATED BY NEWLINES.";
  else if (step === 'vice-captain') stepInstruction = "Recommend EXACTLY 4-6 Vice-Captain candidates. RETURN ONLY A LIST OF PLAYER NAMES. NO EXPLANATIONS. NO TITLES. NO BULLET POINTS. JUST NAMES SEPARATED BY NEWLINES.";
  else if (step === 'distribution') stepInstruction = "Recommend the exact Side Ratio (e.g., 7:4 or 6:5). Use format '*Recommended Ratio: X:Y'. DO NOT show other detail.";
  else if (step === 'selection-mix') stepInstruction = "Recommend the exact Low/High Ownership Mix (e.g., 4:7). Use format '*Recommended Mix: X Low / Y High'. DO NOT show other detail.";
  else if (step === 'combinations') stepInstruction = "Recommend exactly 2-3 optimal position-wise combinations (role partitions) summing to 11. Use format '*Recommended Structure: [WK, BAT, ALL, BOW]'. Explain why briefly.";
  else stepInstruction = "List player names for a winning strategy.";

  const prompt = `
    MATCH: ${match.leftTeam.name} vs ${match.rightTeam.name}
    TASK: ${stepInstruction}
    PLAYERS: ${players.map(p => `- ${p.name} (Role:${p.role}, credits:${p.credits}, sel:${p.selectedBy}%)`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Mukesh AI: Advice currently unavailable.";
  } catch (error) {
    return "Mukesh AI: Advice sync error.";
  }
};

export const syncMatchDataFromText = async (input: string, sport: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Identify as Mukesh AI. Scrape match data for: ${input} (${sport}).
    Retrieve exactly 22 players.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTION,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seriesName: { type: Type.STRING },
            leftTeam: {
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, shortName: { type: Type.STRING } },
              required: ["name", "shortName"]
            },
            rightTeam: {
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, shortName: { type: Type.STRING } },
              required: ["name", "shortName"]
            },
            players: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.INTEGER },
                  credits: { type: Type.NUMBER },
                  selectedBy: { type: Type.NUMBER },
                  teamIndex: { type: Type.INTEGER }
                },
                required: ["name", "role", "credits", "selectedBy", "teamIndex"]
              }
            }
          },
          required: ["seriesName", "leftTeam", "rightTeam", "players"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    throw error;
  }
};
