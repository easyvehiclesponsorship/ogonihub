// AUTHENTICATION & USER MANAGEMENT
let userProfile = {};

// Initialize Supabase client
const supabaseUrl = "https://prkvtxqhuvfbekapeltm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBya3Z0eHFodXZmYmVrYXBlbHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDYzMzQsImV4cCI6MjA5Mjc4MjMzNH0.C5e7kPILz52eIQCuwwcg6cNLhA-hqyqRVmit5HR-0J0";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Check authentication status
async function checkAuth() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
      // User is logged in via Supabase Auth
      await fetchUserProfile(user.id, user.email);
    } else {
      // Check localStorage for profile
      const storedProfile = localStorage.getItem('ogonijobhub_profile');
      if (storedProfile) {
        userProfile = JSON.parse(storedProfile);
      } else {
        // No user found, redirect to login
        redirectToLogin();
      }
    }
  } catch (error) {
    console.error('Auth check error:', error);
    redirectToLogin();
  }
}

// Fetch user profile from database
async function fetchUserProfile(userId, email) {
  try {
    // First try to fetch by user_id
    let { data: profile, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If not found, try by email
    if (!profile || error) {
      ({ data: profile, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', email)
        .single());
    }

    if (profile) {
      userProfile = profile;
      localStorage.setItem('ogonijobhub_profile', JSON.stringify(userProfile));
    } else {
      console.warn('No profile found for user:', userId, email);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
}

// Create or update user profile
async function createUserProfile(userData) {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;

    userProfile = data;
    localStorage.setItem('ogonijobhub_profile', JSON.stringify(userProfile));
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

// Update user profile
async function updateUserProfile(updates) {
  try {
    if (!userProfile.id) {
      throw new Error('No user profile found');
    }

    const { data, error } = await supabaseClient
      .from('users')
      .update(updates)
      .eq('id', userProfile.id)
      .select()
      .single();

    if (error) throw error;

    userProfile = { ...userProfile, ...data };
    localStorage.setItem('ogonijobhub_profile', JSON.stringify(userProfile));
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Logout
async function logout() {
  try {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('ogonijobhub_profile');
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Helper function to redirect to login
function redirectToLogin() {
  window.location.href = 'login.html';
}

// Helper function to get initials from name
function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time ago
function formatTimeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  
  return 'just now';
}
