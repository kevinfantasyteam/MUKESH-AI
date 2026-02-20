
import { Match, SportType } from './types';

export const PRIMARY_COLOR = '#ea580c';

export const SPORT_TABS: { label: string; value: SportType; icon: string }[] = [
  { label: 'Cricket', value: 'cricket', icon: '🏏' },
  { label: 'Football', value: 'football', icon: '⚽' },
  { label: 'Basketball', value: 'basketball', icon: '🏀' },
  { label: 'Kabaddi', value: 'kabaddi', icon: '🤼' },
];

export const ROLE_LABELS: Record<SportType, string[]> = {
  cricket: ['WK', 'BAT', 'AL', 'BOWL'],
  football: ['GK', 'DEF', 'MID', 'ST'],
  basketball: ['PG', 'SG', 'SF', 'PF', 'CE'],
  kabaddi: ['DEF', 'AL', 'RAID'],
};

export const ROLE_HEADERS = {
    cricket: ['', 'WK', 'BAT', 'AL', 'BOWL'],
    football: ['', 'GK', 'DEF', 'MID', 'ST'],
    basketball: ['', 'PG', 'SG', 'SF', 'PF', 'CE']
};

export const OLD_COMBINATIONS = [
  [1,3,2,5],[1,3,3,4],[1,4,3,3],[1,4,2,4],[1,4,1,5],[1,3,1,6],[1,3,4,3],
  [2,3,3,3],[2,3,2,4],[2,3,1,5],[2,4,2,3],[2,4,1,4],[2,5,1,3],
  [3,3,2,3],[3,4,1,3],[3,3,1,4],[3,3,1,4]
];

export const NEW_COMBINATIONS = [
  [1,1,4,5],[1,1,5,4],[1,2,3,5],[1,2,4,4],[1,2,5,3],[1,3,5,2],[1,4,4,2],[1,4,5,1],
  [2,1,3,5],[2,1,4,4],[2,1,5,3],[2,2,2,5],[2,2,3,4],[2,2,4,3],[2,2,5,2],[2,3,4,2]
];

export const FANTASY_COMBINATIONS: Record<number, number[][]> = {
  0: [...OLD_COMBINATIONS, ...NEW_COMBINATIONS],
  1: [[1,4,5,1],[1,5,4,1],[1,5,3,2],[1,4,4,2],[1,3,4,3],[1,4,3,3]],
  2: [[1,1,1,1,4],[1,1,1,2,3],[1,1,1,3,2],[1,1,1,4,1],[1,1,2,1,3],[1,1,2,2,2]]
};

export const SIDE_DISTRIBUTIONS: Record<number, number[][]> = {
  0: [[3, 8], [4, 7], [5, 6], [6, 5], [7, 4], [8, 3]], 
  1: [[3, 8], [4, 7], [5, 6], [6, 5], [7, 4], [8, 3]], 
  2: [[3, 5], [4, 4], [5, 3]],         
};

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    seriesName: 'India vs Australia ODI',
    matchTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    leftTeam: { name: 'India', shortName: 'IND', image: 'https://picsum.photos/id/10/100/100' },
    rightTeam: { name: 'Australia', shortName: 'AUS', image: 'https://picsum.photos/id/11/100/100' },
    sport: 'cricket',
    lineupOut: true,
    automatic: true,
    isExpert: true,
    isPrime: true
  }
];

export const MOCK_PLAYERS: Record<string, any> = {
  m1: Array.from({ length: 22 }).map((_, i) => ({
    id: `p${i + 1}`,
    name: i < 11 ? `IND Player ${i + 1}` : `AUS Player ${i - 10}`,
    role: i < 4 ? 0 : i < 10 ? 1 : i < 16 ? 2 : 3,
    teamIndex: i < 11 ? 0 : 1,
    credits: 8 + Math.random() * 2.5,
    selectedBy: Math.floor(Math.random() * 90) + 5,
    points: 0,
    isPlaying: true,
    image: `https://picsum.photos/id/${100 + i}/60/60`
  }))
};
