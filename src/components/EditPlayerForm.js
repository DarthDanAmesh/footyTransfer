import { getPlayer, updatePlayer } from './api';
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import { TabView, TabPanel } from 'primereact/tabview';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { format } from 'date-fns';

const positions = [
  { label: "Goalkeeper", value: "goalkeeper" },
  { label: "Defender", value: "defender" },
  { label: "Midfielder", value: "midfielder" },
  { label: "Forward", value: "forward" }
];

export const EditPlayerForm = ({ playerId, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    price: '',
    team: '',
    contract_duration: '',
    years_left: '',
    on_loan: false,
    loan_team: '',
    statistics: '{}',
    contract_start_date: '',
    jersey_number: '',
    nationality: '',
    age: '',
    height: '',
    weight: '',
    preferred_foot: 'right'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchPlayer() {
      try {
        setLoading(true);
        setError(null);
        const player = await getPlayer(playerId);
        setFormData({
          ...player,
          statistics: JSON.stringify(player.statistics, null, 2),
          contract_start_date: player.contract_start_date ? new Date(player.contract_start_date) : new Date(),
          age: player.age || '',
          height: player.height || '',
          weight: player.weight || '',
          preferred_foot: player.preferred_foot || 'right'
        });
      } catch (err) {
        setError('Failed to load player data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchPlayer();
  }, [playerId]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const updatedPlayer = {
        ...formData,
        contract_start_date: format(formData.contract_start_date, 'yyyy-MM-dd'),
        statistics: JSON.parse(formData.statistics)
      };
      await updatePlayer(playerId, updatedPlayer);
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to update player. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center p-4">
        <ProgressSpinner />
      </div>
    );
  }

  const header = (
    <div>
      <h2 className="text-xl font-bold">Edit Player</h2>
      <p className="text-sm text-gray-600">Update player information and contract details</p>
    </div>
  );

  return (
    <Card className="w-full max-w-3xl mx-auto">
      {header}
      <div className="p-4">
        {error && (
          <Message severity="error" text={error} className="mb-4 w-full" />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TabView>
            <TabPanel header="Basic Info">
              <div className="grid grid-cols-2 gap-4">
                <div className="field">
                  <label htmlFor="name" className="block mb-2">Name</label>
                  <InputText
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="field">
                  <label htmlFor="position" className="block mb-2">Position</label>
                  <Dropdown
                    id="position"
                    value={formData.position}
                    options={positions}
                    onChange={(e) => handleChange('position', e.value)}
                    placeholder="Select position"
                    className="w-full"
                  />
                </div>

                <div className="field">
                  <label htmlFor="jersey_number" className="block mb-2">Jersey Number</label>
                  <InputNumber
                    id="jersey_number"
                    value={formData.jersey_number}
                    onValueChange={(e) => handleChange('jersey_number', e.value)}
                    className="w-full"
                  />
                </div>

                <div className="field">
                  <label htmlFor="nationality" className="block mb-2">Nationality</label>
                  <InputText
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Contract">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="field">
                    <label htmlFor="contract_start_date" className="block mb-2">Contract Start Date</label>
                    <Calendar
                      id="contract_start_date"
                      value={formData.contract_start_date}
                      onChange={(e) => handleChange('contract_start_date', e.value)}
                      dateFormat="yy-mm-dd"
                      className="w-full"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="contract_duration" className="block mb-2">Contract Duration (years)</label>
                    <InputNumber
                      id="contract_duration"
                      value={formData.contract_duration}
                      onValueChange={(e) => handleChange('contract_duration', e.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="price" className="block mb-2">Price</label>
                    <InputNumber
                      id="price"
                      value={formData.price}
                      onValueChange={(e) => handleChange('price', e.value)}
                      mode="currency"
                      currency="USD"
                      className="w-full"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="team" className="block mb-2">Team</label>
                    <InputText
                      id="team"
                      value={formData.team}
                      onChange={(e) => handleChange('team', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="field p-4 border rounded">
                  <div className="flex justify-content-between align-items-center">
                    <div>
                      <label htmlFor="on_loan" className="block font-bold">On Loan</label>
                      <small className="block text-gray-600">Is the player currently on loan to another team?</small>
                    </div>
                    <ToggleButton
                      id="on_loan"
                      checked={formData.on_loan}
                      onChange={(e) => handleChange('on_loan', e.value)}
                    />
                  </div>
                </div>

                {formData.on_loan && (
                  <div className="field">
                    <label htmlFor="loan_team" className="block mb-2">Loan Team</label>
                    <InputText
                      id="loan_team"
                      value={formData.loan_team}
                      onChange={(e) => handleChange('loan_team', e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel header="Statistics">
              <div className="field">
                <label htmlFor="statistics" className="block mb-2">Statistics (JSON)</label>
                <InputTextarea
                  id="statistics"
                  value={formData.statistics}
                  onChange={(e) => handleChange('statistics', e.target.value)}
                  rows={10}
                  className="w-full font-mono"
                />
                <small className="block mt-1 text-gray-600">Enter player statistics in JSON format</small>
              </div>
            </TabPanel>
          </TabView>

          <Button
            type="submit"
            disabled={saving}
            className="w-full"
            icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
            label={saving ? 'Saving...' : 'Save Changes'}
          />
        </form>
      </div>
    </Card>
  );
};