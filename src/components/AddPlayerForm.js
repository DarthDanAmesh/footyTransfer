import React, { useState } from 'react';
import { addPlayer } from './api';
import { Upload } from 'lucide-react';

function AddPlayerForm() {
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
    sell_on_clause: false,
    sell_on_percentage: '',
    signing_date: '',
    nationality: '',
    nationality_flag: '',
    player_image: ''
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const positions = [
    'Goalkeeper',
    'Defender',
    'Midfielder',
    'Forward'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.player_image;

      if (file) {
        const imageFormData = new FormData();
        imageFormData.append('file', file);

        const uploadResponse = await fetch('http://localhost:5000/upload_player_image', {
          method: 'POST',
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const { image_url } = await uploadResponse.json();
          imageUrl = image_url;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      await addPlayer({
        ...formData,
        player_image: imageUrl,
        statistics: JSON.parse(formData.statistics),
        sell_on_percentage: formData.sell_on_clause ? parseFloat(formData.sell_on_percentage) : null
      });

      // Reset form
      setFormData({
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
        sell_on_clause: false,
        sell_on_percentage: '',
        signing_date: '',
        nationality: '',
        nationality_flag: '',
        player_image: ''
      });
      setFile(null);
      setPreview(null);

      alert('Player added successfully!');
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Position</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Team</label>
              <input
                type="text"
                name="team"
                value={formData.team}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contract Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contract Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contract Duration</label>
                <input
                  type="number"
                  name="contract_duration"
                  value={formData.contract_duration}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Years Left</label>
                <input
                  type="number"
                  name="years_left"
                  value={formData.years_left}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="block w-full pl-7 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Important Dates</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contract Start</label>
                <input
                  type="date"
                  name="contract_start_date"
                  value={formData.contract_start_date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Signing Date</label>
                <input
                  type="date"
                  name="signing_date"
                  value={formData.signing_date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Loan Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Loan Status</h3>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="on_loan"
                checked={formData.on_loan}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Player is on loan</label>
            </div>

            {formData.on_loan && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Loan Team</label>
                <input
                  type="text"
                  name="loan_team"
                  value={formData.loan_team}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Sell-on Clause */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sell-on Clause</h3>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="sell_on_clause"
                checked={formData.sell_on_clause}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Include sell-on clause</label>
            </div>

            {formData.sell_on_clause && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Sell-on Percentage</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="sell_on_percentage"
                    value={formData.sell_on_percentage}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    className="block w-full pr-8 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-6">
        {/* Player Image Upload */}
        <div>
          <h3 className="text-lg font-medium mb-4">Player Image</h3>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg"
                />
              ) : (
                <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <label className="block">
                <span className="sr-only">Choose player photo</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-medium mb-2">Statistics</h3>
          <textarea
            name="statistics"
            value={formData.statistics}
            onChange={handleChange}
            required
            rows="4"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter player statistics in JSON format"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Adding Player...' : 'Add Player'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddPlayerForm;