import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import PlayerStatistics from './PlayerStatistics';

function PlayerDetails({ player, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <div className="p-4">
          <div className="mb-4">
            <Skeleton width="33%" height="2rem" className="mb-2" />
            <Skeleton width="50%" height="1.5rem" />
          </div>
          <div className="space-y-4">
            <Skeleton width="100%" height="1.5rem" />
            <Skeleton width="100%" height="1.5rem" />
            <Skeleton width="100%" height="1.5rem" />
            <Skeleton width="100%" height="300px" />
          </div>
        </div>
      </Card>
    );
  }

  if (!player) {
    return (
      <Card title="Player Details">
        <p className="text-500">No player data available.</p>
      </Card>
    );
  }

  const header = (
    <div className="mb-3">
      <h2 className="text-2xl font-bold m-0">{player.name}</h2>
      <p className="text-500 mt-2 mb-0">Professional Football Player</p>
    </div>
  );

  return (
    <Card>
      {header}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-500 text-sm mb-2">Position</p>
            <Tag
              value={player.position}
              severity="info"
              className="p-tag-rounded"
            />
          </div>
          <div>
            <p className="text-500 text-sm mb-2">Team</p>
            <p className="font-medium">{player.team}</p>
          </div>
        </div>

        <Divider className="my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-500 text-sm mb-2">Price</p>
            <p className="font-medium">
              ${typeof player.price === 'number'
                ? player.price.toLocaleString()
                : player.price}
            </p>
          </div>
          <div>
            <p className="text-500 text-sm mb-2">Jersey Number</p>
            <p className="font-medium">{player.jersey_number}</p>
          </div>
        </div>

        <Divider className="my-4" />

        <div>
          <p className="text-500 text-sm mb-3">Statistics</p>
          <PlayerStatistics statistics={player.statistics} />
        </div>
      </div>
    </Card>
  );
}

PlayerDetails.defaultProps = {
  player: null,
  isLoading: false,
};

export default PlayerDetails;