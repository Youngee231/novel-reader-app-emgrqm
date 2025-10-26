
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Repository, ReadingProgress, ReaderSettings } from '@/types/repository';

const REPOSITORIES_KEY = '@novel_app_repositories';
const READING_PROGRESS_KEY = '@novel_app_reading_progress';
const READER_SETTINGS_KEY = '@novel_app_reader_settings';

export async function saveRepositories(repositories: Repository[]): Promise<void> {
  try {
    await AsyncStorage.setItem(REPOSITORIES_KEY, JSON.stringify(repositories));
    console.log('Repositories saved successfully');
  } catch (error) {
    console.log('Error saving repositories:', error);
    throw error;
  }
}

export async function loadRepositories(): Promise<Repository[]> {
  try {
    const data = await AsyncStorage.getItem(REPOSITORIES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.log('Error loading repositories:', error);
    return [];
  }
}

export async function saveReadingProgress(progress: ReadingProgress): Promise<void> {
  try {
    const allProgress = await loadAllReadingProgress();
    const index = allProgress.findIndex(p => p.novelId === progress.novelId);
    
    if (index >= 0) {
      allProgress[index] = progress;
    } else {
      allProgress.push(progress);
    }
    
    await AsyncStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(allProgress));
    console.log('Reading progress saved successfully');
  } catch (error) {
    console.log('Error saving reading progress:', error);
    throw error;
  }
}

export async function loadReadingProgress(novelId: string): Promise<ReadingProgress | null> {
  try {
    const allProgress = await loadAllReadingProgress();
    return allProgress.find(p => p.novelId === novelId) || null;
  } catch (error) {
    console.log('Error loading reading progress:', error);
    return null;
  }
}

export async function loadAllReadingProgress(): Promise<ReadingProgress[]> {
  try {
    const data = await AsyncStorage.getItem(READING_PROGRESS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.log('Error loading all reading progress:', error);
    return [];
  }
}

export async function saveReaderSettings(settings: ReaderSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
    console.log('Reader settings saved successfully');
  } catch (error) {
    console.log('Error saving reader settings:', error);
    throw error;
  }
}

export async function loadReaderSettings(): Promise<ReaderSettings> {
  try {
    const data = await AsyncStorage.getItem(READER_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return getDefaultReaderSettings();
  } catch (error) {
    console.log('Error loading reader settings:', error);
    return getDefaultReaderSettings();
  }
}

function getDefaultReaderSettings(): ReaderSettings {
  return {
    fontSize: 16,
    fontFamily: 'System',
    lineHeight: 1.6,
    theme: 'light',
    translation: {
      enabled: false,
      service: 'google',
      targetLanguage: 'en',
      autoTranslate: false,
    },
  };
}
