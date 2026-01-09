export interface VideoLinks {
  vidhide?: string;
  streamwish?: string;
  filemoon?: string;
  voe?: string;
}

export interface Episode {
  number: number;
  name: string;
  links: VideoLinks;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Movie {
  id: number;
  title: string;
  poster: string;
  backdrop: string;
  overview: string;
  year: number;
  links: VideoLinks;
  type: 'movie';
}

export interface Series {
  id: number;
  title: string;
  poster: string;
  backdrop: string;
  overview: string;
  year: number;
  seasons: Season[];
  type: 'series';
}

export type Content = Movie | Series;

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
}

export interface TMDBSeries {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  number_of_seasons: number;
}

export interface TMDBSeasonDetail {
  season_number: number;
  episodes: {
    episode_number: number;
    name: string;
  }[];
}

export interface CSVRow {
  title: string;
  vidhide: string;
  streamwish: string;
  filemoon: string;
  voe: string;
}
