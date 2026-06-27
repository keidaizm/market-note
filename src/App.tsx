import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useIdeas } from './store/useIdeas';
import { DashboardPage } from './pages/DashboardPage';
import { IdeaListPage } from './pages/IdeaListPage';
import { IdeaFormPage } from './pages/IdeaFormPage';
import { IdeaDetailPage } from './pages/IdeaDetailPage';
import type { Idea } from './types';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/ideas/') && location.pathname !== '/ideas/new';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2 font-black text-indigo-700 text-lg shrink-0">
            <span className="text-2xl">💡</span>
            <span className="hidden sm:inline">1000人市場ノート</span>
            <span className="sm:hidden">市場ノート</span>
          </NavLink>
          <nav className="flex gap-1 ml-auto">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              ダッシュボード
            </NavLink>
            <NavLink
              to="/ideas"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  (isActive || isDetail) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              アイデア一覧
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { ideas, addIdea, updateIdea, deleteIdea, importIdeas, exportJson, exportCsv } = useIdeas();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage ideas={ideas} />} />
        <Route
          path="/ideas"
          element={
            <IdeaListPage
              ideas={ideas}
              onDelete={deleteIdea}
              onImport={importIdeas}
              onExportJson={exportJson}
              onExportCsv={exportCsv}
            />
          }
        />
        <Route
          path="/ideas/new"
          element={
            <IdeaFormPage
              onAdd={(data) => addIdea(data as Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>)}
            />
          }
        />
        <Route
          path="/ideas/:id"
          element={
            <IdeaDetailPage
              ideas={ideas}
              onUpdate={updateIdea}
              onDelete={deleteIdea}
            />
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
