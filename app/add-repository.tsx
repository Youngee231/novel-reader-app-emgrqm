
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { Repository } from '@/types/repository';
import { parseRepositoryUrl, generateRepositoryId } from '@/utils/repositoryParser';
import { loadRepositories, saveRepositories } from '@/utils/storage';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AddRepositoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.dark;
  
  const [url, setUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);

  const handleAddRepository = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a repository URL');
      return;
    }

    setLoading(true);
    
    try {
      const parsed = parseRepositoryUrl(url);
      
      if (!parsed || !parsed.owner || !parsed.repo || !parsed.type) {
        Alert.alert('Error', 'Invalid repository URL. Please enter a valid GitHub or GitLab URL.');
        setLoading(false);
        return;
      }

      const repositories = await loadRepositories();
      
      // Check if repository already exists
      const exists = repositories.some(
        r => r.owner === parsed.owner && r.repo === parsed.repo && r.type === parsed.type
      );
      
      if (exists) {
        Alert.alert('Error', 'This repository has already been added.');
        setLoading(false);
        return;
      }

      const newRepository: Repository = {
        id: generateRepositoryId(parsed.owner, parsed.repo, parsed.type),
        name: parsed.repo,
        url: parsed.url || url,
        type: parsed.type,
        owner: parsed.owner,
        repo: parsed.repo,
        branch: branch || 'main',
        addedAt: Date.now(),
      };

      repositories.push(newRepository);
      await saveRepositories(repositories);
      
      console.log('Repository added successfully:', newRepository);
      Alert.alert('Success', 'Repository added successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log('Error adding repository:', error);
      Alert.alert('Error', 'Failed to add repository. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Repository',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(500)}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.accent : colors.primary }]}>
                <IconSymbol name="plus.circle.fill" color="#ffffff" size={48} />
              </View>
            </View>

            <Text style={[styles.title, { color: isDark ? colors.text : colors.text }]}>
              Add New Repository
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
              Enter the URL of a GitHub or GitLab repository containing novels
            </Text>

            <View style={styles.form}>
              <Text style={[styles.label, { color: isDark ? colors.text : colors.text }]}>
                Repository URL *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1e1e1e' : colors.card,
                    borderColor: isDark ? '#2c2c2c' : colors.border,
                    color: isDark ? colors.text : colors.text,
                  }
                ]}
                placeholder="https://github.com/username/repo"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <Text style={[styles.label, { color: isDark ? colors.text : colors.text }]}>
                Branch (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1e1e1e' : colors.card,
                    borderColor: isDark ? '#2c2c2c' : colors.border,
                    color: isDark ? colors.text : colors.text,
                  }
                ]}
                placeholder="main"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={branch}
                onChangeText={setBranch}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.examplesContainer}>
                <Text style={[styles.examplesTitle, { color: isDark ? colors.text : colors.text }]}>
                  Examples:
                </Text>
                <Text style={[styles.exampleText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                  - https://github.com/username/novels
                </Text>
                <Text style={[styles.exampleText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
                  - https://gitlab.com/username/books
                </Text>
              </View>

              <Pressable
                style={[
                  styles.addButton,
                  { backgroundColor: isDark ? colors.accent : colors.primary },
                  loading && styles.addButtonDisabled,
                ]}
                onPress={handleAddRepository}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <IconSymbol name="plus" color="#ffffff" size={20} />
                    <Text style={styles.addButtonText}>Add Repository</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.cancelButton, { borderColor: isDark ? '#2c2c2c' : colors.border }]}
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: isDark ? colors.text : colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  examplesContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
