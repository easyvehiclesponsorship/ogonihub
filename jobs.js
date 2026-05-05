// JOBS PAGE FUNCTIONALITY
let allJobs = [];
let filteredJobs = [];

async function initJobs() {
  await loadJobs();
  setupEventListeners();
}

async function loadJobs(query = '') {
  try {
    const jobsList = document.getElementById('jobs-list');
    jobsList.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    `;

    let queryBuilder = supabaseClient.from('jobs').select('*');

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: jobs, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) {
      jobsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <p>Error loading jobs. Please try again.</p>
        </div>
      `;
      return;
    }

    allJobs = jobs || [];
    filteredJobs = allJobs;

    if (allJobs.length === 0) {
      jobsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>No jobs found. Try a different search!</p>
        </div>
      `;
      return;
    }

    renderJobs(filteredJobs);
  } catch (error) {
    console.error('Error loading jobs:', error);
  }
}

function renderJobs(jobs) {
  const jobsList = document.getElementById('jobs-list');

  if (jobs.length === 0) {
    jobsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>No jobs matching your search</p>
      </div>
    `;
    return;
  }

  jobsList.innerHTML = jobs
    .map(job => {
      const postedDate = new Date(job.created_at).toLocaleDateString();
      return `
        <div class="job-card">
          <div class="job-title">${job.title || 'Job Title'}</div>
          <div class="job-company">${job.company || 'Company Name'}</div>
          <div class="job-description">${job.description || 'No description available'}</div>
          
          <div class="job-meta">
            ${job.location ? `<span class="job-meta-item">📍 ${job.location}</span>` : ''}
            ${job.job_type ? `<span class="job-type">${job.job_type}</span>` : ''}
            ${job.salary ? `<span class="job-meta-item">💰 ${job.salary}</span>` : ''}
            <span class="job-meta-item">📅 ${postedDate}</span>
          </div>

          <div class="job-actions">
            <button class="job-action-btn" onclick="saveJob('${job.id}')">Save</button>
            <button class="job-action-btn apply" onclick="applyJob('${job.id}')">Apply Now</button>
          </div>
        </div>
      `;
    })
    .join('');
}

function setupEventListeners() {
  // Search functionality
  const jobSearchInput = document.getElementById('job-search-input');
  const jobSearchBtn = document.getElementById('job-search-btn');

  jobSearchBtn.addEventListener('click', () => {
    const query = jobSearchInput.value.trim();
    loadJobs(query);
  });

  jobSearchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      const query = jobSearchInput.value.trim();
      loadJobs(query);
    }
  });

  // Bottom navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (!btn.classList.contains('create-btn')) {
      btn.addEventListener('click', () => {
        const page = btn.getAttribute('data-page');
        handleNavigation(page);
      });
    }
  });

  // Create post button
  document.querySelector('.nav-btn.create-btn').addEventListener('click', () => {
    handleNavigation('post');
  });
}

function saveJob(jobId) {
  alert('Job saved! (Feature coming soon)');
  // TODO: Implement save job functionality
}

function applyJob(jobId) {
  alert('Apply for this job! (Feature coming soon)');
  // TODO: Implement apply job functionality
}

function handleNavigation(page) {
  const pages = {
    'home': 'index.html',
    'jobs': 'jobs.html',
    'messages': 'messages.html',
    'profile': 'profile.html',
    'post': 'post.html'
  };

  if (pages[page]) {
    window.location.href = pages[page];
  }
}

// Initialize when auth is ready
window.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  if (userProfile) {
    initJobs();
  }
});
