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
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      await this.loadUserData();
      this.showDashboard();
    } else {
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

    try {
      const response = await axios.post('/api/auth/login', data);
      if (response.data.success) {
        this.currentUser = response.data.user;
        localStorage.setItem('sportsTracker_user', JSON.stringify(this.currentUser));
        await this.loadUserData();
        this.showDashboard();
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
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

  showDashboard() {
    const upcomingEvents = this.events.slice(0, 5);
    
    document.getElementById('app').innerHTML = `
      <div class="mobile-container pb-20">
        ${this.renderPageHeader(`Welcome back, ${this.currentUser.name}!`, 'Manage your family\'s sports activities', 'trophy', false)}

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="text-2xl font-bold text-blue-600">${this.children.length}</div>
            <div class="text-sm text-gray-600">Children</div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="text-2xl font-bold text-green-600">${this.events.length}</div>
            <div class="text-sm text-gray-600">Upcoming Events</div>
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
                    <span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">${team.team_name}</span>
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
              <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="event-${event.type} px-2 py-1 text-xs rounded-full">${event.type.toUpperCase()}</span>
                      <span class="text-sm text-gray-600">${event.team_name}</span>
                    </div>
                    <h3 class="font-medium text-gray-900">${event.title}</h3>
                    <p class="text-sm text-gray-600">${event.child_name}</p>
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
    document.getElementById('app').innerHTML = `
      <div class="mobile-container pb-20">
        ${this.renderPageHeader('Family Calendar', 'All upcoming events for your children', 'calendar', false)}

        <div class="space-y-4">
          ${this.events.map(event => `
            <div class="bg-white p-4 rounded-lg shadow-md border-l-4 sport-${event.team_name.toLowerCase().includes('soccer') ? 'soccer' : event.team_name.toLowerCase().includes('football') ? 'football' : 'track'}">
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
    document.getElementById('app').innerHTML = `
      <div class="mobile-container pb-20">
        ${this.renderPageHeader('Children', 'Manage your children\'s profiles and teams', 'users', false)}

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
              </div>
              
              <div class="mb-3">
                <h4 class="font-medium text-gray-700 mb-2">Teams & Sports</h4>
                <div class="space-y-2">
                  ${child.teams.map(team => `
                    <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <div class="font-medium text-gray-900">${team.team_name}</div>
                        <div class="text-sm text-gray-600">${team.sport_name}${team.jersey_number ? ' • #' + team.jersey_number : ''}${team.position ? ' • ' + team.position : ''}</div>
                      </div>
                      <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
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
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.user_id = this.currentUser.id;

    try {
      const response = await axios.post('/api/children', data);
      if (response.data.success) {
        await this.loadUserData();
        this.showChildren();
      } else {
        alert('Failed to add child');
      }
    } catch (error) {
      alert('Error adding child: ' + (error.response?.data?.error || 'Network error'));
    }
  }

  showAddEvent() {
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
            <button data-back class="mr-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <i class="fas fa-arrow-left text-lg"></i>
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
        ${this.renderPageHeader('Team Management', 'Configure calendar integration for your teams', 'calendar-alt', true)}

        <div class="space-y-6">
          ${allTeams.map(team => {
            const settings = teamSettings[team.team_id] || {};
            return `
              <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="mb-4">
                  <h3 class="font-semibold text-gray-900 text-lg">${team.team_name}</h3>
                  <p class="text-sm text-gray-600">${team.sport_name}</p>
                </div>

                <div class="space-y-4">
                  <!-- Calendar URL Input -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Team Calendar URL
                      <span class="text-gray-500 font-normal">(iCal/ICS format)</span>
                    </label>
                    <input 
                      type="url" 
                      class="form-input w-full px-3 py-2 rounded-lg" 
                      placeholder="https://example.com/team-calendar.ics"
                      value="${settings.calendar_url || ''}"
                      data-team-id="${team.team_id}"
                      data-field="calendar_url"
                    >
                    <p class="text-xs text-gray-500 mt-1">
                      Enter the calendar URL provided by your team/league
                    </p>
                  </div>

                  <!-- Sync Toggle -->
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">Enable Calendar Sync</label>
                      <p class="text-xs text-gray-500">Automatically import events from team calendar</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        class="sr-only peer" 
                        ${settings.sync_enabled ? 'checked' : ''}
                        data-team-id="${team.team_id}"
                        data-field="sync_enabled"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
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
                      <div class="flex gap-2">
                        <button 
                          class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          data-team-id="${team.team_id}"
                          onclick="window.sportsTracker.syncTeamCalendar(${team.team_id})"
                          ${!settings.calendar_url || !settings.sync_enabled ? 'disabled' : ''}
                        >
                          <i class="fas fa-sync-alt mr-1"></i>Sync Now
                        </button>
                        <button 
                          class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          data-team-id="${team.team_id}"
                          onclick="window.sportsTracker.saveTeamSettings(${team.team_id})"
                        >
                          <i class="fas fa-save mr-1"></i>Save
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
  }

  async saveTeamSettings(teamId) {
    try {
      const calendarUrlInput = document.querySelector(`input[data-team-id="${teamId}"][data-field="calendar_url"]`);
      const syncEnabledInput = document.querySelector(`input[data-team-id="${teamId}"][data-field="sync_enabled"]`);
      
      const response = await axios.put(`/api/teams/${teamId}/calendar`, {
        calendar_url: calendarUrlInput.value.trim(),
        sync_enabled: syncEnabledInput.checked
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

  logout() {
    localStorage.removeItem('sportsTracker_user');
    this.currentUser = null;
    this.children = [];
    this.events = [];
    this.showAuth();
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.sportsTracker = new SportsTracker();
});