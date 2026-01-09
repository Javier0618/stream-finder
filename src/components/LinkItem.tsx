import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface LinkItemProps {
  server: string;
  url: string;
}

const LinkItem = ({ server, url }: LinkItemProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const serverColors: Record<string, string> = {
    vidhide: 'bg-blue-500/20 text-blue-400',
    streamwish: 'bg-green-500/20 text-green-400',
    filemoon: 'bg-purple-500/20 text-purple-400',
    voe: 'bg-orange-500/20 text-orange-400'
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
      <span className={`px-2 py-1 text-xs rounded-md font-medium capitalize ${serverColors[server.toLowerCase()] || 'bg-muted text-muted-foreground'}`}>
        {server}
      </span>
      <span className="flex-1 text-sm text-muted-foreground truncate font-mono">
        {url}
      </span>
      <div className="flex items-center gap-2">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
        <button 
          onClick={handleCopy}
          className="copy-btn flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copiar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LinkItem;
