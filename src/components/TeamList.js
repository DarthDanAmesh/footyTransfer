import React, { useEffect, useState } from 'react';
import { getTeams, deleteTeam } from './api';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Image } from 'primereact/image';

function TeamList() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchTeams() {
            try {
                setLoading(true);
                const data = await getTeams();
                setTeams(data);
            } catch (err) {
                setError('Failed to load teams. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchTeams();
    }, []);

    const handleDelete = async (teamId) => {
        try {
            await deleteTeam(teamId);
            setTeams(teams.filter(team => team.id !== teamId));
        } catch (err) {
            setError('Failed to delete team. Please try again.');
        }
    };

    const handleEdit = (teamId) => {
        navigate(`/teams/edit/${teamId}`);
    };

    // Custom template for the logo column
    const logoTemplate = (rowData) => {
        return rowData.team_logo ? (
            <Image
                src={rowData.team_logo}
                alt={rowData.name}
                width="40"
                height="40"
                className="rounded-full"
                preview
            />
        ) : null;
    };

    // Custom template for the actions column
    const actionsTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    size="small"
                    onClick={() => handleEdit(rowData.id)}
                    tooltip="Edit"
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    size="small"
                    onClick={() => handleDelete(rowData.id)}
                    tooltip="Delete"
                />
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <ProgressSpinner
                    style={{ width: '50px', height: '50px' }}
                    strokeWidth="4"
                    animationDuration=".5s"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Message severity="error" text={error} style={{ width: '100%' }} />
            </div>
        );
    }

    const header = (
        <div className="text-xl font-bold">Team List</div>
    );

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <DataTable
                value={teams}
                header={header}
                stripedRows
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                tableStyle={{ minWidth: '50rem' }}
            >
                <Column
                    header="Logo"
                    body={logoTemplate}
                    style={{ width: '100px' }}
                />
                <Column
                    field="name"
                    header="Name"
                    sortable
                />
                <Column
                    field="league"
                    header="League"
                    sortable
                />
                <Column
                    field="founded_year"
                    header="Founded Year"
                    sortable
                />
                <Column
                    header="Actions"
                    body={actionsTemplate}
                    style={{ width: '150px' }}
                />
            </DataTable>
        </Card>
    );
}

export default TeamList;