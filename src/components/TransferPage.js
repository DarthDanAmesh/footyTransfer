import React, { useState, useEffect } from 'react';
import { getPlayers, addTransfer, searchTeams, searchPlayers, getTransfers } from './api';

function TransferPage({ onTransferSuccess }) {
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    player_id: '',
    player_name: '',
    from_team: '',
    to_team: '',
    transfer_date: '',
    transfer_window: 'summer',
    fee: '',
    nationality: '',  // Added new field
    nationality_flag: '' // Added new field
  });
  const [suggestedTeams, setSuggestedTeams] = useState([]);
  const [suggestedPlayers, setSuggestedPlayers] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersData, transfersData] = await Promise.all([
          getPlayers(),
          getTransfers()
        ]);
        setPlayers(playersData);
        setTransfers(transfersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Enhanced search handling
    try {
      if (name === 'from_team' || name === 'to_team') {
        const teams = await searchTeams(value);
        setSuggestedTeams(teams);
      }

      if (name === 'player_name') {
        const players = await searchPlayers(value);
        setSuggestedPlayers(players);
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  const handleTeamSelect = (teamName, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: teamName
    }));
    setSuggestedTeams([]);
  };

  const handlePlayerSelect = (player) => {
    setFormData(prev => ({
      ...prev,
      player_id: player.id,
      player_name: player.name,
      nationality: player.nationality || '',
      nationality_flag: player.nationality_flag || ''
    }));
    setSuggestedPlayers([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTransfer(formData);
      const newTransfers = await getTransfers();
      setTransfers(newTransfers);
      setFormData({
        player_id: '',
        player_name: '',
        from_team: '',
        to_team: '',
        transfer_date: '',
        transfer_window: 'summer',
        fee: '',
        nationality: '',
        nationality_flag: ''
      });
      onTransferSuccess?.();
    } catch (error) {
      console.error('Error submitting transfer:', error);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedTransfers = [...transfers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const getValue = (obj, key) => {
      switch (key) {
        case 'fee':
          return parseFloat(obj.fee) || 0;
        case 'team':
          return obj.to_team || '';
        case 'player_name':
          return obj.player?.name || '';
        case 'season':
          return obj.transfer_window || '';
        default:
          return obj[key];
      }
    };

    const aValue = getValue(a, sortConfig.key);
    const bValue = getValue(b, sortConfig.key);

    if (typeof aValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return sortConfig.direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Transfer Player</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              name="player_name"
              placeholder="Player Name"
              value={formData.player_name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
            {suggestedPlayers.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-b mt-1 max-h-48 overflow-y-auto">
                {suggestedPlayers.map(player => (
                  <li
                    key={player.id}
                    onClick={() => handlePlayerSelect(player)}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  >
                    {player.nationality_flag && (
                      <img
                        src={player.nationality_flag}
                        alt={player.nationality}
                        className="w-6 h-4 mr-2"
                      />
                    )}
                    <span>{player.name}</span>
                    <span className="text-gray-500 text-sm ml-2">({player.team})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {['from_team', 'to_team'].map(field => (
            <div key={field} className="relative">
              <input
                type="text"
                name={field}
                placeholder={field === 'from_team' ? 'From Team' : 'To Team'}
                value={formData[field]}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              {suggestedTeams.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded-b mt-1 max-h-48 overflow-y-auto">
                  {suggestedTeams.map(team => (
                    <li
                      key={team.id}
                      onClick={() => handleTeamSelect(team.name, field)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {team.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="grid grid-cols-3 gap-4">
            <input
              type="date"
              name="transfer_date"
              value={formData.transfer_date}
              onChange={handleChange}
              required
              className="p-2 border rounded"
            />
            <select
              name="transfer_window"
              value={formData.transfer_window}
              onChange={handleChange}
              required
              className="p-2 border rounded"
            >
              <option value="summer">Summer</option>
              <option value="winter">Winter</option>
            </select>
            <input
              type="number"
              name="fee"
              placeholder="Transfer Fee"
              value={formData.fee}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add Transfer
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Transfers List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {['Player Name', 'Team', 'Transfer Fee', 'Season'].map(header => (
                  <th
                    key={header}
                    onClick={() => handleSort(header.toLowerCase().replace(' ', '_'))}
                    className="p-2 text-left cursor-pointer hover:bg-gray-50"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTransfers.map(transfer => (
                <tr key={transfer.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <div className="flex items-center">
                      {transfer.nationality_flag && (
                        <img
                          src={transfer.nationality_flag}
                          alt={transfer.nationality}
                          className="w-6 h-4 mr-2"
                        />
                      )}
                      {transfer.player_name}
                    </div>
                  </td>
                  <td className="p-2">
                    <div>
                      {transfer.from_team} → {transfer.to_team}
                      <div className="text-sm text-gray-500">
                        {transfer.from_team === transfer.to_team
                          ? 'N/A'
                          : (transfer.from_team ? 'Outgoing' : 'Incoming')}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(transfer.fee)}
                  </td>
                  <td className="p-2">
                    {transfer.transfer_window}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TransferPage;