import { useState } from 'react';
import { Film, Tv, Link2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Content } from '@/types';
import { getContent, saveContent, hasLinks } from '@/lib/storage';

interface ContentListProps {
  onUpdate: () => void;
}

const ContentList = ({ onUpdate }: ContentListProps) => {
  const [filter, setFilter] = useState<'all' | 'movies' | 'series'>('all');
  const [showOnlyWithLinks, setShowOnlyWithLinks] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allContent = getContent();

  const filteredContent = allContent.filter((item) => {
    // Type filter
    if (filter === 'movies' && item.type !== 'movie') return false;
    if (filter === 'series' && item.type !== 'series') return false;

    // Links filter
    if (showOnlyWithLinks) {
      if (item.type === 'movie') {
        if (!hasLinks(item.links)) return false;
      } else {
        const hasAnyLinks = item.seasons.some((s) =>
          s.episodes.some((e) => hasLinks(e.links))
        );
        if (!hasAnyLinks) return false;
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const handleDelete = (id: number, type: string) => {
    const updated = allContent.filter(
      (c) => !(c.id === id && c.type === type)
    );
    saveContent(updated);
    onUpdate();
  };

  const getItemStatus = (item: Content): { hasLinks: boolean; linkCount: number } => {
    if (item.type === 'movie') {
      const links = item.links;
      const count = [links.vidhide, links.streamwish, links.filemoon, links.voe].filter(Boolean).length;
      return { hasLinks: count > 0, linkCount: count };
    } else {
      let count = 0;
      item.seasons.forEach((s) => {
        s.episodes.forEach((e) => {
          count += [e.links.vidhide, e.links.streamwish, e.links.filemoon, e.links.voe].filter(Boolean).length;
        });
      });
      return { hasLinks: count > 0, linkCount: count };
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-bold mb-4">Contenido Importado ({allContent.length})</h3>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field py-2 flex-1 min-w-[200px]"
          />
          
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setFilter('movies')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                filter === 'movies' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
            >
              <Film className="w-3 h-3" />
              Películas
            </button>
            <button
              onClick={() => setFilter('series')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                filter === 'series' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
            >
              <Tv className="w-3 h-3" />
              Series
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyWithLinks}
              onChange={(e) => setShowOnlyWithLinks(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-input accent-primary"
            />
            Solo con enlaces
          </label>
        </div>
      </div>

      {/* Content List */}
      <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
        {filteredContent.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hay contenido que mostrar
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredContent.map((item) => {
              const { hasLinks: itemHasLinks, linkCount } = getItemStatus(item);
              const itemKey = `${item.type}-${item.id}`;
              const isExpanded = expandedId === itemKey;

              return (
                <div key={itemKey} className="bg-card hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3 p-3">
                    {/* Poster thumbnail */}
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.type === 'movie' ? (
                          <Film className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        ) : (
                          <Tv className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">{item.title}</span>
                        <span className="text-xs text-muted-foreground">({item.year})</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {itemHasLinks ? (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <Link2 className="w-3 h-3" />
                            {linkCount} enlace{linkCount !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin enlaces</span>
                        )}
                        
                        {item.type === 'series' && (
                          <span className="text-xs text-muted-foreground">
                            • {item.seasons.length} temporada{item.seasons.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {item.type === 'series' && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : itemKey)}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          title="Ver temporadas"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id, item.type)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded series details */}
                  {item.type === 'series' && isExpanded && (
                    <div className="px-3 pb-3 pl-16">
                      <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                        {item.seasons.map((season) => {
                          const seasonLinkCount = season.episodes.reduce((acc, ep) => {
                            return acc + [ep.links.vidhide, ep.links.streamwish, ep.links.filemoon, ep.links.voe].filter(Boolean).length;
                          }, 0);

                          return (
                            <div key={season.number} className="flex items-center justify-between text-sm">
                              <span>Temporada {season.number}</span>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{season.episodes.length} episodios</span>
                                {seasonLinkCount > 0 ? (
                                  <span className="text-green-400">{seasonLinkCount} enlaces</span>
                                ) : (
                                  <span>Sin enlaces</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentList;
