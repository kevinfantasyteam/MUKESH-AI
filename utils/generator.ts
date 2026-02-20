
import { Player, GeneratedTeam } from '../types';
import { FANTASY_COMBINATIONS, SIDE_DISTRIBUTIONS } from '../constants';

const getHashValue = (team: Player[], captainId: string, viceCaptainId: string): string => {
  const ids = team.map(p => p.id).sort().join('|');
  return `${ids}|C:${captainId}|VC:${viceCaptainId}`;
};

const getRandValue = (limit: number) => Math.floor(Math.random() * limit);

/**
 * MUKESH AI GENERATOR ENGINE
 */
export const generateLegacyTeams = (
  allPlayers: Player[],
  fixedIds: string[],
  captainPoolIds: string[],
  vcPoolIds: string[],
  teamCount: number,
  sportId: number,
  selectedSideIndices: number[],
  selectionMixes: [number, number][],
  customCombinations?: number[][],
  mode: 'sl' | 'gl' = 'gl'
): GeneratedTeam[] => {
  const teams: GeneratedTeam[] = [];
  const hashmap = new Set<string>();
  
  // Use custom combinations if provided, else fallback to defaults
  const combinations = customCombinations && customCombinations.length > 0 
    ? customCombinations 
    : (FANTASY_COMBINATIONS[sportId] || [[1, 3, 2, 5]]);

  const sideDistributions = SIDE_DISTRIBUTIONS[sportId] || [[7, 4], [6, 5], [5, 6], [4, 7]];
  const eligibleDistributions = selectedSideIndices.length > 0 
    ? sideDistributions.filter((_, idx) => selectedSideIndices.includes(idx))
    : (mode === 'sl' ? [sideDistributions[1]] : sideDistributions); 

  const fixedPlayers = allPlayers.filter(p => fixedIds.includes(p.id));
  const poolPlayers = allPlayers.filter(p => !fixedIds.includes(p.id));

  // User Formula: (Avg Credits of all 22 players * 11) +/- 2
  const allCreditsSum = allPlayers.reduce((sum, p) => sum + p.credits, 0);
  const avgCredit = allCreditsSum / allPlayers.length;
  const targetBudget = avgCredit * 11;
  const creditMargin = 2.5;

  if (mode === 'sl') {
      poolPlayers.sort((a, b) => b.selectedBy - a.selectedBy);
  }

  const fixedRoleCounts: Record<number, number> = {};
  let fixedTeam0 = 0;
  let fixedTeam1 = 0;
  
  fixedPlayers.forEach(p => {
    fixedRoleCounts[p.role] = (fixedRoleCounts[p.role] || 0) + 1;
    if (p.teamIndex === 0) fixedTeam0++; else fixedTeam1++;
  });

  let validStrategies = combinations.filter(comb => {
    return comb.every((totalAllowed, roleIdx) => (fixedRoleCounts[roleIdx] || 0) <= totalAllowed);
  });

  if (validStrategies.length === 0) {
      const dynamicComb = [0, 1, 2, 3].map(role => Math.max(fixedRoleCounts[role] || 0, 1));
      while (dynamicComb.reduce((a, b) => a + b, 0) < 11) dynamicComb[1]++; 
      validStrategies = [dynamicComb];
  }

  let totalAttempts = 0;
  const maxAttempts = 100000;
  
  const targetPerRatio = Math.ceil(teamCount / eligibleDistributions.length);

  for (const side of eligibleDistributions) {
    let sideGenerated = 0;
    let sideAttempts = 0;

    if (fixedTeam0 > side[0] || fixedTeam1 > side[1]) continue;

    while (sideGenerated < targetPerRatio && teams.length < teamCount && totalAttempts < maxAttempts) {
      totalAttempts++;
      sideAttempts++;

      const strategy = validStrategies[getRandValue(validStrategies.length)];
      const team: Player[] = [...fixedPlayers];
      
      const currentPool = [...poolPlayers];
      if (mode === 'gl') {
          currentPool.sort(() => 0.5 - Math.random());
      }

      for (const p of currentPool) {
          if (team.length >= 11) break;
          const roleCount = team.filter(tp => tp.role === p.role).length;
          const sideCount = team.filter(tp => tp.teamIndex === p.teamIndex).length;
          if (roleCount < strategy[p.role] && sideCount < (p.teamIndex === 0 ? side[0] : side[1])) {
              team.push(p);
          }
      }

      if (team.length === 11) {
          const totalCredits = team.reduce((s, p) => s + p.credits, 0);
          // Credit limit check: (avg*11) - 2 to (avg*11) + 2
          if (totalCredits <= targetBudget + creditMargin && totalCredits >= targetBudget - creditMargin) {
              
              const cPool = team.filter(p => captainPoolIds.length === 0 || captainPoolIds.includes(p.id));
              const vcPool = team.filter(p => vcPoolIds.length === 0 || vcPoolIds.includes(p.id));

              if (cPool.length > 0) {
                  const captain = mode === 'sl' 
                    ? cPool.sort((a,b) => b.selectedBy - a.selectedBy)[0]
                    : cPool[getRandValue(cPool.length)];

                  const vcEligible = vcPool.filter(p => p.id !== captain.id);
                  const viceCaptain = vcEligible.length > 0 
                    ? (mode === 'sl' ? vcEligible.sort((a,b) => b.selectedBy - a.selectedBy)[0] : vcEligible[getRandValue(vcEligible.length)])
                    : team.filter(p => p.id !== captain.id)[0];

                  if (viceCaptain) {
                      const hash = getHashValue(team, captain.id, viceCaptain.id);
                      if (!hashmap.has(hash)) {
                        hashmap.add(hash);
                        teams.push({
                          teamNumber: teams.length + 1,
                          credits: Number(totalCredits.toFixed(1)),
                          players: team,
                          captainId: captain.id,
                          viceCaptainId: viceCaptain.id
                        });
                        sideGenerated++;
                      }
                  }
              }
          }
      }
    }
  }

  return teams;
};
