import React, { useEffect, useState } from 'react';
import { getPlayers, getTeams, deletePlayer } from './api';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

const positions = [
  { label: "All", value: "All" },
  { label: "Goalkeeper", value: "Goalkeeper" },
  { label: "Defender", value: "Defender" },
  { label: "Midfielder", value: "Midfielder" },
  { label: "Forward", value: "Forward" }
];

const PlayerList = ({ onEdit }) => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [playersData, teamsData] = await Promise.all([
        getPlayers(),
        getTeams()
      ]);
      setPlayers(playersData);
      setTeams(teamsData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTeamLogo = (teamName) => {
    const team = teams.find(t => t.name === teamName);
    return team ? team.team_logo : '';
  };

  const handleDelete = async () => {
    try {
      await deletePlayer(selectedPlayer.id);
      await fetchData();
      setDeleteDialogVisible(false);
    } catch (err) {
      setError('Failed to delete player. Please try again.');
    }
  };

  const filterData = (data) => {
    return data.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === 'All' || player.position === positionFilter;
      const matchesTeam = teamFilter === 'All' || player.team === teamFilter;
      return matchesSearch && matchesPosition && matchesTeam;
    });
  };

  const nameBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-3">
        {rowData.player_image ? (
          <img
            src={rowData.player_image}
            alt={rowData.name}
            className="w-3rem h-3rem border-circle"
          />
        ) : (
          <div className="w-3rem h-3rem border-circle bg-gray-100 flex align-items-center justify-content-center">
            {rowData.name.charAt(0)}
          </div>
        )}
        <span>{rowData.name}</span>
      </div>
    );
  };

  const teamBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        {getTeamLogo(rowData.team) && (
          <img
            src={getTeamLogo(rowData.team)}
            alt={rowData.team}
            className="w-1rem h-1rem"
          />
        )}
        <span>{rowData.team}</span>
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex justify-content-end gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="secondary"
          onClick={() => onEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          onClick={() => {
            setSelectedPlayer(rowData);
            setDeleteDialogVisible(true);
          }}
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
      <span className="p-input-icon-left w-full md:w-auto">
        <i className="pi pi-search" />
        <InputText
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search players..."
          className="w-full md:w-auto"
        />
      </span>

      <div className="flex gap-3">
        <Dropdown
          value={positionFilter}
          options={positions}
          onChange={(e) => setPositionFilter(e.value)}
          placeholder="Select position"
          className="w-full md:w-auto"
        />

        <Dropdown
          value={teamFilter}
          options={[
            { label: "All Teams", value: "All" },
            ...teams.map(team => ({ label: team.name, value: team.name }))
          ]}
          onChange={(e) => setTeamFilter(e.value)}
          placeholder="Select team"
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );

  const deleteDialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={() => setDeleteDialogVisible(false)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        severity="danger"
        onClick={handleDelete}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center p-4">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-2xl font-bold m-0">Player List</h2>
        <p className="text-500 mt-2">Manage and view all players in the system</p>
      </div>

      {error && (
        <Message severity="error" text={error} className="w-full mb-4" />
      )}

      <DataTable
        value={filterData(players)}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        emptyMessage="No players found"
        stripedRows
        removableSort
        sortMode="multiple"
      >
        <Column
          field="name"
          header="Player"
          body={nameBodyTemplate}
          sortable
        />
        <Column
          field="position"
          header="Position"
          sortable
        />
        <Column
          field="team"
          header="Team"
          body={teamBodyTemplate}
          sortable
        />
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ width: '100px' }}
        />
      </DataTable>

      <Dialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        header="Delete Player"
        footer={deleteDialogFooter}
        modal
      >
        <p>
          Are you sure you want to delete {selectedPlayer?.name}? This action cannot be undone.
        </p>
      </Dialog>
    </Card>
  );
};

export default PlayerList;