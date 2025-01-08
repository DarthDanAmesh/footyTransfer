import React, { useState } from 'react';
import { addTeam } from './api';

function AddTeamForm() {
  const [formData, setFormData] = useState({
    name: '',
    team_logo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTeam(formData);
    alert('Team added successfully!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Team Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="team_logo"
        placeholder="Team Logo URL"
        value={formData.team_logo}
        onChange={handleChange}
      />
      <button type="submit">Add Team</button>
    </form>
  );
}

export default AddTeamForm;