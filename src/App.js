import React, { useState } from 'react';
import { Menu, X, Users, Building2, ArrowLeftRight, BarChart3 } from 'lucide-react';
import AddPlayerForm from './components/AddPlayerForm';
import PlayerList from './components/PlayerList';
import { EditPlayerForm } from './components/EditPlayerForm'; // Updated import
import TransferPage from './components/TransferPage';
import PlayerStatistics from './components/PlayerStatistics';
import AddTeamForm from './components/AddTeamForm';
import TeamList from './components/TeamList';
import { EditTeamForm } from './components/EditTeamForm'; // Updated import

// Import PrimeReact resources
import "primereact/resources/themes/lara-light-indigo/theme.css";  // theme
import "primereact/resources/primereact.min.css";                  // core css
import "primeicons/primeicons.css";                               // icons
import "/node_modules/primeflex/primeflex.css";

// Navigation items configuration
const navItems = [
  { id: 'players', label: 'Players', icon: Users },
  { id: 'teams', label: 'Teams', icon: Building2 },
  { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
];

export default function App() {
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [activeTab, setActiveTab] = useState('players');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handlePlayerUpdate = () => {
    setEditingPlayerId(null);
  };

  const handleTeamUpdate = () => {
    setEditingTeamId(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'players':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Player</h2>
              <AddPlayerForm />
            </div>
            {editingPlayerId && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Edit Player</h2>
                <EditPlayerForm
                  playerId={editingPlayerId}
                  onUpdate={handlePlayerUpdate}
                />
              </div>
            )}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Player List</h2>
              <PlayerList onEdit={setEditingPlayerId} />
            </div>
          </div>
        );
      case 'teams':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Team</h2>
              <AddTeamForm />
            </div>
            {editingTeamId && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Edit Team</h2>
                <EditTeamForm
                  teamId={editingTeamId}
                  onUpdate={handleTeamUpdate}
                />
              </div>
            )}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Team List</h2>
              <TeamList onEdit={setEditingTeamId} />
            </div>
          </div>
        );
      case 'transfers':
        return <TransferPage />;
      case 'statistics':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Player Statistics</h2>
            <PlayerStatistics />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                {isSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <h1 className="ml-4 text-xl font-bold">Player Contract Tracker</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-20'
          } min-h-screen bg-white shadow-md transition-all duration-300`}
        >
          <nav className="mt-5 px-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center px-4 py-3 mb-2 rounded-md
                  ${activeTab === item.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100'
                  }
                  transition-colors duration-200
                `}
              >
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && (
                  <span className="ml-3">{item.label}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-8 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}