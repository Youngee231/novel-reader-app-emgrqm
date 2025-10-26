
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { Repository } from '@/types/repository';
import { loadRepositories, loadReaderSettings, saveReaderSettings, saveReadingProgress, loadReadingProgress } from '@/utils/storage';
import { fetchFileContent } from '@/utils/repositoryParser';
import { translateText } from '@/utils/translation';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ReaderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDark = theme.dark;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [repository, setRepository] = useState<Repository | null>(null);
  const [content, setContent] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 16,
    lineHeight: 1.6,
    theme: 'light' as 'light' | 'dark' | 'sepia',
  });

  const loadData = useCallback(async () => {
    try {
      const repositories = await loadRepositories();
      const repo = repositories.find(r => r.id === params.repositoryId);
      
      if (!repo) {
        Alert.alert('Error', 'Repository not found');
        router.back();
        return;
      }
      
      setRepository(repo);
      
      const readerSettings = await loadReaderSettings();
      setSettings({
        fontSize: readerSettings.fontSize,
        lineHeight: readerSettings.lineHeight,
        theme: readerSettings.theme,
      });
      
      const fileContent = await fetchFileContent(repo, params.filePath as string);
      setContent(fileContent);
      
      console.log('Loaded file content, length:', fileContent.length);
      
      // Load reading progress
      const novelId = `${repo.id}-${params.filePath}`;
      const progress = await loadReadingProgress(novelId);
      
      if (progress && scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: progress.position, animated: false });
        }, 100);
      }
    } catch (error) {
      console.log('Error loading content:', error);
      Alert.alert('Error', 'Failed to load file content');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [params.repositoryId, params.filePath, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTranslate = async () => {
    if (!content) return;
    
    setTranslating(true);
    try {
      const translated = await translateText(content.substring(0, 5000), 'en', 'google');
      setTranslatedContent(translated);
      setShowTranslation(true);
      console.log('Translation completed');
    } catch (error) {
      console.log('Translation error:', error);
      Alert.alert('Error', 'Failed to translate content. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!repository) return;
    
    try {
      const novelId = `${repository.id}-${params.filePath}`;
      await saveReadingProgress({
        novelId,
        position: 0, // Would need to track scroll position
        totalLength: content.length,
        lastRead: Date.now(),
      });
      console.log('Reading progress saved');
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(32, settings.fontSize + delta));
    setSettings({ ...settings, fontSize: newSize });
  };

  const getThemeColors = () => {
    if (settings.theme === 'dark') {
      return { bg: '#1a1a1a', text: '#e0e0e0' };
    } else if (settings.theme === 'sepia') {
      return { bg: '#f4ecd8', text: '#5c4a3a' };
    }
    return { bg: '#ffffff', text: '#212121' };
  };

  const themeColors = getThemeColors();

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDark ? colors.text : colors.text }]}>
              Reading Settings
            </Text>
            <Pressable onPress={() => setShowSettings(false)}>
              <IconSymbol name="xmark" color={isDark ? colors.text : colors.text} size={24} />
            </Pressable>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.text }]}>
              Font Size
            </Text>
            <View style={styles.fontSizeControls}>
              <Pressable
                style={[styles.fontButton, { backgroundColor: isDark ? '#2c2c2c' : '#f0f0f0' }]}
                onPress={() => handleFontSizeChange(-2)}
              >
                <Text style={[styles.fontButtonText, { color: isDark ? colors.text : colors.text }]}>A-</Text>
              </Pressable>
              <Text style={[styles.fontSizeValue, { color: isDark ? colors.text : colors.text }]}>
                {settings.fontSize}
              </Text>
              <Pressable
                style={[styles.fontButton, { backgroundColor: isDark ? '#2c2c2c' : '#f0f0f0' }]}
                onPress={() => handleFontSizeChange(2)}
              >
                <Text style={[styles.fontButtonText, { color: isDark ? colors.text : colors.text }]}>A+</Text>
              </Pressable>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.text }]}>
              Theme
            </Text>
            <View style={styles.themeButtons}>
              {(['light', 'dark', 'sepia'] as const).map(themeOption => (
                <Pressable
                  key={themeOption}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: settings.theme === themeOption
                        ? (isDark ? colors.accent : colors.primary)
                        : (isDark ? '#2c2c2c' : '#f0f0f0')
                    }
                  ]}
                  onPress={() => setSettings({ ...settings, theme: themeOption })}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      {
                        color: settings.theme === themeOption
                          ? '#ffffff'
                          : (isDark ? colors.text : colors.text)
                      }
                    ]}
                  >
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <Pressable
            style={[styles.saveButton, { backgroundColor: isDark ? colors.accent : colors.primary }]}
            onPress={async () => {
              const readerSettings = await loadReaderSettings();
              await saveReaderSettings({
                ...readerSettings,
                fontSize: settings.fontSize,
                lineHeight: settings.lineHeight,
                theme: settings.theme,
              });
              setShowSettings(false);
            }}
          >
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: params.fileName as string || 'Reader',
          headerBackTitle: 'Back',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable
                onPress={() => setShowSettings(true)}
                style={styles.headerButton}
              >
                <IconSymbol name="textformat.size" color={isDark ? colors.accent : colors.primary} size={24} />
              </Pressable>
              <Pressable
                onPress={handleTranslate}
                style={styles.headerButton}
                disabled={translating}
              >
                {translating ? (
                  <ActivityIndicator size="small" color={isDark ? colors.accent : colors.primary} />
                ) : (
                  <IconSymbol name="globe" color={isDark ? colors.accent : colors.primary} size={24} />
                )}
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDark ? colors.accent : colors.primary} />
            <Text style={[styles.loadingText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
              Loading content...
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            onScroll={handleSaveProgress}
            scrollEventThrottle={1000}
          >
            <Animated.View entering={FadeIn.duration(500)}>
              <Text
                style={[
                  styles.content,
                  {
                    color: themeColors.text,
                    fontSize: settings.fontSize,
                    lineHeight: settings.fontSize * settings.lineHeight,
                  }
                ]}
              >
                {showTranslation && translatedContent ? translatedContent : content}
              </Text>
            </Animated.View>
          </ScrollView>
        )}
        
        {showTranslation && (
          <View style={[styles.translationBanner, { backgroundColor: isDark ? colors.accent : colors.primary }]}>
            <Text style={styles.translationBannerText}>Showing Translation</Text>
            <Pressable onPress={() => setShowTranslation(false)}>
              <Text style={styles.translationBannerButton}>Show Original</Text>
            </Pressable>
          </View>
        )}
      </View>
      
      {renderSettingsModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  content: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  translationBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  translationBannerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  translationBannerButton: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  settingRow: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  fontButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  fontSizeValue: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
