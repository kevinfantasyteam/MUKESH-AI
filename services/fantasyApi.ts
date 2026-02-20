/**
 * Fantasy API Service for Dream11 Transfers and Match Data
 * Based on tg-ipl.shop integration provided.
 */

export interface FantasyAuthResponse {
  status: string;
  validToken: boolean;
  updateUiToken: boolean;
  message: string;
}

export interface FantasyMatchResponse {
  status: string;
  data: {
    _id: string;
    id: string;
    left_team_name: string;
    right_team_name: string;
    left_team_players: string[];
    right_team_players: string[];
    match_time: string;
    sport_index: number;
    automatic: boolean;
    toss: string;
  };
}

const BASE_URL = 'https://tg-ipl.shop/api/fantasy';

export const fantasyApi = {
  /**
   * Verifies the Dream11 Auth Token with the backend
   * Endpoint: /auth/verify
   */
  verifyAuth: async (authToken: string, matchId: string): Promise<FantasyAuthResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify({
          fantasyApp: "dream11",
          matchId: matchId,
          authToken: authToken // Expects the full stringified JSON token
        })
      });
      return await response.json();
    } catch (error) {
      console.error("Auth verification failed:", error);
      throw error;
    }
  },

  /**
   * Fetches match details from the external API using a Match ID
   * Endpoint: /match/:id
   */
  getMatchDetails: async (matchId: string): Promise<FantasyMatchResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/match/${matchId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch match details:", error);
      throw error;
    }
  },

  /**
   * Transfers a specific team to the fantasy platform
   * Endpoint: /team/transfer
   */
  transferTeam: async (authToken: string, matchId: string, teamData: any) => {
    try {
      const response = await fetch(`${BASE_URL}/team/transfer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify({
          fantasyApp: "dream11",
          matchId: matchId,
          authToken: authToken,
          team: teamData
        })
      });
      return await response.json();
    } catch (error) {
      console.error("Team transfer failed:", error);
      throw error;
    }
  }
};