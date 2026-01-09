import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string;
  badge?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const Accordion = ({ title, badge, children, defaultOpen = false }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="accordion-trigger w-full"
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {badge && <span className="server-badge">{badge}</span>}
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div 
        className="accordion-content"
        style={{ 
          maxHeight: isOpen ? '2000px' : '0',
          opacity: isOpen ? 1 : 0
        }}
      >
        <div className="p-4 bg-card/50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
