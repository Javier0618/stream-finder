import { TMDBMovie, TMDBSeries, TMDBSeasonDetail, Movie, Series, Season, Episode } from '@/types';

const API_KEY = '32e5e53999e380a0291d66fb304153fe';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';
const LANGUAGE = 'es-MX';

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500'): string => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${IMAGE_BASE}/${size}${path}`;
};

export const fetchMoviesByYear = async (year: number): Promise<TMDBMovie[]> => {
  const movies: TMDBMovie[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= Math.min(totalPages, 5)) { // Limit to 5 pages per year
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&sort_by=popularity.desc&page=${page}&language=${LANGUAGE}`
    );
    const data = await response.json();
    movies.push(...data.results);
    totalPages = data.total_pages;
    page++;
  }

  return movies;
};

export const fetchSeriesByYear = async (year: number): Promise<TMDBSeries[]> => {
  const series: TMDBSeries[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= Math.min(totalPages, 5)) {
    const response = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&first_air_date_year=${year}&sort_by=popularity.desc&page=${page}&language=${LANGUAGE}`
    );
    const data = await response.json();
    series.push(...data.results);
    totalPages = data.total_pages;
    page++;
  }

  return series;
};

export const fetchSeriesDetails = async (seriesId: number): Promise<TMDBSeasonDetail[]> => {
  const response = await fetch(
    `${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}&language=${LANGUAGE}`
  );
  const data = await response.json();
  
  const seasons: TMDBSeasonDetail[] = [];
  
  for (let i = 1; i <= data.number_of_seasons; i++) {
    try {
      const seasonResponse = await fetch(
        `${BASE_URL}/tv/${seriesId}/season/${i}?api_key=${API_KEY}&language=${LANGUAGE}`
      );
      const seasonData = await seasonResponse.json();
      
      if (seasonData.episodes) {
        seasons.push({
          season_number: i,
          episodes: seasonData.episodes.map((ep: { episode_number: number; name: string }) => ({
            episode_number: ep.episode_number,
            name: ep.name
          }))
        });
      }
    } catch {
      console.error(`Failed to fetch season ${i} for series ${seriesId}`);
    }
  }
  
  return seasons;
};

export const convertTMDBMovieToMovie = (tmdb: TMDBMovie): Movie => ({
  id: tmdb.id,
  title: tmdb.title,
  poster: getImageUrl(tmdb.poster_path),
  backdrop: getImageUrl(tmdb.backdrop_path, 'original'),
  overview: tmdb.overview || 'Sin descripción disponible.',
  year: tmdb.release_date ? parseInt(tmdb.release_date.split('-')[0]) : 0,
  links: {},
  type: 'movie'
});

export const convertTMDBSeriesToSeries = (
  tmdb: TMDBSeries,
  seasonDetails: TMDBSeasonDetail[]
): Series => {
  const seasons: Season[] = seasonDetails.map((sd) => ({
    number: sd.season_number,
    episodes: sd.episodes.map((ep): Episode => ({
      number: ep.episode_number,
      name: ep.name,
      links: {}
    }))
  }));

  return {
    id: tmdb.id,
    title: tmdb.name,
    poster: getImageUrl(tmdb.poster_path),
    backdrop: getImageUrl(tmdb.backdrop_path, 'original'),
    overview: tmdb.overview || 'Sin descripción disponible.',
    year: tmdb.first_air_date ? parseInt(tmdb.first_air_date.split('-')[0]) : 0,
    seasons,
    type: 'series'
  };
};

export const importMoviesByYearRange = async (
  startYear: number,
  endYear: number,
  onProgress: (current: number, total: number) => void
): Promise<Movie[]> => {
  const movies: Movie[] = [];
  const years = endYear - startYear + 1;
  let processed = 0;

  for (let year = startYear; year <= endYear; year++) {
    const tmdbMovies = await fetchMoviesByYear(year);
    movies.push(...tmdbMovies.map(convertTMDBMovieToMovie));
    processed++;
    onProgress(processed, years);
  }

  return movies;
};

export const importSeriesByYearRange = async (
  startYear: number,
  endYear: number,
  onProgress: (current: number, total: number, detail: string) => void
): Promise<Series[]> => {
  const allSeries: Series[] = [];
  const years = endYear - startYear + 1;
  let yearProcessed = 0;

  for (let year = startYear; year <= endYear; year++) {
    onProgress(yearProcessed, years, `Obteniendo series del año ${year}...`);
    const tmdbSeries = await fetchSeriesByYear(year);
    
    for (let i = 0; i < tmdbSeries.length; i++) {
      const s = tmdbSeries[i];
      onProgress(yearProcessed, years, `Procesando: ${s.name} (${i + 1}/${tmdbSeries.length})`);
      
      try {
        const seasonDetails = await fetchSeriesDetails(s.id);
        allSeries.push(convertTMDBSeriesToSeries(s, seasonDetails));
      } catch {
        console.error(`Failed to fetch details for series: ${s.name}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    yearProcessed++;
  }

  return allSeries;
};
