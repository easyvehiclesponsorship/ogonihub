document.addEventListener("DOMContentLoaded", function() {
    // --- Supabase config ---
    const supabaseUrl = "https://prkvtxqhuvfbekapeltm.supabase.co";    
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBya3Z0eHFodXZmYmVrYXBlbHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDYzMzQsImV4cCI6MjA5Mjc4MjMzNH0.C5e7kPILz52eIQCuwwcg6cNLhA-hqyqRVmit5HR-0J0";
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    let allProfessionals = [];
    let currentUser = null;

    // Get current user from auth
    async function getCurrentUser() {
        const { data, error } = await supabaseClient.auth.getUser();
        if (error) {
            console.error("Auth error:", error);
            return null;
        }
        return data.user;
    }

    // Fetch user profile from localStorage first, then Supabase
    async function fetchUserProfile() {
        try {
            const user = await getCurrentUser();
            if (!user) {
                console.log("No authenticated user found");
                return null;
            }

            currentUser = user;
            console.log("Current user:", user.id);

            // First, try localStorage (saved during signup)
            const savedProfile = localStorage.getItem('ogonijobhub_profile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                console.log("Profile loaded from localStorage:", profile);
                return profile;
            }

            // If not in localStorage, fetch from Supabase
            // Query by user_id column, not as a filter
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows

            if (error) {
                console.error("Error fetching from Supabase:", error);
                return null;
            }

            if (data) {
                console.log("Profile loaded from Supabase:", data);
                // Save to localStorage for future use
                localStorage.setItem('ogonijobhub_profile', JSON.stringify(data));
                return data;
            }

            // Fallback to auth metadata
            console.log("Profile not found. Using auth metadata instead.");
            return {
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email,
                hometown: 'Nigeria',
                field: 'Professional'
            };

        } catch (err) {
            console.error("Error in fetchUserProfile:", err);
            return null;
        }
    }

    // Fetch all professionals
    async function fetchProfessionals() {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .neq('user_id', currentUser?.id || 'null'); // Exclude current user

            if (error) {
                console.error("Error fetching professionals:", error);
                return [];
            }

            allProfessionals = data || [];
            console.log("Professionals fetched:", allProfessionals.length);
            return allProfessionals;
        } catch (err) {
            console.error("Error in fetchProfessionals:", err);
            return [];
        }
    }

    // Get initials from name
    function getInitials(name) {
        return name
            .split(' ')
            .map(n => n.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    }

    // Generate avatar color based on name
    function getAvatarColor(name) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    // Generate random rating
    function getRandomRating() {
        const rating = (Math.random() * (5 - 4) + 4).toFixed(1);
        const reviews = Math.floor(Math.random() * (200 - 50) + 50);
        return { rating, reviews };
    }

    // Display user info
    function displayUserInfo(profile) {
        if (!profile) return;

        document.getElementById('user-name').textContent = profile.full_name || 'User';
        document.getElementById('user-location').textContent = profile.hometown || profile.state || 'Nigeria';
    }

    // Display categories
    function displayCategories() {
        const categories = [
            { name: 'Plumber', icon: 'fa-faucet', color: 'blue' },
            { name: 'Electrician', icon: 'fa-bolt', color: 'orange' },
            { name: 'Carpenter', icon: 'fa-hammer', color: 'gray' },
            { name: 'Painter', icon: 'fa-paint-roller', color: 'red' },
            { name: 'Software Developer', icon: 'fa-laptop', color: 'dark' }
        ];

        const grid = document.getElementById('categories-grid');
        grid.innerHTML = categories
            .map(cat => `
                <div class="cat-item" onclick="filterByCategory('${cat.name}')">
                    <div class="icon-box ${cat.color}">
                        <i class="fa-solid ${cat.icon}"></i>
                    </div>
                    <span>${cat.name}</span>
                </div>
            `)
            .join('');
    }

    // Filter professionals by category
    window.filterByCategory = function(category) {
        const filtered = allProfessionals.filter(pro => pro.field === category);
        displayProfessionals(filtered);
        
        // Scroll to professionals section
        document.getElementById('pro-list').scrollIntoView({ behavior: 'smooth' });
    };

    // Search professionals
    document.getElementById('search-input')?.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        if (!query) {
            displayProfessionals(allProfessionals);
            return;
        }

        const filtered = allProfessionals.filter(pro =>
            pro.full_name.toLowerCase().includes(query) ||
            pro.field?.toLowerCase().includes(query) ||
            pro.hometown?.toLowerCase().includes(query) ||
            pro.lga?.toLowerCase().includes(query)
        );

        displayProfessionals(filtered);
    });

    // Display professionals
    function displayProfessionals(professionals) {
        const list = document.getElementById('pro-list');
        
        if (professionals.length === 0) {
            list.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No professionals found</p>';
            return;
        }

        list.innerHTML = professionals
            .map(pro => {
                const initials = getInitials(pro.full_name);
                const avatarColor = getAvatarColor(pro.full_name);
                const { rating, reviews } = getRandomRating();

                return `
                    <div class="pro-card">
                        <div class="pro-img" style="background-color: ${avatarColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2em;">
                            ${initials}
                        </div>
                        <div class="pro-details">
                            <div class="pro-name">
                                ${pro.full_name}
                                <i class="fa-solid fa-circle-check badge"></i>
                            </div>
                            <p class="pro-title">${pro.field || 'Professional'}</p>
                            <div class="pro-rating">
                                <i class="fa-solid fa-star"></i> ${rating} <span>(${reviews} reviews)</span>
                            </div>
                            <p class="pro-loc">
                                <i class="fa-solid fa-location-dot"></i> 
                                ${pro.hometown || pro.state || 'Nigeria'}
                            </p>
                        </div>
                        <div class="pro-actions">
                            <i class="fa-regular fa-heart heart-icon"></i>
                            <button class="view-btn">View Profile</button>
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    // Initialize dashboard
    async function initDashboard() {
        try {
            // Fetch user profile
            const profile = await fetchUserProfile();
            displayUserInfo(profile);

            // Fetch professionals
            await fetchProfessionals();

            // Display categories
            displayCategories();

            // Display all professionals
            displayProfessionals(allProfessionals);

            console.log("Dashboard initialized successfully");
        } catch (err) {
            console.error("Error initializing dashboard:", err);
        }
    }

    // Start initialization
    initDashboard();
});
