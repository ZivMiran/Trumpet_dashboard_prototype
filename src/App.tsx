import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { Overview } from './components/overview/Overview';
import { Music } from './components/music/Music';
import { Audience } from './components/audience/Audience';
import { Settings } from './components/settings/Settings';

function PageSwitch() {
  const { state } = useApp();
  switch (state.page) {
    case 'overview':
      return <Overview />;
    case 'music':
      return <Music />;
    case 'audience':
      return <Audience />;
    case 'settings':
      return <Settings />;
  }
}

function App() {
  return (
    <AppProvider>
      <AppShell>
        <PageSwitch />
      </AppShell>
    </AppProvider>
  );
}

export default App;
