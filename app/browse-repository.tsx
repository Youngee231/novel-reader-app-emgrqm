
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { Repository } from '@/types/repository';
import { loadRepositories } from '@/utils/storage';
import { fetchRepositoryContents, isNovelFile } from '@/utils/repositoryParser';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
}

export default function BrowseRepositoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDark = theme.dark;
  
  const [repository, setRepository] = useState<Repository | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [pathHistory, setPathHistory] = useState<string[]>(['']);

  useEffect(() => {
    loadRepository();
  }, []);

  useEffect(() => {
    if (repository) {
      loadFiles(currentPath);
    }
  }, [repository, currentPath]);

  const loadRepository = async () => {
    try {
      const repositories = await loadRepositories();
      const repo = repositories.find(r => r.id === params.repositoryId);
      
      if (repo) {
        setRepository(repo);
        console.log('Loaded repository:', repo);
      } else {
        Alert.alert('Error', 'Repository not found');
        router.back();
      }
    } catch (error) {
      console.log('Error loading repository:', error);
      Alert.alert('Error', 'Failed to load repository');
      router.back();
    }
  };

  const loadFiles = async (path: string) => {
    if (!repository) return;
    
    setLoading(true);
    try {
      const contents = await fetchRepositoryContents(repository, path);
      
      const fileItems: FileItem[] = contents.map((item: any) => {
        if (repository.type === 'github') {
          return {
            name: item.name,
            path: item.path,
            type: item.type === 'dir' ? 'dir' : 'file',
            size: item.size,
          };
        } else {
          // GitLab format
          return {
            name: item.name,
            path: item.path,
            type: item.type === 'tree' ? 'dir' : 'file',
            size: 0,
          };
        }
      });
      
      // Sort: directories first, then files
      fileItems.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'dir' ? -1 : 1;
      });
      
      setFiles(fileItems);
      console.log('Loaded files:', fileItems.length);
    } catch (error) {
      console.log('Error loading files:', error);
      Alert.alert('Error', 'Failed to load repository contents');
    } finally {
      setLoading(false);
    }
  };

  const handleFilePress = (file: FileItem) => {
    if (file.type === 'dir') {
      setPathHistory([...pathHistory, file.path]);
      setCurrentPath(file.path);
    } else if (isNovelFile(file.name)) {
      router.push({
        pathname: '/reader',
        params: {
          repositoryId: repository?.id,
          filePath: file.path,
          fileName: file.name,
        },
      });
    } else {
      Alert.alert('Unsupported File', 'This file type is not supported for reading.');
    }
  };

  const handleBackPress = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      newHistory.pop();
      const previousPath = newHistory[newHistory.length - 1];
      setPathHistory(newHistory);
      setCurrentPath(previousPath);
    } else {
      router.back();
    }
  };

  const renderFile = (file: FileItem, index: number) => {
    const isNovel = file.type === 'file' && isNovelFile(file.name);
    
    return (
      <Animated.View
        key={file.path}
        entering={FadeInDown.delay(index * 50).duration(400)}
      >
        <Pressable
          style={[
            styles.fileCard,
            {
              backgroundColor: isDark ? '#1e1e1e' : colors.card,
              borderColor: isDark ? '#2c2c2c' : colors.border,
            }
          ]}
          onPress={() => handleFilePress(file)}
        >
          <View style={[
            styles.fileIcon,
            {
              backgroundColor: file.type === 'dir' 
                ? (isDark ? colors.accent : colors.primary)
                : isNovel
                ? (isDark ? colors.secondary : colors.highlight)
                : (isDark ? '#2c2c2c' : '#e0e0e0')
            }
          ]}>
            <IconSymbol
              name={file.type === 'dir' ? 'folder.fill' : isNovel ? 'book.fill' : 'doc.fill'}
              color="#ffffff"
              size={24}
            />
          </View>
          
          <View style={styles.fileContent}>
            <Text style={[styles.fileName, { color: isDark ? colors.text : colors.text }]}>
              {file.name}
            </Text>
            {file.type === 'file' && file.size !== undefined && (
              <Text style={[styles.fileSize, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                {formatFileSize(file.size)}
              </Text>
            )}
          </View>
          
          <IconSymbol
            name="chevron.right"
            color={isDark ? colors.textSecondary : colors.textSecondary}
            size={20}
          />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: repository?.name || 'Browse',
          headerBackTitle: 'Back',
        }}
      />
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        {currentPath !== '' && (
          <View style={[styles.breadcrumb, { backgroundColor: isDark ? '#1e1e1e' : colors.card }]}>
            <Pressable onPress={handleBackPress} style={styles.breadcrumbButton}>
              <IconSymbol name="chevron.left" color={isDark ? colors.accent : colors.primary} size={20} />
              <Text style={[styles.breadcrumbText, { color: isDark ? colors.accent : colors.primary }]}>
                Back
              </Text>
            </Pressable>
            <Text style={[styles.currentPath, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
              /{currentPath}
            </Text>
          </View>
        )}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDark ? colors.accent : colors.primary} />
            <Text style={[styles.loadingText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
              Loading files...
            </Text>
          </View>
        ) : files.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="folder" color={isDark ? colors.textSecondary : colors.textSecondary} size={64} />
            <Text style={[styles.emptyText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
              No files found
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {files.map((file, index) => renderFile(file, index))}
          </ScrollView>
        )}
      </View>
    </>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  breadcrumbButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  breadcrumbText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  currentPath: {
    fontSize: 14,
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fileContent: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 13,
  },
});
