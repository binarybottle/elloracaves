export interface CaveGroup {
  virtualId: number;
  label: string;
  caveIds: number[];
  subLabels: Record<number, string>;
  tradition: 'Buddhist' | 'Hindu' | 'Jain';
  slug: string;
}

export const CAVE_GROUPS: CaveGroup[] = [
  {
    virtualId: 10000,
    label: 'Ganeshleni',
    caveIds: [10001, 10006, 10008, 10013, 10017],
    subLabels: {
      10001: 'Ganeshleni 1–5',
      10006: 'Ganeshleni 6–7',
      10008: 'Ganeshleni 8–12',
      10013: 'Ganeshleni 13–16',
      10017: 'Ganeshleni 17–19',
    },
    tradition: 'Buddhist',
    slug: 'ganeshleni',
  },
  {
    virtualId: 20000,
    label: 'Jogeshwari',
    caveIds: [20001, 20003],
    subLabels: {
      20001: 'Jogeshwari 1–2',
      20003: 'Jogeshwari 3–4',
    },
    tradition: 'Buddhist',
    slug: 'jogeshwari',
  },
];

export const CAVE_GROUP_BY_VIRTUAL_ID: Record<number, CaveGroup> = Object.fromEntries(
  CAVE_GROUPS.map(g => [g.virtualId, g])
);

export const CAVE_GROUP_BY_SLUG: Record<string, CaveGroup> = Object.fromEntries(
  CAVE_GROUPS.map(g => [g.slug, g])
);

export function isGroupVirtualId(id: number): boolean {
  return id in CAVE_GROUP_BY_VIRTUAL_ID;
}
