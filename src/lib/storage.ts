import { Content, Movie, Series, VideoLinks } from '@/types';

const STORAGE_KEY = 'streamvault_content';
const AUTH_KEY = 'streamvault_auth';

export const getContent = (): Content[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveContent = (content: Content[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
};

export const addContent = (newContent: Content): void => {
  const content = getContent();
  const existingIndex = content.findIndex(
    (c) => c.id === newContent.id && c.type === newContent.type
  );
  
  if (existingIndex >= 0) {
    content[existingIndex] = newContent;
  } else {
    content.push(newContent);
  }
  
  saveContent(content);
};

export const updateMovieLinks = (title: string, links: VideoLinks): boolean => {
  const content = getContent();
  const movie = content.find(
    (c) => c.type === 'movie' && c.title.toLowerCase() === title.toLowerCase()
  ) as Movie | undefined;
  
  if (movie) {
    movie.links = { ...movie.links, ...links };
    saveContent(content);
    return true;
  }
  return false;
};

export const updateSeriesLinks = (
  seriesTitle: string,
  seasonNum: number,
  episodeNum: number,
  links: VideoLinks
): boolean => {
  const content = getContent();
  const series = content.find(
    (c) => c.type === 'series' && c.title.toLowerCase() === seriesTitle.toLowerCase()
  ) as Series | undefined;
  
  if (series) {
    const season = series.seasons.find((s) => s.number === seasonNum);
    if (season) {
      const episode = season.episodes.find((e) => e.number === episodeNum);
      if (episode) {
        episode.links = { ...episode.links, ...links };
        saveContent(content);
        return true;
      }
    }
  }
  return false;
};

export const getContentWithLinks = (): Content[] => {
  const content = getContent();
  
  return content.filter((item) => {
    if (item.type === 'movie') {
      return hasLinks(item.links);
    } else {
      // For series, check if any episode has links
      return item.seasons.some((season) =>
        season.episodes.some((episode) => hasLinks(episode.links))
      );
    }
  }).map((item) => {
    if (item.type === 'series') {
      // Filter to only seasons/episodes with links
      return {
        ...item,
        seasons: item.seasons
          .map((season) => ({
            ...season,
            episodes: season.episodes.filter((ep) => hasLinks(ep.links))
          }))
          .filter((season) => season.episodes.length > 0)
      };
    }
    return item;
  });
};

export const hasLinks = (links: VideoLinks): boolean => {
  return !!(links.vidhide || links.streamwish || links.filemoon || links.voe);
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};

export const login = (username: string, password: string): boolean => {
  if (username === 'admin' && password === 'password') {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const clearAllContent = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
