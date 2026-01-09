import { Film, Tv, Link2, Database } from 'lucide-react';
import { getContent, getContentWithLinks } from '@/lib/storage';

const ContentStats = () => {
  const allContent = getContent();
  const contentWithLinks = getContentWithLinks();

  const totalMovies = allContent.filter(c => c.type === 'movie').length;
  const totalSeries = allContent.filter(c => c.type === 'series').length;
  const moviesWithLinks = contentWithLinks.filter(c => c.type === 'movie').length;
  const seriesWithLinks = contentWithLinks.filter(c => c.type === 'series').length;

  const stats = [
    {
      icon: Film,
      label: 'Películas totales',
      value: totalMovies,
      color: 'text-blue-400'
    },
    {
      icon: Tv,
      label: 'Series totales',
      value: totalSeries,
      color: 'text-purple-400'
    },
    {
      icon: Link2,
      label: 'Películas con enlaces',
      value: moviesWithLinks,
      color: 'text-green-400'
    },
    {
      icon: Database,
      label: 'Series con enlaces',
      value: seriesWithLinks,
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default ContentStats;
