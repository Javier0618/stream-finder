import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSV, processCSVLinks, ImportResult } from '@/lib/csv';

interface CSVUploaderProps {
  onImportComplete: () => void;
}

const CSVUploader = ({ onImportComplete }: CSVUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV válido');
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        setError('El archivo CSV está vacío o no tiene datos válidos');
        return;
      }

      const importResult = processCSVLinks(rows);
      setResult(importResult);
      setError(null);
      onImportComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      setResult(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        Cargar enlaces CSV
      </h3>

      <div className="mb-4 p-4 bg-secondary/30 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Formato del CSV
        </h4>
        <code className="text-xs text-muted-foreground block">
          Título,Vidhide,StreamWish,Filemoon,Voe<br />
          Inception,https://...,https://...,https://...,https://...<br />
          The Good Doctor T1-E1,https://...,https://...,https://...,https://...
        </code>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />
        <div className="text-center">
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="font-medium mb-1">
            Arrastra tu archivo CSV aquí
          </p>
          <p className="text-sm text-muted-foreground">
            o haz clic para seleccionar
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-400 font-medium">
                Importación completada
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.success} enlaces asignados, {result.failed} no encontrados
              </p>
            </div>
          </div>

          {result.details.length > 0 && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-primary hover:underline"
              >
                {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
              
              {showDetails && (
                <div className="mt-2 max-h-48 overflow-y-auto p-3 bg-secondary/30 rounded-lg text-xs font-mono space-y-1">
                  {result.details.map((detail, i) => (
                    <div 
                      key={i} 
                      className={detail.startsWith('✓') ? 'text-green-400' : 'text-red-400'}
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
