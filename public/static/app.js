// Sports Tracker Mobile Web App
class SportsTracker {
  constructor() {
    this.currentUser = null;
    this.currentView = 'dashboard';
    this.previousView = 'dashboard';
    this.children = [];
    this.events = [];
    this.sports = [];
    this.teams = [];
    
    this.init();
  }

  async init() {
    console.log('Initializing Sports Tracker...');
    
    // Check for stored user session
    const storedUser = localStorage.getItem('sportsTracker_user');
    console.log('Stored user session:', storedUser);
    
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        console.log('Loaded current user:', this.currentUser);
        await this.loadUserData();
        this.showDashboard();
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('sportsTracker_user');
        this.showAuth();
      }
    } else {
      console.log('No stored user session, showing auth');
      this.showAuth();
    }
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Navigation
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-nav]') || e.target.closest('[data-nav]')) {
        e.preventDefault();
        const target = e.target.matches('[data-nav]') ? e.target : e.target.closest('[data-nav]');
        const view = target.dataset.nav;
        this.navigateTo(view);
      }
      
      // Back button functionality
      if (e.target.matches('[data-back]') || e.target.closest('[data-back]')) {
        e.preventDefault();
        this.goBack();
      }

      // User menu dropdown toggle
      if (e.target.matches('.user-menu-toggle') || e.target.closest('.user-menu-toggle')) {
        e.preventDefault();
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
          dropdown.classList.toggle('hidden');
        }
      }

      // Close dropdown when clicking outside
      if (!e.target.closest('.user-menu-toggle') && !e.target.closest('.user-dropdown')) {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
          dropdown.classList.add('hidden');
        }
      }
    });

    // Forms
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#loginForm')) {
        e.preventDefault();
        this.handleLogin(e.target);
      } else if (e.target.matches('#registerForm')) {
        e.preventDefault();
        this.handleRegister(e.target);
      } else if (e.target.matches('#addChildForm')) {
        e.preventDefault();
        this.handleAddChild(e.target);
      } else if (e.target.matches('#addEventForm')) {
        e.preventDefault();
        this.handleAddEvent(e.target);
      }
    });

    // Attendance updates
    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-attendance]')) {
        this.updateAttendance(e.target);
      }
    });
  }

  navigateTo(view) {
    // Save previous view for back button (except for logout)
    if (view !== 'logout') {
      this.previousView = this.currentView;
    }
    
    this.currentView = view;
    switch (view) {
      case 'dashboard':
        this.showDashboard();
        break;
      case 'calendar':
        this.showCalendar();
        break;
      case 'children':
        this.showChildren();
        break;
      case 'add-event':
        this.showAddEvent();
        break;
      case 'team-management':
        this.showTeamManagement();
        break;
      case 'notifications':
        this.showNotifications();
        break;
      case 'events-management':
        this.showEventsManagement();
        break;
      case 'logout':
        this.logout();
        break;
    }
    this.updateNavigation();
  }

  goBack() {
    // Navigate to previous view, defaulting to dashboard
    const backView = this.previousView || 'dashboard';
    this.navigateTo(backView);
  }

  updateNavigation() {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.nav === this.currentView) {
        item.classList.add('active');
      }
    });
  }

  showAuth() {
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="max-w-md w-full space-y-8">
          <div class="text-center">
            <i class="fas fa-trophy text-6xl text-blue-600 mb-4"></i>
            <h1 class="text-3xl font-bold text-gray-900">Sports Tracker</h1>
            <p class="mt-2 text-gray-600">Manage your family's sports activities</p>
          </div>
          
          <div class="bg-white p-8 rounded-xl shadow-lg">
            <div class="mb-6">
              <div class="flex border-b">
                <button class="flex-1 pb-2 px-4 text-center auth-tab active" data-tab="login">Login</button>
                <button class="flex-1 pb-2 px-4 text-center auth-tab" data-tab="register">Register</button>
              </div>
            </div>
            
            <div id="loginTab" class="auth-content">
              <form id="loginForm" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" required class="form-input w-full px-3 py-2 rounded-lg" placeholder="parent@example.com" value="parent@example.com">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" name="password" required class="form-input w-full px-3 py-2 rounded-lg" value="password">
                </div>
                <button type="submit" class="btn-primary w-full py-3 px-4 rounded-lg font-medium text-white">
                  Sign In
                </button>
                <p class="text-xs text-gray-500 text-center">Demo: parent@example.com / password</p>
              </form>
            </div>
            
            <div id="registerTab" class="auth-content hidden">
              <form id="registerForm" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="name" required class="form-input w-full px-3 py-2 rounded-lg" placeholder="Parent Name">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" required class="form-input w-full px-3 py-2 rounded-lg" placeholder="parent@example.com">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" name="password" required class="form-input w-full px-3 py-2 rounded-lg">
                </div>
                <button type="submit" class="btn-primary w-full py-3 px-4 rounded-lg font-medium text-white">
                  Create Account
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    // Auth tab switching
    document.addEventListener('click', (e) => {
      if (e.target.matches('.auth-tab')) {
        const tab = e.target.dataset.tab;
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-content').forEach(c => c.classList.add('hidden'));
        e.target.classList.add('active');
        document.getElementById(tab + 'Tab').classList.remove('hidden');
      }
    });
  }

  async handleLogin(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    console.log('Attempting login with:', data);

    try {
      const response = await axios.post('/api/auth/login', data);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        this.currentUser = response.data.user;
        localStorage.setItem('sportsTracker_user', JSON.stringify(this.currentUser));
        console.log('User logged in and saved:', this.currentUser);
        
        await this.loadUserData();
        this.showDashboard();
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  async handleRegister(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
      const response = await axios.post('/api/auth/register', data);
      if (response.data.success) {
        alert('Account created successfully! Please log in.');
        document.querySelector('[data-tab=\"login\"]').click();
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  async loadUserData() {
    if (!this.currentUser) return;

    try {
      // Load children
      const childrenResponse = await axios.get(`/api/children/${this.currentUser.id}`);
      this.children = childrenResponse.data;

      // Load sports
      const sportsResponse = await axios.get('/api/sports');
      this.sports = sportsResponse.data;

      // Load upcoming events for all children
      const eventsResponse = await axios.get(`/api/calendar/${this.currentUser.id}`);
      this.events = eventsResponse.data;
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  // Helper function to get team-specific CSS class based on team name
  getTeamCssClass(teamName) {
    if (!teamName) return '';
    const name = teamName.toLowerCase();
    
    if (name.includes('mba') && name.includes('baseball')) return 'team-card mba-baseball';
    if (name.includes('rockvale') && name.includes('football')) return 'team-card rockvale-football';
    if (name.includes('rockvale') && name.includes('archery')) return 'team-card rockvale-archery';
    if (name.includes('rockvale') && (name.includes('soccer') || name.includes('rockets'))) return 'team-card rockvale-soccer';
    if (name.includes('rockvale') && name.includes('track')) return 'team-card rockvale-track';
    if (name.includes('tennessee') && name.includes('soccer')) return 'team-card tennessee-soccer';
    
    // Default team card styling
    return 'team-card';
  }

  // Helper function to set page-specific body class based on current sport/team focus
  setPageBackground(context = 'default') {
    const bodyClasses = ['app-background'];
    
    // If default context, determine sport from current events/teams
    if (context === 'default') {
      const sportCounts = {
        soccer: 0,
        football: 0,
        baseball: 0,
        track: 0,
        archery: 0
      };
      
      // Count sports from events
      this.events.forEach(event => {
        const teamName = event.team_name.toLowerCase();
        if (teamName.includes('soccer')) sportCounts.soccer++;
        else if (teamName.includes('football')) sportCounts.football++;
        else if (teamName.includes('baseball')) sportCounts.baseball++;
        else if (teamName.includes('track')) sportCounts.track++;
        else if (teamName.includes('archery')) sportCounts.archery++;
      });
      
      // Also count from children's teams
      this.children.forEach(child => {
        child.teams.forEach(team => {
          const teamName = team.team_name.toLowerCase();
          if (teamName.includes('soccer')) sportCounts.soccer++;
          else if (teamName.includes('football')) sportCounts.football++;
          else if (teamName.includes('baseball')) sportCounts.baseball++;
          else if (teamName.includes('track')) sportCounts.track++;
          else if (teamName.includes('archery')) sportCounts.archery++;
        });
      });
      
      // Find dominant sport
      const dominantSport = Object.keys(sportCounts).reduce((a, b) => 
        sportCounts[a] > sportCounts[b] ? a : b
      );
      
      if (sportCounts[dominantSport] > 0) {
        context = dominantSport;
      }
    }
    
    if (context === 'soccer') bodyClasses.push('page-soccer');
    else if (context === 'football') bodyClasses.push('page-football');
    else if (context === 'baseball') bodyClasses.push('page-baseball');
    else if (context === 'track') bodyClasses.push('page-track');
    else if (context === 'archery') bodyClasses.push('page-archery');
    
    document.body.className = bodyClasses.join(' ');
  }

  showDashboard() {
    const upcomingEvents = this.events.slice(0, 5);
    
    // Add body class for team-specific styling
    document.body.className = 'app-background';
    
    document.getElementById('app').innerHTML = `
      <div class="mobile-container pb-20">
        <!-- Floating team logos background -->
        <div class="dashboard-floating-logos">
          <div class="floating-logo"></div>
          <div class="floating-logo"></div>
          <div class="floating-logo"></div>
          <div class="floating-logo"></div>
        </div>
        
        <!-- Enhanced Header with User Menu -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-1">
                <i class="fas fa-trophy text-blue-600 mr-2"></i>
                Welcome back, ${this.currentUser.name}!
              </h1>
              <p class="text-gray-600">Manage your family's sports activities</p>
            </div>
            <!-- User Profile Menu -->
            <div class="relative">
              <button class="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 user-menu-toggle">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  ${this.currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span class="text-sm font-medium text-gray-700">${this.currentUser.name}</span>
                <i class="fas fa-chevron-down text-xs text-gray-400"></i>
              </button>
              <!-- Dropdown Menu -->
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 user-dropdown hidden">
                <div class="py-2">
                  <div class="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    Signed in as<br>
                    <span class="font-medium text-gray-700">${this.currentUser.email}</span>
                  </div>
                  <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <i class="fas fa-user mr-2 text-gray-400"></i>
                    Profile Settings
                  </button>
                  <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <i class="fas fa-cog mr-2 text-gray-400"></i>
                    App Preferences
                  </button>
                  <div class="border-t border-gray-100 my-1"></div>
                  <button class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center" data-nav="logout">
                    <i class="fas fa-sign-out-alt mr-2 text-red-500"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow" data-nav="children">
            <div class="text-2xl font-bold text-blue-600">${this.children.length}</div>
            <div class="text-sm text-gray-600">Children</div>
            <div class="text-xs text-gray-400 mt-1">
              <i class="fas fa-mouse-pointer mr-1"></i>
              Click to manage
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow" data-nav="events-management">
            <div class="text-2xl font-bold text-green-600">${this.events.length}</div>
            <div class="text-sm text-gray-600">Upcoming Events</div>
            <div class="text-xs text-gray-400 mt-1">
              <i class="fas fa-mouse-pointer mr-1"></i>
              Click to manage
            </div>
          </div>
        </div>

        <!-- Calendar Integration Highlight -->
        <div class="mb-6">
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-bold mb-2">
                  <i class="fas fa-magic mr-2"></i>
                  Auto-Import Team Calendars
                </h3>
                <p class="text-blue-100 text-sm mb-3">
                  Stop manually entering events! Get calendar URLs from coaches and sync entire season schedules instantly.
                </p>
                <div class="flex items-center text-blue-100 text-xs">
                  <i class="fas fa-check-circle mr-2"></i>
                  <span>Works with TeamSnap, SportsEngine, LeagueApps & more</span>
                </div>
              </div>
              <div class="ml-4">
                <button data-nav="team-management" class="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  <i class="fas fa-calendar-plus mr-2"></i>
                  Set Up Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Children Overview -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Your Children</h2>
          <div class="space-y-3">
            ${this.children.map(child => `
              <div class="bg-white p-4 rounded-lg shadow-md">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium text-gray-900">${child.name}</h3>
                    <p class="text-sm text-gray-600">${child.teams.length} teams</p>
                  </div>
                  <div class="flex -space-x-1">
                    ${child.teams.slice(0, 3).map(team => `
                      <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 border-2 border-white">
                        ${team.sport_name.charAt(0)}
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="mt-2 flex flex-wrap gap-1">
                  ${child.teams.map(team => `
                    <span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      ${team.team_name}${team.jersey_number ? ` (#${team.jersey_number})` : ''}
                    </span>
                  `).join('')}
                </div>
                ${child.teams.length > 0 ? `
                  <div class="mt-3">
                    <button data-nav="team-management" class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      <i class="fas fa-sync-alt mr-1"></i>Set up calendar sync for teams
                    </button>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          ${this.children.length === 0 ? `
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-user-plus text-4xl mb-4"></i>
              <p>No children added yet</p>
              <button data-nav="children" class="mt-2 text-blue-600 hover:text-blue-800">Add your first child</button>
            </div>
          ` : ''}
        </div>

        <!-- Upcoming Events -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Upcoming Events</h2>
          <div class="space-y-3">
            ${upcomingEvents.map(event => `
              <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 ${this.getTeamCssClass(event.team_name)}">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="event-${event.type} px-2 py-1 text-xs rounded-full">${event.type.toUpperCase()}</span>
                      <span class="text-sm text-gray-600">${event.team_name}</span>
                    </div>
                    <h3 class="font-medium text-gray-900">${event.title}</h3>
                    <p class="text-sm text-gray-600">${event.child_name}${event.jersey_number ? ` (#${event.jersey_number})` : ''}</p>
                    ${event.location ? `<p class="text-sm text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</p>` : ''}
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">${dayjs(event.date).format('MMM D')}</div>
                    <div class="text-sm text-gray-600">${event.start_time}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          ${this.events.length === 0 ? `
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-calendar-plus text-4xl mb-4"></i>
              <p>No upcoming events</p>
            </div>
          ` : ''}
        </div>
      </div>

      ${this.renderMobileNav()}
      ${this.renderFAB()}
    `;
  }

  showCalendar() {
    this.setPageBackground('default');
    document.getElementById('app').innerHTML = `
      <div class="mobile-container pb-20">
        ${this.renderPageHeader('Family Calendar', 'All upcoming events for your children', 'calendar', true)}

        <div class="space-y-4">
          ${this.events.map(event => `
            <div class="bg-white p-4 rounded-lg shadow-md border-l-4 sport-${event.team_name.toLowerCase().includes('soccer') ? 'soccer' : event.team_name.toLowerCase().includes('football') ? 'football' : 'track'} ${this.getTeamCssClass(event.team_name)}">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <span class="event-${event.type} px-2 py-1 text-xs rounded-full">${event.type.toUpperCase()}</span>
                  <span class="ml-2 text-sm text-gray-600">${event.team_name}</span>
                  ${event.source === 'calendar' ? '<i class="fas fa-sync-alt text-blue-500 ml-2 text-xs" title="Imported from team calendar"></i>' : ''}
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">${dayjs(event.date).format('MMM D, YYYY')}</div>
                  <div class="text-sm text-gray-600">${event.start_time}${event.end_time ? ' - ' + event.end_time : ''}</div>
                </div>
              </div>
              
              <h3 class="font-medium text-gray-900 mb-1">${event.title}</h3>
              <p class="text-sm text-gray-600 mb-2">${event.child_name}</p>
              
              ${event.location ? `<p class="text-sm text-gray-500 mb-2"><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</p>` : ''}
              ${event.opponent ? `<p class="text-sm text-gray-500 mb-2"><i class="fas fa-users mr-1"></i>vs ${event.opponent}</p>` : ''}
              
              <div class="flex items-center justify-between">
                <div class="text-sm">
                  <span class="status-${event.attendance_status || 'pending'}">
                    <i class="fas fa-circle text-xs mr-1"></i>
                    ${(event.attendance_status || 'pending').replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        ${this.events.length === 0 ? `
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-calendar-times text-6xl mb-4"></i>
            <p class="text-lg mb-2">No events scheduled</p>
            <p class="text-sm">Sample data is loaded - try logging in!</p>
          </div>
        ` : ''}
      </div>

      ${this.renderMobileNav()}
      ${this.renderFAB()}
    `;
  }

  showChildren() {
    this.setPageBackground('default');
    document.getElementById('app').innerHTML = `
      <div class="mobile-container pb-20">
        ${this.renderPageHeader('Children', 'Manage your children\'s profiles and teams', 'users', true)}

        <div class="space-y-4 mb-6">
          ${this.children.map(child => `
            <div class="bg-white p-6 rounded-lg shadow-md">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <i class="fas fa-user text-blue-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">${child.name}</h3>
                    <p class="text-sm text-gray-600">${child.birth_date ? 'Born ' + dayjs(child.birth_date).format('MMM D, YYYY') : 'Age not set'}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button onclick="sportsTracker.editChild(${child.id})" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Edit Child">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="sportsTracker.deleteChild(${child.id}, '${child.name}')" class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete Child">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div class="mb-3">
                <h4 class="font-medium text-gray-700 mb-2">Teams & Sports</h4>
                <div class="space-y-2">
                  ${child.teams.map(team => `
                    <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg ${this.getTeamCssClass(team.team_name)}">
                      <div class="flex-1">
                        <div class="font-medium text-gray-900">${team.team_name}</div>
                        <div class="text-sm text-gray-600">${team.sport_name}${team.jersey_number ? ' • #' + team.jersey_number : ''}${team.position ? ' • ' + team.position : ''}</div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                        <button onclick="sportsTracker.editTeamAssignment(${child.id}, ${team.team_id})" class="text-blue-600 hover:text-blue-800 p-1 text-xs" title="Edit Jersey/Position">
                          <i class="fas fa-edit"></i>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
                ${child.teams.length === 0 ? `
                  <p class="text-gray-500 text-sm">No teams assigned yet</p>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Team Management Link -->
        <div class="mb-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-blue-900">Team Calendar Integration</h3>
                <p class="text-sm text-blue-700 mt-1">Sync events from team calendars automatically</p>
              </div>
              <button data-nav="team-management" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-calendar-alt mr-2"></i>Manage Teams
              </button>
            </div>
          </div>
        </div>

        <!-- Add Child Form -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="font-semibold text-gray-900 mb-4">Add New Child</h3>
          <form id="addChildForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" required class="form-input w-full px-3 py-2 rounded-lg" placeholder="Child's name">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date (Optional)</label>
              <input type="date" name="birth_date" class="form-input w-full px-3 py-2 rounded-lg">
            </div>
            <div class="flex gap-3">
              <button type="button" onclick="document.getElementById('addChildForm').reset()" class="flex-1 py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Clear
              </button>
              <button type="submit" class="flex-1 btn-primary py-3 px-4 rounded-lg font-medium text-white">
                <i class="fas fa-plus mr-2"></i>Add Child
              </button>
            </div>
          </form>
        </div>
      </div>

      ${this.renderMobileNav()}
    `;
  }

  async handleAddChild(form) {
    console.log('handleAddChild called, currentUser:', this.currentUser);
    
    // Check if user is logged in
    if (!this.currentUser || !this.currentUser.id) {
      alert('You must be logged in to add children. Please log in first.');
      this.showAuth();
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.user_id = this.currentUser.id;

    console.log('Adding child with data:', data);

    try {
      const response = await axios.post('/api/children', data);
      if (response.data.success) {
        alert('Child added successfully!');
        await this.loadUserData();
        this.showChildren();
      } else {
        alert('Failed to add child: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Add child error:', error);
      alert('Error adding child: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  showAddEvent() {
    this.setPageBackground('default');
    
    // Get all teams from all children
    const allTeams = [];
    this.children.forEach(child => {
      child.teams.forEach(team => {
        if (!allTeams.find(t => t.team_id === team.team_id)) {
          allTeams.push({
            team_id: team.team_id,
            team_name: team.team_name,
            sport_name: team.sport_name
          });
        }
      });
    });

    document.getElementById('app').innerHTML = `
      <div class="mobile-container pb-20">
        ${this.renderPageHeader('Add Event', 'Schedule a new game, practice, or tournament', 'calendar-plus', true)}

        <div class="bg-white p-6 rounded-lg shadow-md">
          <form id="addEventForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select name="team_id" required class="form-input w-full px-3 py-2 rounded-lg">
                <option value="">Select a team</option>
                ${allTeams.map(team => `
                  <option value="${team.team_id}">${team.team_name} (${team.sport_name})</option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select name="type" required class="form-input w-full px-3 py-2 rounded-lg">
                <option value="">Select type</option>
                <option value="game">Game</option>
                <option value="practice">Practice</option>
                <option value="tournament">Tournament</option>
                <option value="meet">Meet</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" name="title" required class="form-input w-full px-3 py-2 rounded-lg" placeholder="Game vs Eagles, Practice, etc.">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name="event_date" required class="form-input w-full px-3 py-2 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" name="start_time" required class="form-input w-full px-3 py-2 rounded-lg">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" name="location" class="form-input w-full px-3 py-2 rounded-lg" placeholder="Stadium, Field, etc.">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Opponent (For Games)</label>
              <input type="text" name="opponent" class="form-input w-full px-3 py-2 rounded-lg" placeholder="Opposing team name">
            </div>
            
            <div class="flex items-center">
              <input type="checkbox" name="is_home" id="is_home" class="mr-2">
              <label for="is_home" class="text-sm text-gray-700">Home game/event</label>
            </div>
            
            <div class="flex gap-3">
              <button type="button" data-back class="flex-1 py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" class="flex-1 btn-primary py-3 px-4 rounded-lg font-medium text-white">
                <i class="fas fa-plus mr-2"></i>Add Event
              </button>
            </div>
          </form>
        </div>
      </div>

      ${this.renderMobileNav()}
    `;
  }

  async handleAddEvent(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.is_home = formData.has('is_home');

    try {
      const response = await axios.post('/api/events', data);
      if (response.data.success) {
        await this.loadUserData();
        this.navigateTo('calendar');
      } else {
        alert('Failed to add event');
      }
    } catch (error) {
      alert('Error adding event: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  renderMobileNav() {
    return `
      <div class="mobile-nav">
        <div class="flex">
          <div class="mobile-nav-item ${this.currentView === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
            <i class="fas fa-home text-lg mb-1"></i>
            <div class="text-xs">Home</div>
          </div>
          <div class="mobile-nav-item ${this.currentView === 'calendar' ? 'active' : ''}" data-nav="calendar">
            <i class="fas fa-calendar text-lg mb-1"></i>
            <div class="text-xs">Calendar</div>
          </div>
          <div class="mobile-nav-item ${this.currentView === 'children' ? 'active' : ''}" data-nav="children">
            <i class="fas fa-users text-lg mb-1"></i>
            <div class="text-xs">Children</div>
          </div>
          <div class="mobile-nav-item ${this.currentView === 'notifications' ? 'active' : ''}" data-nav="notifications">
            <i class="fas fa-bell text-lg mb-1"></i>
            <div class="text-xs">Alerts</div>
          </div>
          <div class="mobile-nav-item" data-nav="logout">
            <i class="fas fa-sign-out-alt text-lg mb-1"></i>
            <div class="text-xs">Logout</div>
          </div>
        </div>
      </div>
    `;
  }

  renderFAB() {
    return `
      <div class="fab-container">
        <!-- Main FAB -->
        <button class="fab fab-main flex items-center justify-center" onclick="this.parentElement.classList.toggle('open')">
          <i class="fas fa-plus text-xl fab-icon-plus"></i>
          <i class="fas fa-times text-xl fab-icon-close"></i>
        </button>
        
        <!-- FAB Menu Items -->
        <div class="fab-menu">
          <button class="fab fab-item" data-nav="add-event" title="Add Event">
            <i class="fas fa-calendar-plus text-lg"></i>
          </button>
          <button class="fab fab-item" data-nav="team-management" title="Calendar Sync">
            <i class="fas fa-sync-alt text-lg"></i>
          </button>
        </div>
      </div>
    `;
  }

  renderPageHeader(title, subtitle, icon, showBackButton = false) {
    if (showBackButton) {
      return `
        <div class="mb-6">
          <div class="flex items-center mb-4">
            <button data-back class="mr-3 px-4 py-3 bg-cyan-500 text-white hover:bg-cyan-600 rounded-lg transition-colors shadow-lg font-bold text-lg">
              <i class="fas fa-arrow-left text-xl mr-2"></i>← BACK
            </button>
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-1">
                <i class="fas fa-${icon} text-blue-600 mr-2"></i>
                ${title}
              </h1>
              <p class="text-gray-600">${subtitle}</p>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-1">
            <i class="fas fa-${icon} text-blue-600 mr-2"></i>
            ${title}
          </h1>
          <p class="text-gray-600">${subtitle}</p>
        </div>
      `;
    }
  }

  async showTeamManagement() {
    this.setPageBackground('default');
    
    // Get all teams from all children
    const allTeams = [];
    this.children.forEach(child => {
      child.teams.forEach(team => {
        if (!allTeams.find(t => t.team_id === team.team_id)) {
          allTeams.push({
            team_id: team.team_id,
            team_name: team.team_name,
            sport_name: team.sport_name
          });
        }
      });
    });

    // Load team calendar settings
    const teamSettings = {};
    for (const team of allTeams) {
      try {
        const response = await axios.get(`/api/teams/${team.team_id}/sync-status`);
        teamSettings[team.team_id] = response.data;
      } catch (error) {
        console.error('Error loading team settings:', error);
        teamSettings[team.team_id] = {
          calendar_url: '',
          sync_enabled: false,
          last_sync: null,
          imported_events: 0
        };
      }
    }

    document.getElementById('app').innerHTML = `
      <div class="mobile-container pb-20">
        ${this.renderPageHeader('Team Calendar Setup', 'Connect team calendars to auto-import events', 'calendar-alt', true)}

        <!-- Teams Found Status Indicator -->
        <div class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <div class="flex items-center justify-center">
            <i class="fas fa-users text-3xl mr-4"></i>
            <div class="text-center">
              <div class="text-3xl font-bold">${allTeams.length} TEAMS FOUND</div>
              <div class="text-lg">Calendar integration forms are below ↓</div>
            </div>
          </div>
        </div>

        ${allTeams.length === 0 ? `
          <!-- No Teams Available -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div class="flex items-start">
              <i class="fas fa-info-circle text-yellow-600 mt-1 mr-3"></i>
              <div>
                <h3 class="font-medium text-yellow-800 mb-2">No Teams Found</h3>
                <p class="text-sm text-yellow-700 mb-3">
                  You need to add children and assign them to teams before setting up calendar integration.
                </p>
                <div class="space-y-2 text-sm text-yellow-700">
                  <div>1. Go to <strong>Children</strong> tab</div>
                  <div>2. Add your children</div>
                  <div>3. Assign them to their teams</div>
                  <div>4. Come back here to sync team calendars</div>
                </div>
                <button data-nav="children" class="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  <i class="fas fa-arrow-right mr-2"></i>Go to Children
                </button>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Step-by-Step Workflow -->
        <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 class="font-bold text-green-900 mb-4 text-lg">
            <i class="fas fa-magic mr-2"></i>3-Step Calendar Integration
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-lg">
              <div class="text-2xl font-bold text-green-600 mb-2">1</div>
              <h4 class="font-semibold text-gray-800 mb-2">Get Calendar URL</h4>
              <p class="text-sm text-gray-600">Ask your coach for the team calendar link (iCal/ICS format)</p>
            </div>
            <div class="bg-white p-4 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 mb-2">2</div>
              <h4 class="font-semibold text-gray-800 mb-2">Paste & Enable</h4>
              <p class="text-sm text-gray-600">Paste URL below, turn on sync, and save settings</p>
            </div>
            <div class="bg-white p-4 rounded-lg">
              <div class="text-2xl font-bold text-purple-600 mb-2">3</div>
              <h4 class="font-semibold text-gray-800 mb-2">Sync Events</h4>
              <p class="text-sm text-gray-600">Click "Sync Events" to import all team activities</p>
            </div>
          </div>
        </div>

        <!-- How to Get Calendar URLs -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 class="font-medium text-blue-900 mb-3">
            <i class="fas fa-question-circle mr-2"></i>Where to Get Calendar URLs
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold text-blue-800 mb-2">Common Platforms:</h4>
              <div class="space-y-1 text-sm text-blue-700">
                <div>• <strong>TeamSnap:</strong> Team Settings → Calendar → Export</div>
                <div>• <strong>SportsEngine:</strong> Team Page → Export Calendar</div>
                <div>• <strong>LeagueApps:</strong> Calendar → Subscribe</div>
                <div>• <strong>Stack Sports:</strong> Calendar Options</div>
              </div>
            </div>
            <div>
              <h4 class="font-semibold text-blue-800 mb-2">What to Ask For:</h4>
              <div class="space-y-1 text-sm text-blue-700">
                <div>• "Calendar subscription link"</div>
                <div>• "iCal feed URL"</div>
                <div>• "Export calendar link"</div>
                <div>• ".ics file URL"</div>
              </div>
            </div>
          </div>
          <div class="mt-4 p-3 bg-blue-100 rounded text-xs text-blue-700">
            <strong>Example URLs:</strong><br>
            https://go.teamsnap.com/ical/12345/access-key<br>
            https://sportsengine.com/calendar/export/team123.ics
          </div>
        </div>

        <div class="space-y-6">
          ${allTeams.map(team => {
            const settings = teamSettings[team.team_id] || {};
            
            // Find which children are on this team
            const teamChildren = [];
            this.children.forEach(child => {
              const childTeam = child.teams.find(t => t.team_id === team.team_id);
              if (childTeam) {
                teamChildren.push({
                  child_id: child.id,
                  child_name: child.name,
                  jersey_number: childTeam.jersey_number,
                  position: childTeam.position
                });
              }
            });
            
            return `
              <div class="bg-gradient-to-br from-cyan-50 to-teal-50 border-4 border-cyan-300 p-6 rounded-lg shadow-lg ${this.getTeamCssClass(team.team_name)}">
                <div class="mb-6">
                  <h3 class="font-bold text-gray-900 text-xl">${team.team_name}</h3>
                  <p class="text-gray-600">${team.sport_name}</p>
                  
                  <!-- Children on this team -->
                  <div class="mt-3 flex flex-wrap gap-2">
                    ${teamChildren.map(child => `
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <i class="fas fa-user mr-2"></i>
                        ${child.child_name}${child.jersey_number ? ' #' + child.jersey_number : ''}
                      </span>
                    `).join('')}
                  </div>
                </div>

                <div class="space-y-6">
                  <!-- Calendar URL Input - Made EXTREMELY Prominent with Aqua Theme -->
                  <div class="bg-cyan-100 p-6 rounded-lg border-4 border-cyan-400 shadow-lg">
                    <label class="block text-2xl font-bold text-gray-900 mb-4">
                      <i class="fas fa-link mr-3 text-cyan-600 text-3xl"></i>
                      📋 PASTE CALENDAR URL HERE 📋
                    </label>
                    <input 
                      type="url" 
                      class="form-input w-full px-6 py-4 rounded-lg text-xl border-4 border-cyan-500 focus:border-cyan-600 bg-white shadow-md text-gray-900 font-medium" 
                      placeholder="Paste your team's calendar URL here..."
                      value="${settings.calendar_url || ''}"
                      data-team-id="${team.team_id}"
                      data-field="calendar_url"
                    >
                    <p class="text-lg text-gray-800 mt-3 font-medium">
                      <i class="fas fa-info-circle mr-2 text-cyan-600"></i>
                      This box is where you paste your team's calendar link!
                    </p>
                  </div>

                  <!-- Sync Toggle - Made EXTREMELY Prominent with Aqua Theme -->
                  <div class="bg-teal-100 p-6 rounded-lg border-4 border-teal-400 shadow-lg">
                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-2xl font-bold text-teal-900">🔄 TURN ON SYNC 🔄</label>
                        <p class="text-lg text-teal-700 font-medium mt-2">Click this toggle to enable automatic import!</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          class="sr-only peer" 
                          ${settings.sync_enabled ? 'checked' : ''}
                          data-team-id="${team.team_id}"
                          data-field="sync_enabled"
                        >
                        <div class="w-20 h-10 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-teal-600 shadow-md"></div>
                      </label>
                    </div>
                  </div>

                  <!-- Child Assignment for Events -->
                  <div class="bg-purple-100 p-6 rounded-lg border-4 border-purple-400 shadow-lg">
                    <h4 class="text-2xl font-bold text-purple-900 mb-4">
                      <i class="fas fa-user-plus mr-3 text-purple-600"></i>
                      👶 ASSIGN EVENTS TO CHILD 👶
                    </h4>
                    <p class="text-lg text-purple-700 font-medium mb-4">
                      Choose which child gets these calendar events in their personal app calendar:
                    </p>
                    
                    <div class="space-y-3">
                      ${teamChildren.length === 1 ? `
                        <!-- Only one child on team - auto-assign -->
                        <div class="bg-white p-4 rounded-lg border-2 border-purple-300">
                          <input type="hidden" data-team-id="${team.team_id}" data-field="assigned_child_id" value="${teamChildren[0].child_id}">
                          <div class="flex items-center">
                            <i class="fas fa-check-circle text-green-600 text-2xl mr-3"></i>
                            <div>
                              <div class="font-bold text-lg">Auto-assigned to ${teamChildren[0].child_name}</div>
                              <div class="text-sm text-gray-600">Only child on this team</div>
                            </div>
                          </div>
                        </div>
                      ` : `
                        <!-- Multiple children - let user choose -->
                        <select 
                          class="w-full px-4 py-3 rounded-lg text-lg border-2 border-purple-300 focus:border-purple-500 bg-white font-medium"
                          data-team-id="${team.team_id}"
                          data-field="assigned_child_id"
                        >
                          <option value="">Select child for these events...</option>
                          ${teamChildren.map(child => `
                            <option value="${child.child_id}" ${settings.assigned_child_id == child.child_id ? 'selected' : ''}>${child.child_name}${child.jersey_number ? ' #' + child.jersey_number : ''}</option>
                          `).join('')}
                        </select>
                      `}
                    </div>
                    
                    <div class="mt-4 p-3 bg-purple-50 rounded text-sm text-purple-700">
                      <i class="fas fa-mobile-alt mr-2"></i>
                      <strong>Individual Calendars:</strong> Each child gets their own calendar with notifications on their device
                    </div>
                  </div>

                  <!-- Sync Status -->
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="flex items-center justify-between">
                      <div class="text-sm">
                        <div class="font-medium text-gray-700">
                          ${settings.imported_events || 0} imported events
                        </div>
                        <div class="text-gray-500">
                          ${settings.last_sync ? 'Last sync: ' + dayjs(settings.last_sync).format('MMM D, h:mm A') : 'Never synced'}
                        </div>
                      </div>
                      <div class="flex gap-4">
                        <button 
                          class="flex-1 px-6 py-4 text-2xl bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-bold shadow-lg border-4 border-cyan-500"
                          data-team-id="${team.team_id}"
                          onclick="window.sportsTracker.saveTeamSettings(${team.team_id})"
                        >
                          <i class="fas fa-save mr-3"></i>💾 SAVE SETTINGS
                        </button>
                        <button 
                          class="flex-1 px-6 py-4 text-2xl bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-lg border-4 border-emerald-500 ${!settings.calendar_url || !settings.sync_enabled ? 'opacity-50 cursor-not-allowed' : ''}"
                          data-team-id="${team.team_id}"
                          onclick="window.sportsTracker.syncTeamCalendar(${team.team_id})"
                          ${!settings.calendar_url || !settings.sync_enabled ? 'disabled' : ''}
                        >
                          <i class="fas fa-sync-alt mr-3"></i>⚡ SYNC EVENTS
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Help Text -->
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 class="text-sm font-medium text-blue-900 mb-1">How to get your team's calendar URL:</h4>
                    <ul class="text-xs text-blue-800 space-y-1">
                      <li>• Ask your coach or team manager for the calendar link</li>
                      <li>• Look for "Export Calendar" or "Subscribe" options on team websites</li>
                      <li>• Common formats: .ics, iCal, Google Calendar public URL</li>
                      <li>• Usually ends with .ics or contains "calendar" in the URL</li>
                    </ul>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${allTeams.length === 0 ? `
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-calendar-times text-6xl mb-4"></i>
            <p class="text-lg mb-2">No teams found</p>
            <p class="text-sm">Add children and assign them to teams first</p>
            <button data-nav="children" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Go to Children
            </button>
          </div>
        ` : ''}
      </div>

      ${this.renderMobileNav()}
    `;
    
    // Auto-scroll to team forms area after rendering
    setTimeout(() => {
      const teamFormsArea = document.querySelector('.space-y-6');
      if (teamFormsArea && allTeams.length > 0) {
        teamFormsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  async showNotifications() {
    this.setPageBackground('default');
    
    try {
      // Load notification settings
      const response = await axios.get(`/api/notifications/settings/${this.currentUser.id}`);
      const { user_settings, children_settings } = response.data;
      
      document.getElementById('app').innerHTML = `
        <div class="mobile-container pb-20">
          ${this.renderPageHeader('Notification Settings', 'Manage alerts for daily reminders and event notifications', 'bell', true)}

          <!-- User Notification Settings -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-300 p-6 rounded-lg shadow-lg mb-6">
            <h3 class="text-2xl font-bold text-blue-900 mb-4">
              <i class="fas fa-user-cog mr-3 text-blue-600"></i>
              📱 Your Notification Preferences
            </h3>
            
            <div class="space-y-6">
              <!-- Daily Reminders -->
              <div class="bg-white p-4 rounded-lg border border-blue-200">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <label class="text-lg font-semibold text-gray-800">Daily Summary Reminders</label>
                    <p class="text-sm text-gray-600">Get morning overview of today's events</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      ${user_settings?.daily_reminder_enabled ? 'checked' : ''}
                      data-setting="daily_reminder_enabled"
                    >
                    <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center space-x-3">
                  <label class="text-sm font-medium text-gray-700">Time:</label>
                  <input 
                    type="time" 
                    class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value="${user_settings?.daily_reminder_time || '08:00'}"
                    data-setting="daily_reminder_time"
                  >
                </div>
              </div>

              <!-- Pre-Event Reminders -->
              <div class="bg-white p-4 rounded-lg border border-blue-200">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <label class="text-lg font-semibold text-gray-800">Pre-Event Alerts</label>
                    <p class="text-sm text-gray-600">Get notified before events start</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      ${user_settings?.pre_event_reminder_enabled ? 'checked' : ''}
                      data-setting="pre_event_reminder_enabled"
                    >
                    <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center space-x-3">
                  <label class="text-sm font-medium text-gray-700">Alert me:</label>
                  <select 
                    class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    data-setting="pre_event_reminder_minutes"
                  >
                    <option value="30" ${user_settings?.pre_event_reminder_minutes == 30 ? 'selected' : ''}>30 minutes before</option>
                    <option value="60" ${user_settings?.pre_event_reminder_minutes == 60 ? 'selected' : ''}>1 hour before</option>
                    <option value="120" ${user_settings?.pre_event_reminder_minutes == 120 ? 'selected' : ''}>2 hours before</option>
                    <option value="240" ${user_settings?.pre_event_reminder_minutes == 240 ? 'selected' : ''}>4 hours before</option>
                  </select>
                </div>
              </div>

              <!-- Delivery Methods -->
              <div class="bg-white p-4 rounded-lg border border-blue-200">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Notification Methods</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      class="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                      ${user_settings?.email_notifications ? 'checked' : ''}
                      data-setting="email_notifications"
                    >
                    <div class="flex items-center">
                      <i class="fas fa-envelope mr-2 text-blue-600"></i>
                      <span>Email</span>
                    </div>
                  </label>
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      class="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                      ${user_settings?.push_notifications ? 'checked' : ''}
                      data-setting="push_notifications"
                    >
                    <div class="flex items-center">
                      <i class="fas fa-mobile-alt mr-2 text-green-600"></i>
                      <span>Push Notifications</span>
                    </div>
                  </label>
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      class="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                      ${user_settings?.sms_notifications ? 'checked' : ''}
                      data-setting="sms_notifications"
                    >
                    <div class="flex items-center">
                      <i class="fas fa-sms mr-2 text-purple-600"></i>
                      <span>SMS</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="mt-6">
              <button 
                class="w-full px-6 py-4 text-xl bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-lg"
                onclick="window.sportsTracker.saveNotificationSettings()"
              >
                <i class="fas fa-save mr-3"></i>💾 SAVE NOTIFICATION SETTINGS
              </button>
            </div>
          </div>

          <!-- Child-Specific Settings -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-300 p-6 rounded-lg shadow-lg mb-6">
            <h3 class="text-2xl font-bold text-purple-900 mb-4">
              <i class="fas fa-users-cog mr-3 text-purple-600"></i>
              👶 Individual Child Settings
            </h3>
            
            <div class="space-y-4">
              ${this.children.map(child => {
                const childSettings = children_settings.find(cs => cs.child_id === child.id) || {};
                return `
                  <div class="bg-white p-4 rounded-lg border border-purple-200">
                    <h4 class="text-lg font-bold text-gray-800 mb-3">
                      <i class="fas fa-child mr-2 text-purple-600"></i>
                      ${child.name}
                    </h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label class="flex items-center">
                        <input 
                          type="checkbox" 
                          class="mr-3 h-4 w-4 text-purple-600 rounded border-gray-300"
                          ${childSettings.daily_reminder_enabled ? 'checked' : ''}
                          data-child-id="${child.id}"
                          data-child-setting="daily_reminder_enabled"
                        >
                        <span>Daily reminders</span>
                      </label>
                      <label class="flex items-center">
                        <input 
                          type="checkbox" 
                          class="mr-3 h-4 w-4 text-purple-600 rounded border-gray-300"
                          ${childSettings.pre_event_reminder_enabled ? 'checked' : ''}
                          data-child-id="${child.id}"
                          data-child-setting="pre_event_reminder_enabled"
                        >
                        <span>Event alerts</span>
                      </label>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                        <input 
                          type="email" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                          placeholder="child@example.com"
                          value="${childSettings.notification_email || ''}"
                          data-child-id="${child.id}"
                          data-child-setting="notification_email"
                        >
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                        <input 
                          type="tel" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                          placeholder="(555) 123-4567"
                          value="${childSettings.notification_phone || ''}"
                          data-child-id="${child.id}"
                          data-child-setting="notification_phone"
                        >
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Save Child Settings Button -->
            <div class="mt-6">
              <button 
                class="w-full px-6 py-4 text-xl bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold shadow-lg"
                onclick="window.sportsTracker.saveChildNotificationSettings()"
              >
                <i class="fas fa-save mr-3"></i>💾 SAVE CHILD SETTINGS
              </button>
            </div>
          </div>

          <!-- Notification Actions -->
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-300 p-6 rounded-lg shadow-lg">
            <h3 class="text-2xl font-bold text-green-900 mb-4">
              <i class="fas fa-bell-slash mr-3 text-green-600"></i>
              ⚡ Notification Actions
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                class="px-6 py-4 text-lg bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-lg"
                onclick="window.sportsTracker.scheduleNotifications()"
              >
                <i class="fas fa-clock mr-2"></i>Schedule Upcoming Alerts
              </button>
              
              <button 
                class="px-6 py-4 text-lg bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold shadow-lg"
                onclick="window.sportsTracker.viewNotificationHistory()"
              >
                <i class="fas fa-history mr-2"></i>View Notification History
              </button>
            </div>
            
            <div class="mt-4 p-3 bg-green-100 rounded text-sm text-green-800">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>How it works:</strong> Daily reminders are sent at your specified time. Pre-event alerts are sent based on your timing preference. Each child gets notifications for their individual sporting events only.
            </div>
          </div>
        </div>

        ${this.renderMobileNav()}
      `;
    } catch (error) {
      console.error('Error loading notifications:', error);
      document.getElementById('app').innerHTML = `
        <div class="mobile-container pb-20">
          ${this.renderPageHeader('Notification Settings', 'Manage alerts and reminders', 'bell', true)}
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 class="text-lg font-medium text-red-800 mb-2">Error Loading Settings</h3>
            <p class="text-red-700">Unable to load notification settings. Please try again.</p>
          </div>
          ${this.renderMobileNav()}
        </div>
      `;
    }
  }

  async saveTeamSettings(teamId) {
    try {
      const calendarUrlInput = document.querySelector(`input[data-team-id="${teamId}"][data-field="calendar_url"]`);
      const syncEnabledInput = document.querySelector(`input[data-team-id="${teamId}"][data-field="sync_enabled"]`);
      const assignedChildInput = document.querySelector(`[data-team-id="${teamId}"][data-field="assigned_child_id"]`);
      
      const assignedChildId = assignedChildInput ? assignedChildInput.value : null;
      
      // Validate that a child is assigned if sync is enabled
      if (syncEnabledInput.checked && !assignedChildId) {
        alert('Please select which child should receive these calendar events!');
        return;
      }
      
      const response = await axios.put(`/api/teams/${teamId}/calendar`, {
        calendar_url: calendarUrlInput.value.trim(),
        sync_enabled: syncEnabledInput.checked,
        assigned_child_id: assignedChildId
      });
      
      if (response.data.success) {
        alert('Team settings saved successfully!');
        // Refresh the page to update sync status
        this.showTeamManagement();
      } else {
        alert('Failed to save team settings');
      }
    } catch (error) {
      alert('Error saving team settings: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  async syncTeamCalendar(teamId) {
    try {
      // Find the sync button and show loading state
      const syncButton = document.querySelector(`button[data-team-id="${teamId}"]`);
      const originalText = syncButton.innerHTML;
      syncButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Syncing...';
      syncButton.disabled = true;
      
      const response = await axios.post(`/api/teams/${teamId}/sync`);
      
      if (response.data.success) {
        alert(`Successfully synced ${response.data.synced_events} events!`);
        // Reload user data and refresh the page
        await this.loadUserData();
        this.showTeamManagement();
      } else {
        alert('Failed to sync calendar');
        syncButton.innerHTML = originalText;
        syncButton.disabled = false;
      }
    } catch (error) {
      alert('Sync failed: ' + (error.response?.data?.error || 'Network error'));
      // Reset button state
      const syncButton = document.querySelector(`button[data-team-id="${teamId}"]`);
      syncButton.innerHTML = '<i class="fas fa-sync-alt mr-1"></i>Sync Now';
      syncButton.disabled = false;
    }
  }

  async saveNotificationSettings() {
    try {
      const settings = {};
      
      // Collect all user settings from the form
      document.querySelectorAll('[data-setting]').forEach(input => {
        const setting = input.dataset.setting;
        if (input.type === 'checkbox') {
          settings[setting] = input.checked;
        } else {
          settings[setting] = input.value;
        }
      });
      
      const response = await axios.put(`/api/notifications/settings/${this.currentUser.id}`, settings);
      
      if (response.data.success) {
        alert('Notification settings saved successfully!');
      } else {
        alert('Failed to save notification settings');
      }
    } catch (error) {
      alert('Error saving settings: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  async saveChildNotificationSettings() {
    try {
      const childSettings = {};
      
      // Group settings by child ID
      document.querySelectorAll('[data-child-id]').forEach(input => {
        const childId = input.dataset.childId;
        const setting = input.dataset.childSetting;
        
        if (!childSettings[childId]) {
          childSettings[childId] = {};
        }
        
        if (input.type === 'checkbox') {
          childSettings[childId][setting] = input.checked;
        } else {
          childSettings[childId][setting] = input.value;
        }
      });
      
      // Save settings for each child
      const promises = Object.keys(childSettings).map(childId => {
        return axios.put(`/api/notifications/child-settings/${childId}`, childSettings[childId]);
      });
      
      await Promise.all(promises);
      alert('Child notification settings saved successfully!');
    } catch (error) {
      alert('Error saving child settings: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  async scheduleNotifications() {
    try {
      const response = await axios.post(`/api/notifications/schedule/${this.currentUser.id}`);
      
      if (response.data.success) {
        alert(response.data.message);
      } else {
        alert('Failed to schedule notifications');
      }
    } catch (error) {
      alert('Error scheduling notifications: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  async viewNotificationHistory() {
    try {
      const response = await axios.get(`/api/notifications/history/${this.currentUser.id}?limit=20`);
      const notifications = response.data.notifications;
      
      let historyHtml = `
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h4 class="text-xl font-bold text-gray-900 mb-4">Recent Notifications</h4>
      `;
      
      if (notifications.length === 0) {
        historyHtml += `
          <p class="text-gray-600">No notifications sent yet.</p>
        `;
      } else {
        historyHtml += `
          <div class="space-y-3">
            ${notifications.map(notif => `
              <div class="border border-gray-200 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-gray-900">${notif.notification_type.replace('_', ' ').toUpperCase()}</span>
                  <span class="text-xs px-2 py-1 rounded ${notif.status === 'sent' ? 'bg-green-100 text-green-800' : notif.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">${notif.status.toUpperCase()}</span>
                </div>
                <p class="text-sm text-gray-600">${notif.message}</p>
                <div class="text-xs text-gray-500 mt-2">
                  ${notif.child_name ? 'For: ' + notif.child_name + ' • ' : ''}
                  ${notif.sent_at ? 'Sent: ' + new Date(notif.sent_at).toLocaleString() : 'Scheduled: ' + new Date(notif.scheduled_for).toLocaleString()}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      historyHtml += `
        </div>
      `;
      
      // Show in a modal-like overlay (simple implementation)
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      overlay.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
          ${historyHtml}
          <div class="p-6 border-t">
            <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Close
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      
    } catch (error) {
      alert('Error loading notification history: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  showEventsManagement() {
    this.currentView = 'events-management';
    this.previousView = 'dashboard';
    this.setPageBackground('default');
    
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <div class="flex items-center">
                <button class="text-gray-500 hover:text-gray-700 mr-4" data-nav="dashboard">
                  <i class="fas fa-arrow-left text-lg"></i>
                </button>
                <h1 class="text-2xl font-bold text-gray-900">
                  <i class="fas fa-calendar-alt mr-2 text-cyan-600"></i>
                  Events Management
                </h1>
              </div>
              <div class="text-sm text-gray-500">
                ${this.events.length} Total Events
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <!-- Filters Section -->
          <div class="bg-white rounded-lg shadow-sm mb-6 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-filter mr-2 text-cyan-600"></i>
              Filter & Sort Events
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Child Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Child</label>
                <select id="childFilter" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                  <option value="">All Children</option>
                  ${this.children.map(child => `<option value="${child.id}">${child.name}</option>`).join('')}
                </select>
              </div>
              
              <!-- Event Type Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select id="typeFilter" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                  <option value="">All Types</option>
                  <option value="game">Games</option>
                  <option value="practice">Practices</option>
                  <option value="tournament">Tournaments</option>
                  <option value="meet">Meets</option>
                </select>
              </div>
              
              <!-- Date Range Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select id="dateFilter" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="future">Future Only</option>
                </select>
              </div>
              
              <!-- Sort Options -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select id="sortFilter" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                  <option value="date_asc">Date (Earliest First)</option>
                  <option value="date_desc">Date (Latest First)</option>
                  <option value="type">Event Type</option>
                  <option value="child">Child Name</option>
                  <option value="team">Team Name</option>
                </select>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
              <button id="applyFilters" class="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors">
                <i class="fas fa-search mr-2"></i>
                Apply Filters
              </button>
              <button id="clearFilters" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                <i class="fas fa-times mr-2"></i>
                Clear All
              </button>
              <button id="bulkActions" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                <i class="fas fa-tasks mr-2"></i>
                Bulk Actions
              </button>
            </div>
          </div>

          <!-- Events List -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">
                <i class="fas fa-list mr-2 text-cyan-600"></i>
                All Events
              </h2>
            </div>
            
            <div class="overflow-x-auto">
              <div id="eventsContainer" class="divide-y divide-gray-200">
                <!-- Events will be loaded here -->
              </div>
            </div>
          </div>
          
        </div>
      </div>
    `;

    // Load and display events
    this.loadEventsForManagement();
    
    // Setup event listeners
    this.setupEventsManagementListeners();
  }

  async loadEventsForManagement() {
    try {
      // Reload events with expanded date range
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Show events from last month
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // Show events up to 6 months ahead
      
      const response = await axios.get(`/api/calendar/${this.currentUser.id}?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`);
      this.allEvents = response.data;
      
      this.renderEventsTable(this.allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      document.getElementById('eventsContainer').innerHTML = `
        <div class="p-6 text-center text-red-600">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Error loading events. Please try again.</p>
        </div>
      `;
    }
  }

  renderEventsTable(events) {
    const container = document.getElementById('eventsContainer');
    
    if (events.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-gray-500">
          <i class="fas fa-calendar-times text-3xl mb-3"></i>
          <p class="text-lg">No events found</p>
          <p class="text-sm">Try adjusting your filters or add some events.</p>
        </div>
      `;
      return;
    }

    const eventsHTML = events.map(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      const isPast = eventDate < today;
      const isToday = eventDate.toDateString() === today.toDateString();
      
      // Format time
      const startTime = event.start_time ? event.start_time.substring(0, 5) : '';
      const endTime = event.end_time ? event.end_time.substring(0, 5) : '';
      const timeRange = startTime ? (endTime ? `${startTime} - ${endTime}` : startTime) : 'All Day';
      
      // Event type styling
      const typeColors = {
        'game': 'bg-blue-100 text-blue-800',
        'practice': 'bg-green-100 text-green-800',
        'tournament': 'bg-purple-100 text-purple-800',
        'meet': 'bg-orange-100 text-orange-800'
      };
      
      const typeColor = typeColors[event.type] || 'bg-gray-100 text-gray-800';
      
      // Status styling
      const statusColors = {
        'attending': 'bg-green-100 text-green-800',
        'not_attending': 'bg-red-100 text-red-800',
        'maybe': 'bg-yellow-100 text-yellow-800',
        'pending': 'bg-gray-100 text-gray-800'
      };
      
      const statusColor = statusColors[event.attendance_status] || 'bg-gray-100 text-gray-800';
      
      return `
        <div class="p-4 hover:bg-gray-50 ${isPast ? 'opacity-60' : ''} ${this.getTeamCssClass(event.team_name)}" data-event-id="${event.id}">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3 mb-2">
                <input type="checkbox" class="event-checkbox" value="${event.id}">
                <div class="flex items-center space-x-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}">
                    ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  ${isToday ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Today</span>' : ''}
                  ${isPast ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Past</span>' : ''}
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 truncate" title="${event.title}">
                    ${event.title}
                  </h3>
                  <p class="text-sm text-gray-600">${event.team_name}</p>
                </div>
                
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    <i class="fas fa-calendar mr-1 text-cyan-600"></i>
                    ${eventDate.toLocaleDateString()}
                  </p>
                  <p class="text-sm text-gray-600">
                    <i class="fas fa-clock mr-1 text-cyan-600"></i>
                    ${timeRange}
                  </p>
                </div>
                
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    <i class="fas fa-user mr-1 text-cyan-600"></i>
                    ${event.child_name}${event.jersey_number ? ` (#${event.jersey_number})` : ''}
                  </p>
                  ${event.location ? `<p class="text-sm text-gray-600"><i class="fas fa-map-marker-alt mr-1 text-cyan-600"></i>${event.location}</p>` : ''}
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                    ${event.attendance_status ? event.attendance_status.replace('_', ' ') : 'pending'}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2 ml-4">
              <button class="text-blue-600 hover:text-blue-800 p-2" onclick="sportsTracker.editEvent(${event.id})" title="Edit Event">
                <i class="fas fa-edit"></i>
              </button>
              <button class="text-green-600 hover:text-green-800 p-2" onclick="sportsTracker.updateAttendance(${event.id}, '${event.child_name}')" title="Update Attendance">
                <i class="fas fa-check-circle"></i>
              </button>
              <button class="text-red-600 hover:text-red-800 p-2" onclick="sportsTracker.deleteEvent(${event.id})" title="Delete Event">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = eventsHTML;
  }

  setupEventsManagementListeners() {
    // Apply Filters
    document.getElementById('applyFilters').addEventListener('click', () => {
      this.applyEventFilters();
    });
    
    // Clear Filters
    document.getElementById('clearFilters').addEventListener('click', () => {
      document.getElementById('childFilter').value = '';
      document.getElementById('typeFilter').value = '';
      document.getElementById('dateFilter').value = '';
      document.getElementById('sortFilter').value = 'date_asc';
      this.renderEventsTable(this.allEvents);
    });
    
    // Bulk Actions
    document.getElementById('bulkActions').addEventListener('click', () => {
      this.showBulkActionsMenu();
    });
  }

  applyEventFilters() {
    let filteredEvents = [...this.allEvents];
    
    // Child filter
    const childFilter = document.getElementById('childFilter').value;
    if (childFilter) {
      filteredEvents = filteredEvents.filter(event => event.child_name === this.children.find(c => c.id == childFilter)?.name);
    }
    
    // Type filter
    const typeFilter = document.getElementById('typeFilter').value;
    if (typeFilter) {
      filteredEvents = filteredEvents.filter(event => event.type === typeFilter);
    }
    
    // Date filter
    const dateFilter = document.getElementById('dateFilter').value;
    if (dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const monthEnd = new Date(today);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      switch(dateFilter) {
        case 'today':
          filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === today.toDateString();
          });
          break;
        case 'tomorrow':
          filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === tomorrow.toDateString();
          });
          break;
        case 'week':
          filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= weekEnd;
          });
          break;
        case 'month':
          filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= monthEnd;
          });
          break;
        case 'future':
          filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today;
          });
          break;
      }
    }
    
    // Sort
    const sortFilter = document.getElementById('sortFilter').value;
    switch(sortFilter) {
      case 'date_asc':
        filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date_desc':
        filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'type':
        filteredEvents.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'child':
        filteredEvents.sort((a, b) => a.child_name.localeCompare(b.child_name));
        break;
      case 'team':
        filteredEvents.sort((a, b) => a.team_name.localeCompare(b.team_name));
        break;
    }
    
    this.renderEventsTable(filteredEvents);
  }

  showBulkActionsMenu() {
    const selectedEvents = Array.from(document.querySelectorAll('.event-checkbox:checked')).map(cb => cb.value);
    
    if (selectedEvents.length === 0) {
      alert('Please select some events first.');
      return;
    }
    
    const actions = [
      'Mark all as Attending',
      'Mark all as Not Attending', 
      'Mark all as Maybe',
      'Delete Selected Events',
      'Export to Calendar'
    ];
    
    const action = prompt(`Selected ${selectedEvents.length} events. Choose action:\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nEnter number (1-${actions.length}):`);
    
    if (!action || action < 1 || action > actions.length) return;
    
    this.performBulkAction(parseInt(action), selectedEvents);
  }

  async performBulkAction(actionNumber, eventIds) {
    const actions = ['attending', 'not_attending', 'maybe', 'delete', 'export'];
    const action = actions[actionNumber - 1];
    
    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${eventIds.length} events? This cannot be undone.`)) {
        return;
      }
      // TODO: Implement bulk delete
      alert('Bulk delete functionality will be implemented soon.');
    } else if (action === 'export') {
      // TODO: Implement export
      alert('Export functionality will be implemented soon.');
    } else {
      // Update attendance for all selected events
      try {
        for (const eventId of eventIds) {
          const event = this.allEvents.find(e => e.id == eventId);
          if (event) {
            await this.updateEventAttendance(eventId, event.child_name, action);
          }
        }
        alert(`Successfully updated ${eventIds.length} events!`);
        this.loadEventsForManagement(); // Refresh the list
      } catch (error) {
        alert('Error updating events: ' + (error.response?.data?.error || 'Network error'));
      }
    }
  }

  async updateEventAttendance(eventId, childName, status) {
    const child = this.children.find(c => c.name === childName);
    if (!child) return;
    
    await axios.put(`/api/attendance/${eventId}/${child.id}`, {
      status: status,
      notes: `Bulk updated via Events Management`
    });
  }

  async editEvent(eventId) {
    try {
      // Get event details
      const response = await axios.get(`/api/events/${eventId}`);
      const event = response.data;
      
      this.showEventEditModal(event);
    } catch (error) {
      alert('Error loading event details: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  showEventEditModal(event) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-90vh overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              <i class="fas fa-edit mr-2 text-cyan-600"></i>
              Edit Event
            </h2>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form id="editEventForm" class="space-y-4">
            <input type="hidden" name="eventId" value="${event.id}">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input type="text" name="title" value="${event.title}" required 
                     class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select name="type" required class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                <option value="game" ${event.type === 'game' ? 'selected' : ''}>Game</option>
                <option value="practice" ${event.type === 'practice' ? 'selected' : ''}>Practice</option>
                <option value="tournament" ${event.type === 'tournament' ? 'selected' : ''}>Tournament</option>
                <option value="meet" ${event.type === 'meet' ? 'selected' : ''}>Meet</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name="event_date" value="${event.event_date}" required
                       class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" name="start_time" value="${event.start_time}" required
                       class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input type="time" name="end_time" value="${event.end_time || ''}"
                     class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" name="location" value="${event.location || ''}"
                     class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Opponent (for games)</label>
              <input type="text" name="opponent" value="${event.opponent || ''}"
                     class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" rows="3" 
                        class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">${event.description || ''}</textarea>
            </div>
            
            <div class="flex items-center">
              <input type="checkbox" name="is_home" ${event.is_home ? 'checked' : ''} 
                     class="mr-2 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500">
              <label class="text-sm font-medium text-gray-700">Home Event</label>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors">
                <i class="fas fa-save mr-2"></i>
                Save Changes
              </button>
              <button type="button" onclick="this.closest('.fixed').remove()" 
                      class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('editEventForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleEventEdit(e.target);
    });
  }

  async handleEventEdit(form) {
    try {
      const formData = new FormData(form);
      const eventData = {
        type: formData.get('type'),
        title: formData.get('title'),
        description: formData.get('description'),
        event_date: formData.get('event_date'),
        start_time: formData.get('start_time'),
        end_time: formData.get('end_time') || null,
        location: formData.get('location') || null,
        opponent: formData.get('opponent') || null,
        is_home: formData.get('is_home') === 'on'
      };
      
      const eventId = formData.get('eventId');
      const response = await axios.put(`/api/events/${eventId}`, eventData);
      
      if (response.data.success) {
        alert('Event updated successfully!');
        form.closest('.fixed').remove();
        // Refresh the current view
        if (this.currentView === 'events-management') {
          this.loadEventsForManagement();
        } else {
          await this.loadUserData();
          this.showDashboard();
        }
      } else {
        alert('Failed to update event');
      }
    } catch (error) {
      alert('Error updating event: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  updateAttendance(eventId, childName) {
    // Show attendance update modal
    const child = this.children.find(c => c.name === childName);
    if (!child) return;
    
    const event = this.allEvents.find(e => e.id == eventId);
    if (!event) return;
    
    const currentStatus = event.attendance_status || 'pending';
    const statuses = ['attending', 'not_attending', 'maybe', 'pending'];
    const statusLabels = ['Attending', 'Not Attending', 'Maybe', 'Pending'];
    
    const newStatus = prompt(`Update attendance for ${event.title}:\n\n${statusLabels.map((label, i) => `${i + 1}. ${label}${statuses[i] === currentStatus ? ' (current)' : ''}`).join('\n')}\n\nEnter number (1-4):`);
    
    if (!newStatus || newStatus < 1 || newStatus > 4) return;
    
    this.updateEventAttendance(eventId, childName, statuses[parseInt(newStatus) - 1])
      .then(() => {
        alert('Attendance updated successfully!');
        this.loadEventsForManagement(); // Refresh the list
      })
      .catch(error => {
        alert('Error updating attendance: ' + (error.response?.data?.error || 'Network error'));
      });
  }

  async deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/events/${eventId}`);
      
      if (response.data.success) {
        alert('Event deleted successfully!');
        // Refresh the current view
        if (this.currentView === 'events-management') {
          this.loadEventsForManagement();
        } else {
          await this.loadUserData();
          this.showDashboard();
        }
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      alert('Error deleting event: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  async editChild(childId) {
    try {
      const child = this.children.find(c => c.id === childId);
      if (!child) {
        alert('Child not found');
        return;
      }
      
      this.showChildEditModal(child);
    } catch (error) {
      alert('Error loading child details: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  showChildEditModal(child) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              <i class="fas fa-user-edit mr-2 text-cyan-600"></i>
              Edit Child Profile
            </h2>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form id="editChildForm" class="space-y-4">
            <input type="hidden" name="childId" value="${child.id}">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Child's Name</label>
              <input type="text" name="name" value="${child.name}" required 
                     class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              <input type="date" name="birth_date" value="${child.birth_date || ''}"
                     class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Photo URL (optional)</label>
              <input type="url" name="photo_url" value="${child.photo_url || ''}"
                     class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                     placeholder="https://example.com/photo.jpg">
            </div>
            
            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors">
                <i class="fas fa-save mr-2"></i>
                Save Changes
              </button>
              <button type="button" onclick="this.closest('.fixed').remove()" 
                      class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('editChildForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleChildEdit(e.target);
    });
  }

  async handleChildEdit(form) {
    try {
      const formData = new FormData(form);
      const childData = {
        name: formData.get('name'),
        birth_date: formData.get('birth_date') || null,
        photo_url: formData.get('photo_url') || null
      };
      
      const childId = formData.get('childId');
      const response = await axios.put(`/api/children/${childId}`, childData);
      
      if (response.data.success) {
        alert('Child profile updated successfully!');
        form.closest('.fixed').remove();
        // Reload user data and refresh current view
        await this.loadUserData();
        this.showChildren();
      } else {
        alert('Failed to update child profile');
      }
    } catch (error) {
      alert('Error updating child profile: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  async deleteChild(childId, childName) {
    if (!confirm(`Are you sure you want to delete ${childName}'s profile? This will also remove all their team assignments and event attendance records. This cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/children/${childId}`);
      
      if (response.data.success) {
        alert(`${childName}'s profile deleted successfully!`);
        // Reload user data and refresh current view
        await this.loadUserData();
        this.showChildren();
      } else {
        alert('Failed to delete child profile');
      }
    } catch (error) {
      alert('Error deleting child profile: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  async editTeamAssignment(childId, teamId) {
    try {
      const child = this.children.find(c => c.id === childId);
      const teamAssignment = child.teams.find(t => t.team_id === teamId);
      
      if (!teamAssignment) {
        alert('Team assignment not found');
        return;
      }
      
      this.showTeamAssignmentEditModal(child, teamAssignment);
    } catch (error) {
      alert('Error loading team assignment: ' + error.message);
    }
  }

  showTeamAssignmentEditModal(child, teamAssignment) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              <i class="fas fa-tshirt mr-2 text-cyan-600"></i>
              Edit Team Assignment
            </h2>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="mb-4 p-3 bg-gray-50 rounded-lg">
            <div class="font-medium text-gray-900">${child.name}</div>
            <div class="text-sm text-gray-600">${teamAssignment.team_name} (${teamAssignment.sport_name})</div>
          </div>
          
          <form id="editTeamAssignmentForm" class="space-y-4">
            <input type="hidden" name="childId" value="${child.id}">
            <input type="hidden" name="teamId" value="${teamAssignment.team_id}">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jersey Number</label>
              <input type="number" name="jersey_number" value="${teamAssignment.jersey_number || ''}" min="0" max="999"
                     class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                     placeholder="Enter jersey number">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input type="text" name="position" value="${teamAssignment.position || ''}"
                     class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                     placeholder="e.g., Forward, Midfielder, Goalkeeper">
            </div>
            
            <div class="flex items-center">
              <input type="checkbox" name="active" ${teamAssignment.active ? 'checked' : ''} 
                     class="mr-2 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500">
              <label class="text-sm font-medium text-gray-700">Active on this team</label>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors">
                <i class="fas fa-save mr-2"></i>
                Save Changes
              </button>
              <button type="button" onclick="this.closest('.fixed').remove()" 
                      class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('editTeamAssignmentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleTeamAssignmentEdit(e.target);
    });
  }

  async handleTeamAssignmentEdit(form) {
    try {
      const formData = new FormData(form);
      const assignmentData = {
        jersey_number: formData.get('jersey_number') ? parseInt(formData.get('jersey_number')) : null,
        position: formData.get('position') || null,
        active: formData.get('active') === 'on'
      };
      
      const childId = formData.get('childId');
      const teamId = formData.get('teamId');
      const response = await axios.put(`/api/child-teams/${childId}/${teamId}`, assignmentData);
      
      if (response.data.success) {
        alert('Team assignment updated successfully!');
        form.closest('.fixed').remove();
        // Reload user data and refresh current view
        await this.loadUserData();
        this.showChildren();
      } else {
        alert('Failed to update team assignment');
      }
    } catch (error) {
      alert('Error updating team assignment: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  // Save team calendar settings
  async saveTeamSettings(teamId) {
    try {
      const teamCard = document.querySelector(`[data-team-id="${teamId}"]`).closest('.bg-gradient-to-br');
      const calendarUrl = teamCard.querySelector('[data-field="calendar_url"]').value;
      const syncEnabled = teamCard.querySelector('[data-field="sync_enabled"]').checked;
      const assignedChildId = teamCard.querySelector('[data-field="assigned_child_id"]').value;
      
      const data = {
        calendar_url: calendarUrl || '',
        sync_enabled: syncEnabled,
        assigned_child_id: assignedChildId ? parseInt(assignedChildId) : null
      };
      
      const response = await axios.put(`/api/teams/${teamId}/calendar`, data);
      
      if (response.data.success) {
        alert('✅ Team calendar settings saved successfully!');
        // Refresh the team management view to show updated settings
        this.showTeamManagement();
      } else {
        alert('❌ Failed to save team settings');
      }
    } catch (error) {
      alert('❌ Error saving team settings: ' + (error.response?.data?.error || 'Network error'));
    }
  }
  
  // Sync team calendar events
  async syncTeamCalendar(teamId) {
    try {
      const button = event.target;
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>🔄 SYNCING...';
      button.disabled = true;
      
      const response = await axios.post(`/api/teams/${teamId}/sync`);
      
      if (response.data.success) {
        alert(`✅ Calendar sync completed!\n\n📅 ${response.data.synced_events} events imported\n🔄 ${response.data.total_events} total events processed`);
        
        // Refresh user data and team management to show updated counts
        await this.loadUserData();
        this.showTeamManagement();
      } else {
        alert('❌ Calendar sync failed');
      }
      
      button.innerHTML = originalText;
      button.disabled = false;
    } catch (error) {
      alert('❌ Calendar sync error: ' + (error.response?.data?.error || 'Network error'));
      
      const button = event.target;
      button.innerHTML = '<i class="fas fa-sync-alt mr-3"></i>⚡ SYNC EVENTS';
      button.disabled = false;
    }
  }

  logout() {
    // Confirmation dialog
    const confirmed = confirm('Are you sure you want to log out?');
    if (!confirmed) {
      return; // User cancelled logout
    }

    try {
      // Show loading feedback
      const logoutBtn = document.querySelector('[data-nav="logout"]');
      if (logoutBtn) {
        const originalContent = logoutBtn.innerHTML;
        logoutBtn.innerHTML = `
          <i class="fas fa-spinner fa-spin text-lg mb-1"></i>
          <div class="text-xs">Logging out...</div>
        `;
        
        // Add slight delay for better UX
        setTimeout(() => {
          // Clear user session
          localStorage.removeItem('sportsTracker_user');
          this.currentUser = null;
          this.children = [];
          this.events = [];
          
          // Clear any cached data
          this.sports = [];
          this.teams = [];
          
          // Reset current view
          this.currentView = 'dashboard';
          this.previousView = 'dashboard';
          
          // Show success message
          console.log('User logged out successfully');
          
          // Navigate to auth screen
          this.showAuth();
          
          // Optional: Show temporary success message
          setTimeout(() => {
            const authContainer = document.getElementById('app');
            if (authContainer) {
              const successMsg = document.createElement('div');
              successMsg.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
              successMsg.textContent = 'Successfully logged out!';
              document.body.appendChild(successMsg);
              
              // Remove message after 3 seconds
              setTimeout(() => {
                if (successMsg.parentNode) {
                  successMsg.parentNode.removeChild(successMsg);
                }
              }, 3000);
            }
          }, 100);
          
        }, 500); // Small delay for better UX
      } else {
        // Fallback if no logout button found
        this.performLogout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback logout
      this.performLogout();
    }
  }

  // Helper method for clean logout
  performLogout() {
    localStorage.removeItem('sportsTracker_user');
    this.currentUser = null;
    this.children = [];
    this.events = [];
    this.sports = [];
    this.teams = [];
    this.currentView = 'dashboard';
    this.previousView = 'dashboard';
    this.showAuth();
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.sportsTracker = new SportsTracker();
});