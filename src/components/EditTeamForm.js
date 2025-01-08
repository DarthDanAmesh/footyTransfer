import { getTeam, updateTeam } from './api';
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';

export const EditTeamForm = ({ teamId, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    team_logo: '',
    description: '',
    founded_year: '',
    home_stadium: '',
    league: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchTeam() {
      try {
        setLoading(true);
        setError(null);
        const team = await getTeam(teamId);
        setFormData({
          name: team.name || '',
          team_logo: team.team_logo || '',
          description: team.description || '',
          founded_year: team.founded_year || '',
          home_stadium: team.home_stadium || '',
          league: team.league || ''
        });
      } catch (err) {
        setError('Failed to load team data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [teamId]);

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
      await updateTeam(teamId, formData);
      onUpdate();
    } catch (err) {
      setError('Failed to update team. Please try again.');
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
      <h2 className="text-xl font-bold">Edit Team</h2>
      <p className="text-sm text-gray-600">Update team information and settings</p>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {header}
      <div className="p-4">
        {error && (
          <Message severity="error" text={error} className="mb-4 w-full" />
        )}

        <form onSubmit={handleSubmit} className="flex flex-column gap-4">
          <div className="field">
            <label htmlFor="name" className="block font-bold mb-2">Team Name</label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="team_logo" className="block font-bold mb-2">Logo URL</label>
            <InputText
              id="team_logo"
              value={formData.team_logo}
              onChange={(e) => handleChange('team_logo', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="description" className="block font-bold mb-2">Description</label>
            <InputText
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label htmlFor="founded_year" className="block font-bold mb-2">Founded Year</label>
              <InputNumber
                id="founded_year"
                value={formData.founded_year}
                onValueChange={(e) => handleChange('founded_year', e.value)}
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="league" className="block font-bold mb-2">League</label>
              <InputText
                id="league"
                value={formData.league}
                onChange={(e) => handleChange('league', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="home_stadium" className="block font-bold mb-2">Home Stadium</label>
            <InputText
              id="home_stadium"
              value={formData.home_stadium}
              onChange={(e) => handleChange('home_stadium', e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            icon={saving ? "pi pi-spin pi-spinner" : "pi pi-save"}
            label={saving ? "Saving..." : "Save Changes"}
            className="w-full"
          />
        </form>
      </div>
    </Card>
  );
};