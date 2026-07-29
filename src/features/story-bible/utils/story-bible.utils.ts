import { appConfig } from '@/config';
import type { StoryBibleSection } from '@/types';

export const STORY_BIBLE_SECTIONS: Array<{
  id: StoryBibleSection;
  label: string;
  description: string;
}> = [
  { id: 'overview', label: 'Overview', description: 'Logline, synopsis, and themes' },
  {
    id: 'episode-plan',
    label: 'Episode Plan',
    description: 'Full season plot from beginning to end',
  },
  { id: 'characters', label: 'Characters', description: 'Cast and character consistency' },
  { id: 'relationships', label: 'Relationships', description: 'Character dynamics' },
  { id: 'timeline', label: 'Timeline', description: 'Story chronology' },
  { id: 'lore', label: 'Lore', description: 'World rules and mythology' },
  { id: 'locations', label: 'Locations', description: 'Key settings' },
  { id: 'props', label: 'Props', description: 'Important objects' },
  { id: 'wardrobe', label: 'Wardrobe', description: 'Character looks' },
  { id: 'season-arc', label: 'Season Arc', description: 'Act structure' },
  { id: 'ending', label: 'Ending', description: 'Finale and hooks' },
  { id: 'editor', label: 'Story Editor', description: 'Draft and revise script' },
  { id: 'versions', label: 'Version History', description: 'Track story revisions' },
];

export function getStoryBiblePath(projectId: string, section: StoryBibleSection = 'overview') {
  return `/studio/projects/${projectId}/story-bible/${section}`;
}

export function parseThemesInput(value: string) {
  return value
    .split(',')
    .map((theme) => theme.trim())
    .filter(Boolean);
}

export function formatThemesOutput(themes: string[]) {
  return themes.join(', ');
}

export function getCharacterImageApiUrl(projectId: string, characterId: string) {
  return `${appConfig.api.baseUrl}/creator/projects/${projectId}/story-bible/characters/${characterId}/image`;
}

export function getWardrobeImageApiUrl(projectId: string, wardrobeId: string) {
  return `${appConfig.api.baseUrl}/creator/projects/${projectId}/story-bible/wardrobe/${wardrobeId}/image`;
}
