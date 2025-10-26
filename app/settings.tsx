
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { loadReaderSettings, saveReaderSettings, loadRepositories, saveRepositories } from '@/utils/storage';
import { ReaderSettings } from '@/types/repository';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.dark;
  
  const [settings, setSettings] = useState<ReaderSettings | null>(null);
  const [repositoryCount, setRepositoryCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const readerSettings = await loadReaderSettings();
      setSettings(readerSettings);
      
      const repositories = await loadRepositories();
      setRepositoryCount(repositories.length);
      
      console.log('Loaded settings:', readerSettings);
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const handleToggleTranslation = async (value: boolean) => {
    if (!settings) return;
    
    const newSettings = {
      ...settings,
      translation: {
        ...settings.translation,
        enabled: value,
      },
    };
    
    setSettings(newSettings);
    await saveReaderSettings(newSettings);
  };

  const handleToggleAutoTranslate = async (value: boolean) => {
    if (!settings) return;
    
    const newSettings = {
      ...settings,
      translation: {
        ...settings.translation,
        autoTranslate: value,
      },
    };
    
    setSettings(newSettings);
    await saveReaderSettings(newSettings);
  };

  const handleChangeTranslationService = async (service: 'google' | 'kimi') => {
    if (!settings) return;
    
    const newSettings = {
      ...settings,
      translation: {
        ...settings.translation,
        service,
      },
    };
    
    setSettings(newSettings);
    await saveReaderSettings(newSettings);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all repositories and settings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await saveRepositories([]);
              setRepositoryCount(0);
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.log('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  if (!settings) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <Text style={[styles.loadingText, { color: isDark ? colors.text : colors.text }]}>
          Loading settings...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(500)}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text : colors.text }]}>
                Translation
              </Text>
              
              <View style={[styles.settingCard, { backgroundColor: isDark ? '#1e1e1e' : colors.card }]}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.text }]}>
                      Enable Translation
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                      Allow translating novel content
                    </Text>
                  </View>
                  <Switch
                    value={settings.translation.enabled}
                    onValueChange={handleToggleTranslation}
                    trackColor={{ false: '#767577', true: isDark ? colors.accent : colors.primary }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>
              
              {settings.translation.enabled && (
                <>
                  <View style={[styles.settingCard, { backgroundColor: isDark ? '#1e1e1e' : colors.card }]}>
                    <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.text }]}>
                      Translation Service
                    </Text>
                    <View style={styles.serviceButtons}>
                      <Pressable
                        style={[
                          styles.serviceButton,
                          {
                            backgroundColor: settings.translation.service === 'google'
                              ? (isDark ? colors.accent : colors.primary)
                              : (isDark ? '#2c2c2c' : '#f0f0f0')
                          }
                        ]}
                        onPress={() => handleChangeTranslationService('google')}
                      >
                        <Text
                          style={[
                            styles.serviceButtonText,
                            {
                              color: settings.translation.service === 'google'
                                ? '#ffffff'
                                : (isDark ? colors.text : colors.text)
                            }
                          ]}
                        >
                          Google Translate
                        </Text>
                      </Pressable>
                      
                      <Pressable
                        style={[
                          styles.serviceButton,
                          {
                            backgroundColor: settings.translation.service === 'kimi'
                              ? (isDark ? colors.accent : colors.primary)
                              : (isDark ? '#2c2c2c' : '#f0f0f0')
                          }
                        ]}
                        onPress={() => handleChangeTranslationService('kimi')}
                      >
                        <Text
                          style={[
                            styles.serviceButtonText,
                            {
                              color: settings.translation.service === 'kimi'
                                ? '#ffffff'
                                : (isDark ? colors.text : colors.text)
                            }
                          ]}
                        >
                          Kimi AI
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  
                  <View style={[styles.settingCard, { backgroundColor: isDark ? '#1e1e1e' : colors.card }]}>
                    <View style={styles.settingRow}>
                      <View style={styles.settingInfo}>
                        <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.text }]}>
                          Auto-Translate
                        </Text>
                        <Text style={[styles.settingDescription, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                          Automatically translate when opening files
                        </Text>
                      </View>
                      <Switch
                        value={settings.translation.autoTranslate}
                        onValueChange={handleToggleAutoTranslate}
                        trackColor={{ false: '#767577', true: isDark ? colors.accent : colors.primary }}
                        thumbColor="#ffffff"
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text : colors.text }]}>
                Data
              </Text>
              
              <View style={[styles.settingCard, { backgroundColor: isDark ? '#1e1e1e' : colors.card }]}>
                <View style={styles.dataRow}>
                  <IconSymbol name="folder.fill" color={isDark ? colors.accent : colors.primary} size={24} />
                  <View style={styles.dataInfo}>
                    <Text style={[styles.dataLabel, { color: isDark ? colors.text : colors.text }]}>
                      Repositories
                    </Text>
                    <Text style={[styles.dataValue, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                      {repositoryCount} {repositoryCount === 1 ? 'repository' : 'repositories'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Pressable
                style={[styles.dangerButton, { borderColor: colors.error }]}
                onPress={handleClearAllData}
              >
                <IconSymbol name="trash" color={colors.error} size={20} />
                <Text style={[styles.dangerButtonText, { color: colors.error }]}>
                  Clear All Data
                </Text>
              </Pressable>
            </View>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text : colors.text }]}>
                About
              </Text>
              
              <View style={[styles.settingCard, { backgroundColor: isDark ? '#1e1e1e' : colors.card }]}>
                <Text style={[styles.aboutText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                  Novel Reader App v1.0.0
                </Text>
                <Text style={[styles.aboutText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                  Read novels from GitHub and GitLab repositories with translation support.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  serviceButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  serviceButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  serviceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dataInfo: {
    flex: 1,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 14,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
});
