export interface BadgeStats {
  sharedCount: number;
  borrowedCount: number;
  ecoScore: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: (s: BadgeStats) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'first_share',
    name: 'İlk Paylaşım',
    emoji: '🌱',
    description: 'İlk eşyanı başarıyla paylaştın',
    requirement: (s) => s.sharedCount >= 1,
  },
  {
    id: 'first_borrow',
    name: 'İlk Ödünç',
    emoji: '🤝',
    description: 'İlk kez bir eşya ödünç aldın',
    requirement: (s) => s.borrowedCount >= 1,
  },
  {
    id: 'eco_hero',
    name: 'Sürdürülebilirlik Kahramanı',
    emoji: '🦸',
    description: '5 başarılı paylaşım tamamladın',
    requirement: (s) => s.sharedCount >= 5,
  },
  {
    id: 'eco_100',
    name: 'Çevre Dostu',
    emoji: '🌍',
    description: '100 eco-puana ulaştın',
    requirement: (s) => s.ecoScore >= 100,
  },
  {
    id: 'neighborhood_star',
    name: 'Mahalle Yıldızı',
    emoji: '⭐',
    description: '10 başarılı işlem gerçekleştirdin',
    requirement: (s) => s.sharedCount + s.borrowedCount >= 10,
  },
];

export function earnedBadgeIds(stats: BadgeStats): string[] {
  return BADGES.filter((b) => b.requirement(stats)).map((b) => b.id);
}

export function getBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
