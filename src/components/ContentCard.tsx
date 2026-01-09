import { Content } from '@/types';
import { Play } from 'lucide-react';

interface ContentCardProps {
  content: Content;
  onClick: () => void;
}

const ContentCard = ({ content, onClick }: ContentCardProps) => {
  const truncatedOverview = content.overview.length > 100 
    ? content.overview.substring(0, 100) + '...'
    : content.overview;

  return (
    <div className="poster-card group cursor-pointer" onClick={onClick}>
      <img 
        src={content.poster} 
        alt={content.title}
        loading="lazy"
      />
      <div className="poster-overlay flex flex-col justify-end p-3">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-sm mb-1 line-clamp-2">{content.title}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>{content.year}</span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
            <span>{content.type === 'movie' ? 'Película' : 'Serie'}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {truncatedOverview}
          </p>
          <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2">
            <Play className="w-4 h-4" />
            Ver enlaces
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
