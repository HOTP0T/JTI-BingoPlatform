import { supabase } from './supabase.js';

export async function createBingoCard(teamId, card) {
  const { data, error } = await supabase
    .from('bingo_cards')
    .insert([{ team_id: teamId, card: card }]);
  if (error) {
    console.error(error);
    alert('Failed to create bingo card');
  } else {
    console.log('Bingo card created:', data);
    alert('Bingo card created successfully');
  }
}

export async function updateBingoCard(cardId, card) {
  const { data, error } = await supabase
    .from('bingo_cards')
    .update({ card: card })
    .eq('id', cardId);
  if (error) {
    console.error(error);
    alert('Failed to update bingo card');
  } else {
    console.log('Bingo card updated:', data);
    alert('Bingo card updated successfully');
  }
}