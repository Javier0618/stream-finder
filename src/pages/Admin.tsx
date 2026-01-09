import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { isAuthenticated, login, logout, clearAllContent } from '@/lib/storage';
import Header from '@/components/Header';
import TMDBImporter from '@/components/TMDBImporter';
import CSVUploader from '@/components/CSVUploader';
import ContentStats from '@/components/ContentStats';

const Admin = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statsKey, setStatsKey] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    navigate('/');
  };

  const handleClearAll = () => {
    clearAllContent();
    setStatsKey(prev => prev + 1);
    setShowClearConfirm(false);
  };

  const refreshStats = () => {
    setStatsKey(prev => prev + 1);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery="" onSearchChange={() => {}} />
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
              <p className="text-muted-foreground">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            <form onSubmit={handleLogin} className="bg-card rounded-xl p-6 border border-border">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Usuario</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                    placeholder="admin"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button type="submit" className="btn-primary w-full py-3">
                  Iniciar sesión
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Credenciales por defecto: admin / password
              </p>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery="" onSearchChange={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona tu biblioteca de contenido</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-ghost text-red-400 hover:bg-red-500/10 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar todo
            </button>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <ContentStats key={statsKey} />
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <TMDBImporter />
          <CSVUploader onImportComplete={refreshStats} />
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-card rounded-xl border border-border">
          <h3 className="font-bold mb-4">📖 Instrucciones de uso</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              <span>Importa películas o series desde TMDB seleccionando el tipo de contenido y un rango de años.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              <span>Prepara un archivo CSV con los enlaces de video. Formato: <code className="bg-secondary px-1 rounded">Título,Vidhide,StreamWish,Filemoon,Voe</code></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              <span>Para series, usa el formato <code className="bg-secondary px-1 rounded">Nombre T#-E#</code> (ej: "Breaking Bad T1-E1")</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">4.</span>
              <span>Sube el CSV y el sistema asignará automáticamente los enlaces al contenido correspondiente.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">5.</span>
              <span>Solo el contenido con enlaces aparecerá en la página principal.</span>
            </li>
          </ol>
        </div>
      </main>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <>
          <div className="modal-backdrop" onClick={() => setShowClearConfirm(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">¿Eliminar todo el contenido?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Esta acción eliminará todas las películas, series y enlaces almacenados. No se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Eliminar todo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
