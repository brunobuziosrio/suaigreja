export type ReligionProfile =
  | "catolico"
  | "evangelico"
  | "adventista"
  | "batista"
  | "pentecostal"
  | "comunidade_crista";

export const RELIGION_PROFILES: Array<{
  id: ReligionProfile;
  label: string;
  description: string;
  locationLabel: string;
  defaultTypes: string[];
}> = [
  {
    id: "catolico",
    label: "Católica",
    description: "Paróquias, capelas e comunidades católicas.",
    locationLabel: "Igrejas e capelas",
    defaultTypes: ["Missa", "Celebração", "Via-Sacra", "Vigília", "Ofício Divino", "Adoração ao Santíssimo"],
  },
  {
    id: "evangelico",
    label: "Evangélica",
    description: "Igrejas e congregações evangélicas.",
    locationLabel: "Igrejas e congregações",
    defaultTypes: ["Culto", "Estudo Bíblico", "Reunião de Oração", "Louvor e Adoração", "Encontro de Jovens", "Círculo de Oração"],
  },
  {
    id: "adventista",
    label: "Adventista",
    description: "Igrejas adventistas do sétimo dia.",
    locationLabel: "Igrejas",
    defaultTypes: ["Culto", "Escola Sabatina", "Culto Divino", "Vigília de Oração"],
  },
  {
    id: "batista",
    label: "Batista",
    description: "Igrejas batistas e congregações.",
    locationLabel: "Igrejas",
    defaultTypes: ["Culto", "Estudo Bíblico", "Reunião de Oração", "Culto de Celebração"],
  },
  {
    id: "pentecostal",
    label: "Pentecostal",
    description: "Igrejas pentecostais e neopentecostais.",
    locationLabel: "Igrejas",
    defaultTypes: ["Culto", "Reunião de Oração", "Culto de Cura e Libertação", "Conferência", "Seminário"],
  },
  {
    id: "comunidade_crista",
    label: "Comunidade Cristã",
    description: "Comunidades e ministérios cristãos.",
    locationLabel: "Locais de encontro",
    defaultTypes: ["Culto", "Reunião de Oração", "Estudo Bíblico"],
  },
];

export function getProfile(id: ReligionProfile) {
  return RELIGION_PROFILES.find((p) => p.id === id) ?? RELIGION_PROFILES[0];
}