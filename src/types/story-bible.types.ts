export type StoryBibleSection =
  | 'overview'
  | 'episode-plan'
  | 'characters'
  | 'relationships'
  | 'timeline'
  | 'lore'
  | 'locations'
  | 'props'
  | 'wardrobe'
  | 'season-arc'
  | 'ending'
  | 'editor'
  | 'versions';

export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor';

export type RelationshipType =
  | 'ally'
  | 'rival'
  | 'family'
  | 'romantic'
  | 'mentor'
  | 'enemy';

export type StoryOverview = {
  projectId: string;
  logline: string;
  synopsis: string;
  themes: string[];
  tone: string;
  targetAudience: string;
  updatedAt: string;
};

export type StoryCharacter = {
  id: string;
  projectId: string;
  name: string;
  role: CharacterRole;
  description: string;
  motivation: string;
  backstory: string;
  visualNotes: string;
  voiceNotes?: string;
  imageUrl?: string;
  imagePromptHash?: string;
  imageGeneratedAt?: string;
};

export type CharacterRelationship = {
  id: string;
  projectId: string;
  fromCharacterId: string;
  toCharacterId: string;
  fromCharacterName: string;
  toCharacterName: string;
  type: RelationshipType;
  description: string;
};

export type TimelineEvent = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  episodeRef?: string;
  order: number;
  dateLabel: string;
};

export type LoreEntry = {
  id: string;
  projectId: string;
  title: string;
  category: string;
  content: string;
};

export type StoryLocation = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  significance: string;
  atmosphere: string;
};

export type StoryProp = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  ownerCharacterId?: string;
  ownerCharacterName?: string;
  sceneUsage: string;
};

export type WardrobeItem = {
  id: string;
  projectId: string;
  characterId: string;
  characterName: string;
  name: string;
  description: string;
  episodes: string;
  imageUrl?: string;
  imagePromptHash?: string;
  imageGeneratedAt?: string;
};

export type SeasonArcBeat = {
  id: string;
  projectId: string;
  act: number;
  title: string;
  description: string;
  episodeRange: string;
};

export type StoryEndingPlan = {
  projectId: string;
  finaleType: string;
  description: string;
  cliffhanger: string;
  sequelHook: string;
  updatedAt: string;
};

export type StoryComposerMeta = {
  totalPlannedEpisodes: number;
  batchSize: number;
  targetEpisodeRuntimeSec: number;
  plannedAt: string;
  lastBatchGeneratedAt?: string;
};

export type EpisodePlanEntry = {
  id: string;
  projectId: string;
  number: number;
  title: string;
  synopsis: string;
  cliffhanger?: string;
  actPhase: string;
  keyBeats: string[];
  generated: boolean;
};

export type StoryDocument = {
  projectId: string;
  content: string;
  format: 'markdown' | 'screenplay';
  updatedAt: string;
};

export type StoryVersion = {
  id: string;
  projectId: string;
  label: string;
  content: string;
  author: string;
  changeSummary: string;
  createdAt: string;
};

export type StoryBible = {
  overview: StoryOverview;
  characters: StoryCharacter[];
  relationships: CharacterRelationship[];
  timeline: TimelineEvent[];
  lore: LoreEntry[];
  locations: StoryLocation[];
  props: StoryProp[];
  wardrobe: WardrobeItem[];
  seasonArc: SeasonArcBeat[];
  ending: StoryEndingPlan;
  document: StoryDocument;
  episodePlan: EpisodePlanEntry[];
  composerMeta: StoryComposerMeta | null;
  versions: StoryVersion[];
};

export type UpdateStoryOverviewPayload = Omit<StoryOverview, 'projectId' | 'updatedAt'>;
export type UpsertStoryCharacterPayload = Omit<StoryCharacter, 'id' | 'projectId'>;
export type UpsertRelationshipPayload = Omit<
  CharacterRelationship,
  'id' | 'projectId' | 'fromCharacterName' | 'toCharacterName'
>;
export type UpsertTimelineEventPayload = Omit<TimelineEvent, 'id' | 'projectId'>;
export type UpsertLorePayload = Omit<LoreEntry, 'id' | 'projectId'>;
export type UpsertLocationPayload = Omit<StoryLocation, 'id' | 'projectId'>;
export type UpsertPropPayload = Omit<StoryProp, 'id' | 'projectId' | 'ownerCharacterName'>;
export type UpsertWardrobePayload = Omit<WardrobeItem, 'id' | 'projectId' | 'characterName'>;
export type UpsertSeasonArcPayload = Omit<SeasonArcBeat, 'id' | 'projectId'>;
export type UpdateStoryEndingPayload = Omit<StoryEndingPlan, 'projectId' | 'updatedAt'>;
export type UpdateStoryDocumentPayload = Pick<StoryDocument, 'content' | 'format'> & {
  extractEpisodes?: boolean;
  extractMode?: 'merge' | 'replace';
};

export type ExtractPreviewScene = {
  order: number;
  title: string;
  descriptionPreview: string;
  location?: string;
  characters: string[];
  durationSec: number;
  action: 'create' | 'update';
};

export type ExtractPreviewEpisode = {
  number: number;
  title: string;
  synopsis: string;
  cliffhanger?: string;
  sceneCount: number;
  action: 'create' | 'update';
  scenes: ExtractPreviewScene[];
};

export type ExtractEpisodesPreview = {
  detected: boolean;
  episodeCount: number;
  sceneCount: number;
  existingEpisodeCount: number;
  preamble?: string;
  episodes: ExtractPreviewEpisode[];
};

export type ExtractEpisodesResult = {
  mode: 'merge' | 'replace';
  episodesCreated: number;
  episodesUpdated: number;
  scenesCreated: number;
  scenesUpdated: number;
  episodes: import('./episode-planner.types').Episode[];
};

export type GenerateStoryVisualResult = {
  imageUrl: string;
  imagePromptHash: string;
  imageGeneratedAt: string;
  reused: boolean;
};
