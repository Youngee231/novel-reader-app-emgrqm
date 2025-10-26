
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Repository } from '@/types/repository';
import { loadRepositories } from '@/utils/storage';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isDark = theme.dark;

  const loadData = useCallback(async () => {
    try {
      const repos = await loadRepositories();
      setRepositories(repos);
      console.log('Loaded repositories:', repos.length);
    } catch (error) {
      console.log('Error loading repositories:', error);
      Alert.alert('Error', 'Failed to load repositories');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleAddRepository = () => {
    router.push('/add-repository');
  };

  const handleRepositoryPress = (repository: Repository) => {
    router.push({
      pathname: '/browse-repository',
      params: { repositoryId: repository.id },
    });
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={handleAddRepository}
      style={styles.headerButton}
    >
      <IconSymbol name="plus" color={isDark ? colors.accent : colors.primary} size={24} />
    </Pressable>
  );

  const renderHeaderLeft = () => (
    <Pressable
      onPress={() => router.push('/settings')}
      style={styles.headerButton}
    >
      <IconSymbol name="gear" color={isDark ? colors.accent : colors.primary} size={24} />
    </Pressable>
  );

  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeInUp.duration(600)}
      style={styles.emptyContainer}
    >
      <IconSymbol 
        name="book.fill" 
        color={isDark ? colors.accent : colors.primary} 
        size={80} 
      />
      <Text style={[styles.emptyTitle, { color: isDark ? colors.text : colors.text }]}>
        No Repositories Yet
      </Text>
      <Text style={[styles.emptyText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
        Add a GitHub or GitLab repository to start reading novels
      </Text>
      <Pressable
        style={[styles.addButton, { backgroundColor: isDark ? colors.accent : colors.primary }]}
        onPress={handleAddRepository}
      >
        <IconSymbol name="plus" color="#ffffff" size={20} />
        <Text style={styles.addButtonText}>Add Repository</Text>
      </Pressable>
    </Animated.View>
  );

  const renderRepository = (repository: Repository, index: number) => (
    <Animated.View
      key={repository.id}
      entering={FadeInDown.delay(index * 100).duration(500)}
    >
      <Pressable
        style={[
          styles.repoCard,
          { 
            backgroundColor: isDark ? '#1e1e1e' : colors.card,
            borderColor: isDark ? '#2c2c2c' : colors.border,
          }
        ]}
        onPress={() => handleRepositoryPress(repository)}
      >
        <View style={styles.repoIconContainer}>
          <View style={[
            styles.repoIcon,
            { backgroundColor: repository.type === 'github' ? '#6200ee' : '#fc6d26' }
          ]}>
            <IconSymbol 
              name={repository.type === 'github' ? 'chevron.left.forwardslash.chevron.right' : 'folder.fill'} 
              color="#ffffff" 
              size={24} 
            />
          </View>
        </View>
        
        <View style={styles.repoContent}>
          <Text style={[styles.repoName, { color: isDark ? colors.text : colors.text }]}>
            {repository.name}
          </Text>
          <Text style={[styles.repoOwner, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
            {repository.owner}/{repository.repo}
          </Text>
          <View style={styles.repoMeta}>
            <View style={[styles.repoBadge, { backgroundColor: isDark ? '#2c2c2c' : '#f0f0f0' }]}>
              <Text style={[styles.repoBadgeText, { color: isDark ? colors.accent : colors.primary }]}>
                {repository.type.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.repoDate, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
              Added {new Date(repository.addedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <IconSymbol 
          name="chevron.right" 
          color={isDark ? colors.textSecondary : colors.textSecondary} 
          size={20} 
        />
      </Pressable>
    </Animated.View>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Novel Reader',
            headerRight: renderHeaderRight,
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            repositories.length === 0 && styles.scrollContentCentered,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {repositories.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text : colors.text }]}>
                  My Repositories
                </Text>
                <Text style={[styles.headerSubtitle, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                  {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'}
                </Text>
              </View>
              {repositories.map((repo, index) => renderRepository(repo, index))}
            </>
          )}
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
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  headerButton: {
    padding: 8,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  repoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  repoIconContainer: {
    marginRight: 16,
  },
  repoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repoContent: {
    flex: 1,
  },
  repoName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  repoOwner: {
    fontSize: 14,
    marginBottom: 8,
  },
  repoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  repoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  repoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  repoDate: {
    fontSize: 12,
  },
});
