
export type SportType = 'cricket' | 'football' | 'basketball' | 'kabaddi';

export interface Player {
  id: string;
  name: string;
  image: string;
  role: number;
  teamIndex: 0 | 1;
  credits: number;
  selectedBy: number;
  points: number;
  isPlaying: boolean;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

export interface GeneratedTeam {
  teamNumber: number;
  credits: number;
  players: Player[];
  captainId: string;
  viceCaptainId: string;
}

export interface MatchAttempt {
  id: string;
  matchId: string;
  timestamp: string;
  teams: GeneratedTeam[];
  settings: {
    teamCount: number;
    selectionMixes?: [number, number][];
    credits?: [number, number];
    mode?: 'sl' | 'gl';
    combinations?: number[][];
  };
}

export interface Match {
  id: string;
  seriesName: string;
  matchTime: string;
  leftTeam: {
    name: string;
    image: string;
    shortName: string;
  };
  rightTeam: {
    name: string;
    image: string;
    shortName: string;
  };
  sport: SportType;
  lineupOut: boolean;
  automatic: boolean;
  isExpert: boolean;
  isPrime: boolean;
  contestTag?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superuser' | 'customer';
  status: 'active' | 'inactive';
  createdAt: string;
  subscriptionDays: number;
  subscriptionEndDate: string;
}

export interface LegacyTeam {
  team_name: string;
  players: {
    player_name: string;
    player_role: number;
    player_credits: number;
    player_image: string | number;
    player_id: string | number;
  }[];
}

export interface LegacySeries {
  series_name: string;
  series_code: string;
  team_list: string[];
  teams: LegacyTeam[];
  sport: SportType;
}
