import { CSVRow, VideoLinks } from '@/types';
import { updateMovieLinks, updateSeriesLinks } from './storage';

export const parseCSV = (csvText: string): CSVRow[] => {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('El CSV debe tener al menos una fila de encabezados y una de datos');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Validate headers
  const requiredHeaders = ['título', 'vidhide', 'streamwish', 'filemoon', 'voe'];
  const altHeaders = ['titulo', 'vidhide', 'streamwish', 'filemoon', 'voe'];
  
  const hasRequired = requiredHeaders.every(h => headers.includes(h)) ||
                      altHeaders.every(h => headers.includes(h));
  
  if (!hasRequired) {
    // Try English headers
    const englishHeaders = ['title', 'vidhide', 'streamwish', 'filemoon', 'voe'];
    if (!englishHeaders.every(h => headers.includes(h))) {
      throw new Error('Encabezados inválidos. Se esperan: Título,Vidhide,StreamWish,Filemoon,Voe');
    }
  }

  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle CSV with quotes
    const values = parseCSVLine(line);
    
    if (values.length >= 5) {
      rows.push({
        title: values[0].trim(),
        vidhide: values[1].trim(),
        streamwish: values[2].trim(),
        filemoon: values[3].trim(),
        voe: values[4].trim()
      });
    }
  }

  return rows;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

export interface ImportResult {
  success: number;
  failed: number;
  details: string[];
}

export const processCSVLinks = (rows: CSVRow[]): ImportResult => {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    details: []
  };

  for (const row of rows) {
    const links: VideoLinks = {};
    
    if (row.vidhide) links.vidhide = row.vidhide;
    if (row.streamwish) links.streamwish = row.streamwish;
    if (row.filemoon) links.filemoon = row.filemoon;
    if (row.voe) links.voe = row.voe;

    // Check if it's a series episode (format: "Title T#-E#")
    const seriesMatch = row.title.match(/^(.+)\s+T(\d+)-E(\d+)$/i);
    
    if (seriesMatch) {
      const [, seriesTitle, seasonStr, episodeStr] = seriesMatch;
      const seasonNum = parseInt(seasonStr);
      const episodeNum = parseInt(episodeStr);
      
      const success = updateSeriesLinks(seriesTitle.trim(), seasonNum, episodeNum, links);
      
      if (success) {
        result.success++;
        result.details.push(`✓ ${row.title}`);
      } else {
        result.failed++;
        result.details.push(`✗ ${row.title} - No encontrado`);
      }
    } else {
      // It's a movie
      const success = updateMovieLinks(row.title, links);
      
      if (success) {
        result.success++;
        result.details.push(`✓ ${row.title}`);
      } else {
        result.failed++;
        result.details.push(`✗ ${row.title} - No encontrado`);
      }
    }
  }

  return result;
};
