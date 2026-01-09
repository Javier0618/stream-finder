import { useState, useMemo } from 'react';
import { Film, Tv, Search } from 'lucide-react';
import { getContentWithLinks } from '@/lib/storage';
import { Content } from '@/types';
import Header from '@/components/Header';
import ContentCard from '@/components/ContentCard';
import ContentModal from '@/components/ContentModal';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [filter, setFilter] = useState<'all' | 'movies' | 'series'>('all');

  const content = useMemo(() => getContentWithLinks(), []);

  const filteredContent = useMemo(() => {
    let filtered = content;

    // Filter by type
    if (filter === 'movies') {
      filtered = filtered.filter(c => c.type === 'movie');
    } else if (filter === 'series') {
      filtered = filtered.filter(c => c.type === 'series');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.overview.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [content, filter, searchQuery]);

  const movieCount = content.filter(c => c.type === 'movie').length;
  const seriesCount = content.filter(c => c.type === 'series').length;

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Tu biblioteca de <span className="text-gradient">streaming</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encuentra y accede a tus películas y series favoritas en un solo lugar
          </p>
        </section>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Todo ({content.length})
          </button>
          <button
            onClick={() => setFilter('movies')}
            className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
              filter === 'movies'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Film className="w-4 h-4" />
            Películas ({movieCount})
          </button>
          <button
            onClick={() => setFilter('series')}
            className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
              filter === 'series'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Tv className="w-4 h-4" />
            Series ({seriesCount})
          </button>
        </div>

        {/* Content Grid */}
        {filteredContent.length > 0 ? (
          <div className="grid-container">
            {filteredContent.map((item) => (
              <ContentCard 
                key={`${item.type}-${item.id}`} 
                content={item}
                onClick={() => setSelectedContent(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No hay contenido disponible</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery 
                ? `No se encontraron resultados para "${searchQuery}"`
                : 'Importa películas o series desde el panel de administración y sube un CSV con los enlaces.'
              }
            </p>
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedContent && (
        <ContentModal 
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  );
};

export default Index;
