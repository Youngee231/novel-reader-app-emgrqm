
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { loadRepositories, loadAllReadingProgress } from '@/utils/storage';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.dark;
  
  const [stats, setStats] = useState({
    repositories: 0,
    novelsRead: 0,
    totalReadingTime: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const repositories = await loadRepositories();
      const progress = await loadAllReadingProgress();
      
      setStats({
        repositories: repositories.length,
        novelsRead: progress.length,
        totalReadingTime: 0, // Would need to track actual reading time
      });
      
      console.log('Loaded stats:', { repositories: repositories.length, progress: progress.length });
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const renderStatCard = (icon: string, label: string, value: string | number, index: number) => (
    <Animated.View
      key={label}
      entering={FadeInDown.delay(index * 100).duration(500)}
      style={[
        styles.statCard,
        {
          backgroundColor: isDark ? '#1e1e1e' : colors.card,
          borderColor: isDark ? '#2c2c2c' : colors.border,
        }
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: isDark ? colors.accent : colors.primary }]}>
        <IconSymbol name={icon as any} color="#ffffff" size={28} />
      </View>
      <Text style={[styles.statValue, { color: isDark ? colors.text : colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
        {label}
      </Text>
    </Animated.View>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Profile',
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(500)}>
            <View style={styles.header}>
              <View style={[styles.avatar, { backgroundColor: isDark ? colors.accent : colors.primary }]}>
                <IconSymbol name="person.fill" color="#ffffff" size={48} />
              </View>
              <Text style={[styles.name, { color: isDark ? colors.text : colors.text }]}>
                Novel Reader
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                Keep reading and exploring!
              </Text>
            </View>
          </Animated.View>

          <View style={styles.statsContainer}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.text : colors.text }]}>
              Your Statistics
            </Text>
            <View style={styles.statsGrid}>
              {renderStatCard('folder.fill', 'Repositories', stats.repositories, 0)}
              {renderStatCard('book.fill', 'Novels Read', stats.novelsRead, 1)}
              {renderStatCard('clock.fill', 'Reading Time', `${stats.totalReadingTime}h`, 2)}
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.text : colors.text }]}>
              Quick Actions
            </Text>
            
            <Pressable
              style={[
                styles.actionCard,
                {
                  backgroundColor: isDark ? '#1e1e1e' : colors.card,
                  borderColor: isDark ? '#2c2c2c' : colors.border,
                }
              ]}
              onPress={() => router.push('/settings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? colors.accent : colors.primary }]}>
                <IconSymbol name="gear" color="#ffffff" size={24} />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: isDark ? colors.text : colors.text }]}>
                  Settings
                </Text>
                <Text style={[styles.actionDescription, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                  Configure translation and reading preferences
                </Text>
              </View>
              <IconSymbol name="chevron.right" color={isDark ? colors.textSecondary : colors.textSecondary} size={20} />
            </Pressable>

            <Pressable
              style={[
                styles.actionCard,
                {
                  backgroundColor: isDark ? '#1e1e1e' : colors.card,
                  borderColor: isDark ? '#2c2c2c' : colors.border,
                }
              ]}
              onPress={() => router.push('/add-repository')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? colors.secondary : colors.secondary }]}>
                <IconSymbol name="plus" color="#ffffff" size={24} />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: isDark ? colors.text : colors.text }]}>
                  Add Repository
                </Text>
                <Text style={[styles.actionDescription, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                  Add a new GitHub or GitLab repository
                </Text>
              </View>
              <IconSymbol name="chevron.right" color={isDark ? colors.textSecondary : colors.textSecondary} size={20} />
            </Pressable>
          </View>

          <View style={styles.infoContainer}>
            <View style={[styles.infoCard, { backgroundColor: isDark ? '#1e1e1e' : colors.card }]}>
              <IconSymbol name="info.circle.fill" color={isDark ? colors.accent : colors.primary} size={24} />
              <Text style={[styles.infoText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                This app allows you to read novels from GitHub and GitLab repositories with built-in translation support.
              </Text>
            </View>
          </View>
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
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 32,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
  },
  infoContainer: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
