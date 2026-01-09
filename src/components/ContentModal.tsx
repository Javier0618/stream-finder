import { useEffect } from 'react';
import { X, Film, Tv } from 'lucide-react';
import { Content, Movie, Series, VideoLinks } from '@/types';
import Accordion from './Accordion';
import LinkItem from './LinkItem';

interface ContentModalProps {
  content: Content;
  onClose: () => void;
}

const ContentModal = ({ content, onClose }: ContentModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  const renderLinks = (links: VideoLinks) => {
    const servers = [
      { key: 'vidhide', label: 'Vidhide' },
      { key: 'streamwish', label: 'StreamWish' },
      { key: 'filemoon', label: 'Filemoon' },
      { key: 'voe', label: 'Voe' }
    ];

    return (
      <div className="space-y-2">
        {servers.map(({ key, label }) => {
          const url = links[key as keyof VideoLinks];
          if (!url) return null;
          return <LinkItem key={key} server={label} url={url} />;
        })}
      </div>
    );
  };

  const renderMovieContent = (movie: Movie) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-foreground">Servidores disponibles</h4>
      {renderLinks(movie.links)}
    </div>
  );

  const renderSeriesContent = (series: Series) => (
    <div className="space-y-3">
      {series.seasons.map((season) => (
        <Accordion 
          key={season.number} 
          title={`Temporada ${season.number}`}
          badge={`${season.episodes.length} eps`}
        >
          <div className="space-y-2">
            {season.episodes.map((episode) => (
              <Accordion 
                key={episode.number} 
                title={`Episodio ${episode.number}`}
                badge={episode.name}
              >
                {renderLinks(episode.links)}
              </Accordion>
            ))}
          </div>
        </Accordion>
      ))}
    </div>
  );

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        {/* Backdrop Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${content.backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/95 to-card/80" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row gap-6 p-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
          {/* Poster */}
          <div className="flex-shrink-0 w-48 mx-auto md:mx-0">
            <img 
              src={content.poster} 
              alt={content.title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {content.type === 'movie' ? (
                <Film className="w-5 h-5 text-primary" />
              ) : (
                <Tv className="w-5 h-5 text-primary" />
              )}
              <span className="text-sm text-muted-foreground">
                {content.type === 'movie' ? 'Película' : 'Serie'}
              </span>
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span className="text-sm text-muted-foreground">{content.year}</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-3 text-gradient">{content.title}</h2>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {content.overview}
            </p>

            <div className="border-t border-border pt-4">
              {content.type === 'movie' 
                ? renderMovieContent(content as Movie)
                : renderSeriesContent(content as Series)
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentModal;
