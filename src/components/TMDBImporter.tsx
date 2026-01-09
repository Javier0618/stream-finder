import { useState } from 'react';
import { Download, Loader2, Film, Tv } from 'lucide-react';
import { importMoviesByYearRange, importSeriesByYearRange } from '@/lib/tmdb';
import { addContent } from '@/lib/storage';

const TMDBImporter = () => {
  const [startYear, setStartYear] = useState('2024');
  const [endYear, setEndYear] = useState('2025');
  const [contentType, setContentType] = useState<'movies' | 'series'>('movies');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async () => {
    const start = parseInt(startYear);
    const end = parseInt(endYear);

    if (isNaN(start) || isNaN(end) || start > end) {
      setResult('Error: Rango de años inválido');
      return;
    }

    if (end - start > 10) {
      setResult('Error: El rango máximo es de 10 años');
      return;
    }

    setLoading(true);
    setProgress('Iniciando importación...');
    setResult(null);

    try {
      if (contentType === 'movies') {
        const movies = await importMoviesByYearRange(start, end, (current, total) => {
          setProgress(`Importando películas: ${current}/${total} años procesados`);
        });

        movies.forEach(addContent);
        setResult(`✓ ${movies.length} películas importadas exitosamente`);
      } else {
        const series = await importSeriesByYearRange(start, end, (current, total, detail) => {
          setProgress(`${current}/${total} años - ${detail}`);
        });

        series.forEach(addContent);
        setResult(`✓ ${series.length} series importadas exitosamente`);
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-primary" />
        Importar desde TMDB
      </h3>

      <div className="space-y-4">
        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Tipo de contenido</label>
          <div className="flex gap-2">
            <button
              onClick={() => setContentType('movies')}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                contentType === 'movies' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Film className="w-4 h-4" />
              Películas
            </button>
            <button
              onClick={() => setContentType('series')}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                contentType === 'series' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Tv className="w-4 h-4" />
              Series
            </button>
          </div>
        </div>

        {/* Year Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Año inicio</label>
            <input
              type="number"
              min="1900"
              max="2030"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Año fin</label>
            <input
              type="number"
              min="1900"
              max="2030"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Importar {contentType === 'movies' ? 'Películas' : 'Series'}
            </>
          )}
        </button>

        {progress && (
          <div className="p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
            {progress}
          </div>
        )}

        {result && (
          <div className={`p-3 rounded-lg text-sm ${
            result.startsWith('✓') 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default TMDBImporter;
