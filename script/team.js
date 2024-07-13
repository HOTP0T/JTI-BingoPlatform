import { supabase } from './supabase.js';

export async function createTeam(name) {
  const { data, error } = await supabase
    .from('teams')
    .insert([{ name: name }]);
  if (error) {
    console.error(error);
    alert('Failed to create team');
  } else {
    console.log('Team created:', data);
    alert('Team created successfully');
  }
}

export async function addUserToTeam(teamId, userId) {
  const { data, error } = await supabase
    .from('team_members')
    .insert([{ team_id: teamId, user_id: userId }]);
  if (error) {
    console.error(error);
    alert('Failed to add user to team');
  } else {
    console.log('User added to team:', data);
    alert('User added to team successfully');
  }
}