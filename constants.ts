
import { Match, SportType, Promotion, Player } from './types';

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

export const PROMOTIONS: Promotion[] = [
    {
        "_id": "66d68e77ced8eca0a7ea38b6",
        "label": "Join Mukesh AI VIP",
        "imageUrl": "https://placehold.co/600x300/orange/white?text=MUKESH+AI+VIP+GROUP",
        "notificationUrl": "#",
        "urlType": 0,
        "order": 0,
        "active": true
    },
    {
        "_id": "65fc171a1d3a66040ee3559b",
        "label": "Mukesh AI Premium",
        "imageUrl": "https://placehold.co/600x300/black/orange?text=MUKESH+AI+PREMIUM",
        "notificationUrl": "/",
        "urlType": 1,
        "order": 1,
        "active": true
    },
    {
        "_id": "65fc17e11d3a66040ee3559c",
        "label": "Winning Strategy",
        "imageUrl": "https://placehold.co/600x300/green/white?text=WINNING+STRATEGY",
        "notificationUrl": "/",
        "urlType": 1,
        "order": 2,
        "active": true
    }
];

export const MOCK_MATCHES: Match[] = [
  {
    id: '112839',
    seriesName: 'IPL 2026',
    matchTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    leftTeam: { name: 'Chennai Super Kings', shortName: 'CSK', image: 'https://placehold.co/100x100?text=CSK' },
    rightTeam: { name: 'Mumbai Indians', shortName: 'MI', image: 'https://placehold.co/100x100?text=MI' },
    sport: 'cricket',
    lineupOut: true,
    automatic: true,
    isExpert: true,
    isPrime: true,
    contestTag: 'MEGA GL'
  },
  {
    id: '112840',
    seriesName: 'IPL 2026',
    matchTime: new Date(Date.now() + 3600000 * 24).toISOString(),
    leftTeam: { name: 'Royal Challengers Bangalore', shortName: 'RCB', image: 'https://placehold.co/100x100?text=RCB' },
    rightTeam: { name: 'Kolkata Knight Riders', shortName: 'KKR', image: 'https://placehold.co/100x100?text=KKR' },
    sport: 'cricket',
    lineupOut: false,
    automatic: true,
    isExpert: true,
    isPrime: true
  },
  {
    id: '112841',
    seriesName: 'IPL 2026',
    matchTime: new Date(Date.now() + 3600000 * 48).toISOString(),
    leftTeam: { name: 'Delhi Capitals', shortName: 'DC', image: 'https://placehold.co/100x100?text=DC' },
    rightTeam: { name: 'Rajasthan Royals', shortName: 'RR', image: 'https://placehold.co/100x100?text=RR' },
    sport: 'cricket',
    lineupOut: false,
    automatic: true,
    isExpert: true,
    isPrime: false
  },
  {
    id: '112842',
    seriesName: 'IPL 2026',
    matchTime: new Date(Date.now() + 3600000 * 72).toISOString(),
    leftTeam: { name: 'Sunrisers Hyderabad', shortName: 'SRH', image: 'https://placehold.co/100x100?text=SRH' },
    rightTeam: { name: 'Punjab Kings', shortName: 'PBKS', image: 'https://placehold.co/100x100?text=PBKS' },
    sport: 'cricket',
    lineupOut: false,
    automatic: true,
    isExpert: true,
    isPrime: false
  }
];

const generateSquad = (team1: string, team2: string): Player[] => {
    const players: Player[] = [];
    // Team 1
    for(let i=0; i<11; i++) {
        players.push({
            id: `p_${team1}_${i}`,
            name: `${team1} Player ${i+1}`,
            role: i < 2 ? 0 : i < 6 ? 1 : i < 8 ? 2 : 3,
            teamIndex: 0,
            credits: 7.5 + Math.random() * 3,
            selectedBy: Math.floor(Math.random() * 90) + 5,
            points: Math.floor(Math.random() * 100),
            isPlaying: true,
            image: `https://placehold.co/60x60?text=${team1.charAt(0)}${i+1}`
        });
    }
    // Team 2
    for(let i=0; i<11; i++) {
        players.push({
            id: `p_${team2}_${i}`,
            name: `${team2} Player ${i+1}`,
            role: i < 2 ? 0 : i < 6 ? 1 : i < 8 ? 2 : 3,
            teamIndex: 1,
            credits: 7.5 + Math.random() * 3,
            selectedBy: Math.floor(Math.random() * 90) + 5,
            points: Math.floor(Math.random() * 100),
            isPlaying: true,
            image: `https://placehold.co/60x60?text=${team2.charAt(0)}${i+1}`
        });
    }
    return players;
};

export const MOCK_PLAYERS: Record<string, Player[]> = {
  '112839': generateSquad('CSK', 'MI'),
  '112840': generateSquad('RCB', 'KKR'),
  '112841': generateSquad('DC', 'RR'),
  '112842': generateSquad('SRH', 'PBKS')
};
