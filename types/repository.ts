
export interface Repository {
  id: string;
  name: string;
  url: string;
  type: 'github' | 'gitlab';
  owner: string;
  repo: string;
  branch: string;
  addedAt: number;
}

export interface NovelFile {
  id: string;
  name: string;
  path: string;
  repositoryId: string;
  size: number;
  extension: string;
}

export interface ReadingProgress {
  novelId: string;
  position: number;
  totalLength: number;
  lastRead: number;
}

export interface TranslationSettings {
  enabled: boolean;
  service: 'google' | 'kimi';
  targetLanguage: string;
  autoTranslate: boolean;
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
  translation: TranslationSettings;
}
