export type ReligionProfile =
  | "catolico"
  | "evangelico"
  | "adventista"
  | "batista"
  | "pentecostal"
  | "comunidade_crista";

export type ReligionTerms = {
  institution: string;
  institutionPlural: string;
  publicPage: string;
  people: string;
  person: string;
  peopleDescription: string;
  smallGroups: string;
  mainGathering: string;
  contribution: string;
  contributionPlural: string;
  contributionCampaigns: string;
  leader: string;
  secretaryPortal: string;
};

export const RELIGION_PROFILES: Array<{
  id: ReligionProfile;
  label: string;
  description: string;
  locationLabel: string;
  defaultTypes: string[];
  terms: ReligionTerms;
}> = [
  {
    id: "catolico",
    label: "Católica",
    description: "Paróquias, capelas e comunidades católicas.",
    locationLabel: "Igrejas e capelas",
    defaultTypes: ["Missa", "Celebração", "Via-Sacra", "Vigília", "Ofício Divino", "Adoração ao Santíssimo"],
    terms: {
      institution: "paróquia",
      institutionPlural: "Paróquias e capelas",
      publicPage: "Página da paróquia",
      people: "Fiéis",
      person: "fiel",
      peopleDescription: "Cadastro de fiéis, agentes de pastoral e visitantes. Base para carteirinhas, documentos e catequese.",
      smallGroups: "Pastorais e grupos",
      mainGathering: "Missa",
      contribution: "contribuição",
      contributionPlural: "Contribuições",
      contributionCampaigns: "Campanhas & Contribuições",
      leader: "Pároco",
      secretaryPortal: "Secretaria Paroquial",
    },
  },
  {
    id: "evangelico",
    label: "Evangélica",
    description: "Igrejas e congregações evangélicas.",
    locationLabel: "Igrejas e congregações",
    defaultTypes: ["Culto", "Estudo Bíblico", "Reunião de Oração", "Louvor e Adoração", "Encontro de Jovens", "Círculo de Oração"],
    terms: {
      institution: "igreja",
      institutionPlural: "Igrejas e congregações",
      publicPage: "Página da igreja",
      people: "Membros",
      person: "membro",
      peopleDescription: "Cadastro de membros, líderes e visitantes. Base para carteirinhas, documentos e EBD.",
      smallGroups: "Células",
      mainGathering: "Culto",
      contribution: "dízimo",
      contributionPlural: "Dízimos",
      contributionCampaigns: "Campanhas & Dízimos",
      leader: "Pastor",
      secretaryPortal: "Portal da Secretaria",
    },
  },
  {
    id: "adventista",
    label: "Adventista",
    description: "Igrejas adventistas do sétimo dia.",
    locationLabel: "Igrejas",
    defaultTypes: ["Culto", "Escola Sabatina", "Culto Divino", "Vigília de Oração"],
    terms: {
      institution: "igreja",
      institutionPlural: "Igrejas",
      publicPage: "Página da igreja",
      people: "Membros",
      person: "membro",
      peopleDescription: "Cadastro de membros, líderes e visitantes. Base para carteirinhas, documentos e Escola Sabatina.",
      smallGroups: "Pequenos grupos",
      mainGathering: "Culto",
      contribution: "dízimo",
      contributionPlural: "Dízimos",
      contributionCampaigns: "Campanhas & Dízimos",
      leader: "Ancião",
      secretaryPortal: "Secretaria",
    },
  },
  {
    id: "batista",
    label: "Batista",
    description: "Igrejas batistas e congregações.",
    locationLabel: "Igrejas",
    defaultTypes: ["Culto", "Estudo Bíblico", "Reunião de Oração", "Culto de Celebração"],
    terms: {
      institution: "igreja",
      institutionPlural: "Igrejas",
      publicPage: "Página da igreja",
      people: "Membros",
      person: "membro",
      peopleDescription: "Cadastro de membros, líderes e visitantes. Base para carteirinhas, documentos e EBD.",
      smallGroups: "Pequenos grupos",
      mainGathering: "Culto",
      contribution: "contribuição",
      contributionPlural: "Contribuições",
      contributionCampaigns: "Campanhas & Contribuições",
      leader: "Pastor",
      secretaryPortal: "Secretaria",
    },
  },
  {
    id: "pentecostal",
    label: "Pentecostal",
    description: "Igrejas pentecostais e neopentecostais.",
    locationLabel: "Igrejas",
    defaultTypes: ["Culto", "Reunião de Oração", "Culto de Cura e Libertação", "Conferência", "Seminário"],
    terms: {
      institution: "igreja",
      institutionPlural: "Igrejas",
      publicPage: "Página da igreja",
      people: "Membros",
      person: "membro",
      peopleDescription: "Cadastro de membros, obreiros, líderes e visitantes. Base para carteirinhas, documentos e EBD.",
      smallGroups: "Células",
      mainGathering: "Culto",
      contribution: "dízimo",
      contributionPlural: "Dízimos",
      contributionCampaigns: "Campanhas & Dízimos",
      leader: "Pastor",
      secretaryPortal: "Secretaria",
    },
  },
  {
    id: "comunidade_crista",
    label: "Comunidade Cristã",
    description: "Comunidades e ministérios cristãos.",
    locationLabel: "Locais de encontro",
    defaultTypes: ["Culto", "Reunião de Oração", "Estudo Bíblico"],
    terms: {
      institution: "comunidade",
      institutionPlural: "Locais de encontro",
      publicPage: "Página da comunidade",
      people: "Participantes",
      person: "participante",
      peopleDescription: "Cadastro de participantes, líderes e visitantes. Base para carteirinhas, documentos e atividades.",
      smallGroups: "Grupos",
      mainGathering: "Encontro",
      contribution: "contribuição",
      contributionPlural: "Contribuições",
      contributionCampaigns: "Campanhas & Contribuições",
      leader: "Líder",
      secretaryPortal: "Secretaria",
    },
  },
];

export function getProfile(id?: ReligionProfile | string | null) {
  return RELIGION_PROFILES.find((p) => p.id === id) ?? RELIGION_PROFILES[0];
}

export function getReligionTerms(id?: ReligionProfile | string | null) {
  return getProfile(id).terms;
}
