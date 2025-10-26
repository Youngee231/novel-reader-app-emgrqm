
import { Repository } from '@/types/repository';

export function parseRepositoryUrl(url: string): Partial<Repository> | null {
  try {
    // Remove trailing slash
    url = url.trim().replace(/\/$/, '');
    
    // GitHub pattern: https://github.com/owner/repo
    const githubMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (githubMatch) {
      return {
        type: 'github',
        owner: githubMatch[1],
        repo: githubMatch[2],
        url: url,
      };
    }
    
    // GitLab pattern: https://gitlab.com/owner/repo
    const gitlabMatch = url.match(/gitlab\.com\/([^\/]+)\/([^\/]+)/);
    if (gitlabMatch) {
      return {
        type: 'gitlab',
        owner: gitlabMatch[1],
        repo: gitlabMatch[2],
        url: url,
      };
    }
    
    return null;
  } catch (error) {
    console.log('Error parsing repository URL:', error);
    return null;
  }
}

export function generateRepositoryId(owner: string, repo: string, type: string): string {
  return `${type}-${owner}-${repo}-${Date.now()}`;
}

export async function fetchRepositoryContents(
  repository: Repository,
  path: string = ''
): Promise<any[]> {
  try {
    let apiUrl = '';
    
    if (repository.type === 'github') {
      apiUrl = `https://api.github.com/repos/${repository.owner}/${repository.repo}/contents/${path}`;
      if (repository.branch) {
        apiUrl += `?ref=${repository.branch}`;
      }
    } else if (repository.type === 'gitlab') {
      const encodedPath = encodeURIComponent(path);
      apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(
        `${repository.owner}/${repository.repo}`
      )}/repository/tree?path=${encodedPath}`;
      if (repository.branch) {
        apiUrl += `&ref=${repository.branch}`;
      }
    }
    
    console.log('Fetching repository contents from:', apiUrl);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching repository contents:', error);
    throw error;
  }
}

export async function fetchFileContent(
  repository: Repository,
  path: string
): Promise<string> {
  try {
    let apiUrl = '';
    
    if (repository.type === 'github') {
      // Use raw content URL for GitHub
      apiUrl = `https://raw.githubusercontent.com/${repository.owner}/${repository.repo}/${repository.branch || 'main'}/${path}`;
    } else if (repository.type === 'gitlab') {
      const encodedPath = encodeURIComponent(path);
      apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(
        `${repository.owner}/${repository.repo}`
      )}/repository/files/${encodedPath}/raw?ref=${repository.branch || 'main'}`;
    }
    
    console.log('Fetching file content from:', apiUrl);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    
    const content = await response.text();
    return content;
  } catch (error) {
    console.log('Error fetching file content:', error);
    throw error;
  }
}

export function isNovelFile(filename: string): boolean {
  const novelExtensions = ['.txt', '.md', '.epub', '.html', '.htm'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return novelExtensions.includes(ext);
}
