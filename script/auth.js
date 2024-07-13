import { supabase } from './supabase.js';

async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });
  if (error) {
    console.error(error);
    alert('Sign up failed');
  } else {
    console.log('User signed up:', data.user);
    alert('Sign up successful');
    window.location.href = 'index.html'; // Redirect to the main page
  }
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) {
    console.error(error);
    alert('Sign in failed');
  } else {
    console.log('User signed in:', data.user);
    alert('Sign in successful');
    window.location.href = 'index.html'; // Redirect to the main page
  }
}

document.querySelector('#signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  await signUp(email, password);
});

document.querySelector('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  await signIn(email, password);
});