// SciCollab Researcher Management Component Application Logic

(function () {
  // State Initialization
  let _researchers = [...researchers];
  let _institutions = [...institutions];

  let currentView = 'directory'; // 'directory' | 'profile' | 'institutions'
  let gridMode = true;
  let selectedResearcher = null;
  let search = '';

  // Institutions View Filter State
  let instSearch = '';
  let instTypeFilter = 'All Types';
  let instCountryFilter = 'All Countries';

  // Active Modal State
  let modalState = null; // { type: 'researcher' | 'institution', mode: 'add' | 'edit' | 'view', item?: any }

  // DOM Mount Points
  const appContainer = document.getElementById('screenMountPoint');

  function init() {
    setupTopBarListeners();
    render();
  }

  // --- Badge Helper ---
  function renderBadge(status, size = 'md') {
    const statusMap = {
      Published: { bg: '#e8f5f3', text: '#1F7A6C', dot: '#1F7A6C' },
      Submitted: { bg: '#fef4e8', text: '#C9822E', dot: '#C9822E' },
      Draft: { bg: '#EBF4FF', text: '#2B6CB0', dot: '#2B6CB0' },
      Archived: { bg: '#F3F4F6', text: '#5B6472', dot: '#9CA3AF' },
      Active: { bg: '#e8f5f3', text: '#1F7A6C', dot: '#1F7A6C' },
      Pending: { bg: '#fef4e8', text: '#C9822E', dot: '#C9822E' },
      Completed: { bg: '#F3F4F6', text: '#5B6472', dot: '#9CA3AF' },
      University: { bg: '#EBF4FF', text: '#2B6CB0', dot: '#2B6CB0' },
      'Research Institute': { bg: '#f3eeff', text: '#6B46C1', dot: '#6B46C1' },
      'Funding Body': { bg: '#fef4e8', text: '#C9822E', dot: '#C9822E' },
      Inactive: { bg: '#F3F4F6', text: '#5B6472', dot: '#9CA3AF' }
    };

    const style = statusMap[status] || { bg: '#F3F4F6', text: '#5B6472', dot: '#9CA3AF' };
    const pad = size === 'sm' ? '2px 8px' : '3px 10px';
    const font = size === 'sm' ? '11px' : '12px';

    return `
      <span class="badge-pill" style="background: ${style.bg}; color: ${style.text}; padding: ${pad}; font-size: ${font};">
        <span class="badge-dot" style="background: ${style.dot};"></span>
        ${status}
      </span>
    `;
  }

  // --- Main Dispatcher ---
  function render() {
    if (currentView === 'profile' && selectedResearcher) {
      renderProfileView();
    } else if (currentView === 'institutions') {
      renderInstitutionsView();
    } else {
      renderDirectoryView();
    }

    renderModal();
  }

  // ── 1. Directory View ──────────────────────────────────────────────────
  function renderDirectoryView() {
    const filtered = _researchers.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );

    appContainer.innerHTML = `
      <div>
        <!-- View Toggle & Primary Action Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="display: flex; gap: 2px; background: #F5F6F8; border-radius: 8px; padding: 3px; border: 1px solid #E1E4E8;">
            <button id="viewDirTabBtn" style="padding: 6px 14px; border-radius: 6px; border: none; background: ${currentView === 'directory' ? '#16324F' : 'transparent'}; color: ${currentView === 'directory' ? '#fff' : '#5B6472'}; font-size: 13px; font-weight: 600; cursor: pointer;">
              Researcher Directory
            </button>
            <button id="viewInstTabBtn" style="padding: 6px 14px; border-radius: 6px; border: none; background: ${currentView === 'institutions' ? '#16324F' : 'transparent'}; color: ${currentView === 'institutions' ? '#fff' : '#5B6472'}; font-size: 13px; font-weight: 600; cursor: pointer;">
              Institutions
            </button>
          </div>
          <button class="btn-primary" id="addResearcherBtn">
            <span>+</span> Add Researcher
          </button>
        </div>

        <!-- Search Bar & Grid/List Mode Controls -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
          <div style="position: relative; flex: 1; min-width: 220px;">
            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9CA3AF;">🔍</span>
            <input class="field-input" id="directorySearchInput" placeholder="Search by name, skill, department…" value="${search}" style="padding-left: 32px; height: 36px; font-size: 13px;" />
          </div>
          <div style="margin-left: auto; display: flex; gap: 4px; background: #F5F6F8; border: 1px solid #E1E4E8; border-radius: 8px; padding: 3px;">
            <button id="gridModeBtn" style="padding: 5px 8px; border-radius: 5px; border: none; background: ${gridMode ? '#16324F' : 'transparent'}; color: ${gridMode ? '#fff' : '#9CA3AF'}; cursor: pointer;">
              🔲
            </button>
            <button id="listModeBtn" style="padding: 5px 8px; border-radius: 5px; border: none; background: ${!gridMode ? '#16324F' : 'transparent'}; color: ${!gridMode ? '#fff' : '#9CA3AF'}; cursor: pointer;">
              ≡
            </button>
          </div>
        </div>

        <!-- Cards Grid or Data Table -->
        ${gridMode ? `
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
            ${filtered.map(r => `
              <div class="card researcher-card-item" data-id="${r.id}" style="padding: 20px; cursor: pointer; transition: box-shadow 0.15s; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                  <div style="width: 44px; height: 44px; border-radius: 10px; background: #16324F; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; font-family: 'Poppins', sans-serif; flex-shrink: 0;">
                    ${r.avatar}
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 14px; color: #1B1F27; font-family: 'Poppins', sans-serif; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${r.name}
                    </div>
                    <div style="font-size: 12px; color: #5B6472;">${r.title}</div>
                  </div>
                </div>
                <div style="font-size: 12.5px; color: #5B6472; margin-bottom: 3px;">${r.department}</div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #9CA3AF; margin-bottom: 12px;">
                  📍 ${r.institution}
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px;">
                  ${r.skills.slice(0, 3).map(s => `
                    <span style="padding: 3px 8px; background: #F5F6F8; color: #5B6472; border-radius: 6px; font-size: 11px; font-weight: 500; border: 1px solid #E1E4E8;">${s}</span>
                  `).join('')}
                </div>
                <div style="display: flex; gap: 16px; padding-top: 10px; border-top: 1px solid #F3F4F6;">
                  <div style="font-size: 12px; color: #5B6472;"><span style="font-weight: 700; color: #1B1F27; font-size: 14px;">${r.publications}</span> pubs</div>
                  <div style="font-size: 12px; color: #5B6472;"><span style="font-weight: 700; color: #1B1F27; font-size: 14px;">${r.collaborators}</span> collabs</div>
                  <div style="font-size: 12px; color: #5B6472;"><span style="font-weight: 700; color: #1B1F27; font-size: 14px;">${r.hIndex}</span> h-index</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="card">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Institution</th>
                  <th>Skills</th>
                  <th>Publications</th>
                  <th>h-Index</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(r => `
                  <tr class="researcher-row-item" data-id="${r.id}" style="cursor: pointer;">
                    <td>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #16324F; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">
                          ${r.avatar}
                        </div>
                        <div>
                          <div style="font-weight: 600;">${r.name}</div>
                          <div style="font-size: 12px; color: #5B6472;">${r.title}</div>
                        </div>
                      </div>
                    </td>
                    <td style="color: #5B6472;">${r.department}</td>
                    <td style="color: #5B6472;">${r.institution}</td>
                    <td>
                      <div style="display: flex; gap: 4px;">
                        ${r.skills.slice(0, 2).map(s => `
                          <span style="padding: 2px 7px; background: #F5F6F8; border-radius: 4px; font-size: 11px; color: #5B6472;">${s}</span>
                        `).join('')}
                      </div>
                    </td>
                    <td style="font-weight: 600;">${r.publications}</td>
                    <td style="font-weight: 700; color: #1F7A6C;">${r.hIndex}</td>
                    <td class="action-cell">
                      <div style="display: flex; gap: 5px;">
                        <button class="btn-secondary view-r-btn" data-id="${r.id}" style="padding: 4px 10px; font-size: 12px;">View</button>
                        <button class="btn-secondary edit-r-btn" data-id="${r.id}" style="padding: 4px 10px; font-size: 12px;">Edit</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    // Attach View/Directory Event Handlers
    document.getElementById('viewDirTabBtn').onclick = () => { currentView = 'directory'; render(); };
    document.getElementById('viewInstTabBtn').onclick = () => { currentView = 'institutions'; render(); };
    document.getElementById('addResearcherBtn').onclick = () => { modalState = { type: 'researcher', mode: 'add' }; render(); };

    const searchInput = document.getElementById('directorySearchInput');
    searchInput.oninput = (e) => { search = e.target.value; renderDirectoryView(); };

    document.getElementById('gridModeBtn').onclick = () => { gridMode = true; render(); };
    document.getElementById('listModeBtn').onclick = () => { gridMode = false; render(); };

    document.querySelectorAll('.researcher-card-item, .researcher-row-item').forEach(el => {
      el.onclick = (e) => {
        if (e.target.closest('.action-cell')) return;
        const id = parseInt(el.getAttribute('data-id'), 10);
        const r = _researchers.find(x => x.id === id);
        if (r) {
          selectedResearcher = r;
          currentView = 'profile';
          render();
        }
      };
    });

    document.querySelectorAll('.view-r-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const r = _researchers.find(x => x.id === id);
        if (r) {
          modalState = { type: 'researcher', mode: 'view', item: r };
          render();
        }
      };
    });

    document.querySelectorAll('.edit-r-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const r = _researchers.find(x => x.id === id);
        if (r) {
          modalState = { type: 'researcher', mode: 'edit', item: r };
          render();
        }
      };
    });
  }

  // ── 2. Profile View ────────────────────────────────────────────────────
  let activeProfileTab = 'Overview';

  function renderProfileView() {
    const r = selectedResearcher;
    const tabs = ['Overview', 'Publications', 'Projects', 'Conferences', 'Achievements'];
    const myPubs = publications.filter(p => p.authors.includes(r.id));

    appContainer.innerHTML = `
      <div>
        <div class="card" style="margin-bottom: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #16324F, #1a3d60); height: 80px;"></div>
          <div style="padding: 0 28px 22px; margin-top: -28px;">
            <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 14px;">
              <div style="display: flex; align-items: flex-end; gap: 16px;">
                <div style="width: 72px; height: 72px; border-radius: 14px; background: #C9A24B; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 22px; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                  ${r.avatar}
                </div>
                <div style="padding-bottom: 4px;">
                  <h2 style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 20px; margin: 0 0 2px; color: #1B1F27;">${r.name}</h2>
                  <div style="font-size: 13.5px; color: #5B6472;">${r.title} · ${r.department}</div>
                  <div style="display: flex; align-items: center; gap: 4px; font-size: 12.5px; color: #9CA3AF; margin-top: 3px;">
                    📍 ${r.institution}
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 10px; padding-bottom: 4px;">
                <button class="btn-secondary" id="backToDirBtn" style="font-size: 13px;">← Back</button>
                <button class="btn-primary" id="editProfileBtn" style="font-size: 13px;">Edit Profile</button>
              </div>
            </div>
            <div style="display: flex; gap: 4px; border-top: 1px solid #F3F4F6; padding-top: 4px;">
              ${tabs.map(t => `
                <button class="tab-btn profile-tab-btn ${activeProfileTab === t ? 'active' : ''}" data-tab="${t}">${t}</button>
              `).join('')}
            </div>
          </div>
        </div>

        ${activeProfileTab === 'Overview' ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <div class="card" style="padding: 22px; margin-bottom: 16px;">
                <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; margin: 0 0 12px; color: #1B1F27;">Biography</h3>
                <p style="font-size: 13.5px; color: #5B6472; line-height: 1.7; margin: 0 0 16px;">${r.bio}</p>
                <h4 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 13px; margin: 0 0 8px; color: #1B1F27;">Skills & Expertise</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
                  ${r.skills.map(s => `<span style="padding: 4px 10px; background: #EBF4FF; color: #2B6CB0; border-radius: 6px; font-size: 12px; font-weight: 500;">${s}</span>`).join('')}
                </div>
                <h4 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 13px; margin: 0 0 8px; color: #1B1F27;">Research Interests</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${r.interests.map(s => `<span style="padding: 4px 10px; background: #e8f5f3; color: #1F7A6C; border-radius: 6px; font-size: 12px; font-weight: 500;">${s}</span>`).join('')}
                </div>
              </div>
            </div>
            <div>
              <div class="card" style="padding: 22px; margin-bottom: 16px;">
                <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; margin: 0 0 16px; color: #1B1F27;">Contact Information</h3>
                <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;">
                  <div style="width: 34px; height: 34px; border-radius: 8px; background: #F5F6F8; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">✉️</div>
                  <div>
                    <div style="font-size: 11.5px; color: #9CA3AF; font-weight: 600; text-transform: uppercase;">Email</div>
                    <div style="font-size: 13.5px; color: #1B1F27; margin-top: 2px;">${r.email}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;">
                  <div style="width: 34px; height: 34px; border-radius: 8px; background: #F5F6F8; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">📞</div>
                  <div>
                    <div style="font-size: 11.5px; color: #9CA3AF; font-weight: 600; text-transform: uppercase;">Phone</div>
                    <div style="font-size: 13.5px; color: #1B1F27; margin-top: 2px;">${r.phone}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 34px; height: 34px; border-radius: 8px; background: #F5F6F8; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🏛️</div>
                  <div>
                    <div style="font-size: 11.5px; color: #9CA3AF; font-weight: 600; text-transform: uppercase;">Institution</div>
                    <div style="font-size: 13.5px; color: #1B1F27; margin-top: 2px;">${r.institution}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : activeProfileTab === 'Publications' ? `
          <div class="card">
            <div style="padding: 16px 20px; border-bottom: 1px solid #F3F4F6;">
              <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; margin: 0;">Publications (${myPubs.length})</h3>
            </div>
            <table class="data-table">
              <thead><tr><th>Title</th><th>Venue</th><th>Year</th><th>Status</th><th>Citations</th></tr></thead>
              <tbody>
                ${myPubs.map(p => `
                  <tr>
                    <td style="font-weight: 500; max-width: 320px;">${p.title}</td>
                    <td style="color: #5B6472;">${p.venue}</td>
                    <td>${p.year}</td>
                    <td>${renderBadge(p.status, 'sm')}</td>
                    <td style="font-weight: 600;">${p.citations}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="card" style="padding: 60px; text-align: center;">
            <div style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 15px; color: #1B1F27;">${activeProfileTab} data available</div>
            <div style="font-size: 13px; color: #9CA3AF; margin-top: 4px;">Content for this tab is loaded from the server.</div>
          </div>
        `}
      </div>
    `;

    document.getElementById('backToDirBtn').onclick = () => { currentView = 'directory'; render(); };
    document.getElementById('editProfileBtn').onclick = () => { modalState = { type: 'researcher', mode: 'edit', item: r }; render(); };

    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
      btn.onclick = () => {
        activeProfileTab = btn.getAttribute('data-tab');
        renderProfileView();
      };
    });
  }

  // ── 3. Institutions View ───────────────────────────────────────────────
  function renderInstitutionsView() {
    const countries = ['All Countries', ...Array.from(new Set(_institutions.map(i => i.country))).sort()];

    const filtered = _institutions.filter(i =>
      (instTypeFilter === 'All Types' || i.type === instTypeFilter) &&
      (instCountryFilter === 'All Countries' || i.country === instCountryFilter) &&
      i.name.toLowerCase().includes(instSearch.toLowerCase())
    );

    appContainer.innerHTML = `
      <div>
        <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">
          <div style="position: relative; flex: 1; max-width: 300px;">
            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9CA3AF;">🔍</span>
            <input class="field-input" id="instSearchInput" placeholder="Search institutions…" value="${instSearch}" style="padding-left: 32px; height: 36px; font-size: 13px;" />
          </div>
          <select class="field-input" id="instTypeSelect" style="height: 36px; width: 170px; font-size: 13px;">
            <option ${instTypeFilter === 'All Types' ? 'selected' : ''}>All Types</option>
            <option ${instTypeFilter === 'University' ? 'selected' : ''}>University</option>
            <option ${instTypeFilter === 'Research Institute' ? 'selected' : ''}>Research Institute</option>
            <option ${instTypeFilter === 'Funding Body' ? 'selected' : ''}>Funding Body</option>
          </select>
          <select class="field-input" id="instCountrySelect" style="height: 36px; width: 160px; font-size: 13px;">
            ${countries.map(c => `<option ${instCountryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <button class="btn-primary" id="addInstBtn" style="margin-left: auto;">
            <span>+</span> Add Institution
          </button>
        </div>

        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Institution Name</th>
                <th>Type</th>
                <th>Country</th>
                <th># Researchers</th>
                <th># Publications</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colSpan="7" style="text-align: center; padding: 32px; color: #9CA3AF;">No institutions match the current filters.</td></tr>
              ` : filtered.map(inst => `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: #1B1F27;">${inst.name}</div>
                    <div style="font-size: 11.5px; color: #9CA3AF;">Est. ${inst.established}</div>
                  </td>
                  <td>${renderBadge(inst.type, 'sm')}</td>
                  <td style="color: #5B6472;">${inst.country}</td>
                  <td style="font-weight: 600;">${inst.researchers.toLocaleString()}</td>
                  <td style="font-weight: 600;">${inst.publications.toLocaleString()}</td>
                  <td>${renderBadge(inst.status, 'sm')}</td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn-secondary edit-inst-btn" data-id="${inst.id}" style="padding: 4px 10px; font-size: 12px;">Edit</button>
                      <button class="btn-secondary view-inst-btn" data-id="${inst.id}" style="padding: 4px 10px; font-size: 12px;">View</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('instSearchInput').oninput = (e) => { instSearch = e.target.value; renderInstitutionsView(); };
    document.getElementById('instTypeSelect').onchange = (e) => { instTypeFilter = e.target.value; renderInstitutionsView(); };
    document.getElementById('instCountrySelect').onchange = (e) => { instCountryFilter = e.target.value; renderInstitutionsView(); };
    document.getElementById('addInstBtn').onclick = () => { modalState = { type: 'institution', mode: 'add' }; render(); };

    document.querySelectorAll('.edit-inst-btn').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const inst = _institutions.find(x => x.id === id);
        if (inst) { modalState = { type: 'institution', mode: 'edit', item: inst }; render(); }
      };
    });

    document.querySelectorAll('.view-inst-btn').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const inst = _institutions.find(x => x.id === id);
        if (inst) { modalState = { type: 'institution', mode: 'view', item: inst }; render(); }
      };
    });
  }

  // ── 4. Modal Handler ───────────────────────────────────────────────────
  function renderModal() {
    const container = document.getElementById('modalMountPoint');
    if (!modalState) {
      container.innerHTML = '';
      return;
    }

    const { type, mode, item } = modalState;
    const readOnly = mode === 'view';

    if (type === 'researcher') {
      const form = item || {
        name: '', title: '', department: '', institution: '', avatar: '',
        skills: [], interests: [], publications: 0, projects: 0, conferences: 0,
        collaborators: 0, email: '', phone: '', bio: '', hIndex: 0, citations: 0,
      };

      const titleText = mode === 'add' ? 'Add Researcher' : mode === 'edit' ? 'Edit Researcher' : form.name;

      container.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px;">
          <div class="card" style="width: 600px; max-width: 100%; max-height: 90vh; display: flex; flex-direction: column; border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid #F3F4F6; flex-shrink: 0;">
              <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 15.5px; margin: 0; color: #1B1F27;">${titleText}</h3>
              <button id="closeModalBtn" style="background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 2;">✕</button>
            </div>
            <div style="flex: 1; overflow-y: auto; padding: 20px 22px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div><label class="field-label">Full Name</label><input class="field-input" id="r_name" value="${form.name}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} /></div>
                <div><label class="field-label">Title</label><input class="field-input" id="r_title" value="${form.title}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} /></div>
                <div><label class="field-label">Department</label><input class="field-input" id="r_dept" value="${form.department}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} /></div>
                <div><label class="field-label">Institution</label><input class="field-input" id="r_inst" value="${form.institution}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} /></div>
                <div><label class="field-label">Email</label><input class="field-input" id="r_email" value="${form.email}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} /></div>
                <div><label class="field-label">Phone</label><input class="field-input" id="r_phone" value="${form.phone}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} /></div>
              </div>
              <div style="margin-top: 14px;">
                <label class="field-label">Biography</label>
                <textarea class="field-input" id="r_bio" rows="3" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''}>${form.bio}</textarea>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-top: 14px;">
                <div><label class="field-label">Publications</label><input class="field-input" type="number" id="r_pubs" value="${form.publications}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} /></div>
                <div><label class="field-label">h-Index</label><input class="field-input" type="number" id="r_hindex" value="${form.hIndex}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} /></div>
                <div><label class="field-label">Citations</label><input class="field-input" type="number" id="r_cites" value="${form.citations}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} /></div>
              </div>
              <div style="margin-top: 14px;">
                <label class="field-label">Skills (comma-separated)</label>
                <input class="field-input" id="r_skills" value="${form.skills.join(', ')}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} />
              </div>
              <div style="margin-top: 14px;">
                <label class="field-label">Research Interests (comma-separated)</label>
                <input class="field-input" id="r_interests" value="${form.interests.join(', ')}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} />
              </div>
            </div>
            <div style="padding: 14px 22px; border-top: 1px solid #F3F4F6; display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;">
              ${!readOnly ? `
                <button class="btn-secondary" id="cancelModalBtn">Cancel</button>
                <button class="btn-primary" id="saveModalBtn">Save</button>
              ` : `
                <button class="btn-secondary" id="cancelModalBtn">Close</button>
              `}
            </div>
          </div>
        </div>
      `;

      document.getElementById('closeModalBtn').onclick = () => { modalState = null; renderModal(); };
      document.getElementById('cancelModalBtn').onclick = () => { modalState = null; renderModal(); };

      if (!readOnly) {
        document.getElementById('saveModalBtn').onclick = () => {
          const name = document.getElementById('r_name').value;
          const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'XX';

          const updated = {
            id: form.id || Date.now(),
            name,
            title: document.getElementById('r_title').value,
            department: document.getElementById('r_dept').value,
            institution: document.getElementById('r_inst').value,
            email: document.getElementById('r_email').value,
            phone: document.getElementById('r_phone').value,
            bio: document.getElementById('r_bio').value,
            publications: Number(document.getElementById('r_pubs').value),
            hIndex: Number(document.getElementById('r_hindex').value),
            citations: Number(document.getElementById('r_cites').value),
            skills: document.getElementById('r_skills').value.split(',').map(s => s.trim()).filter(Boolean),
            interests: document.getElementById('r_interests').value.split(',').map(s => s.trim()).filter(Boolean),
            avatar: initials,
            projects: form.projects || 0,
            conferences: form.conferences || 0,
            collaborators: form.collaborators || 0
          };

          if (mode === 'add') {
            _researchers.push(updated);
          } else {
            _researchers = _researchers.map(x => x.id === updated.id ? updated : x);
            if (selectedResearcher && selectedResearcher.id === updated.id) {
              selectedResearcher = updated;
            }
          }

          modalState = null;
          render();
        };
      }
    } else if (type === 'institution') {
      const form = item || {
        id: Date.now(), name: '', type: 'University', country: '',
        researchers: 0, publications: 0, status: 'Active', established: new Date().getFullYear()
      };

      const titleText = mode === 'add' ? 'Add Institution' : mode === 'edit' ? 'Edit Institution' : form.name;

      container.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px;">
          <div class="card" style="width: 520px; max-width: 100%; max-height: 90vh; display: flex; flex-direction: column; border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid #F3F4F6; flex-shrink: 0;">
              <h3 style="font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 15.5px; margin: 0; color: #1B1F27;">${titleText}</h3>
              <button id="closeModalBtn" style="background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 2;">✕</button>
            </div>
            <div style="flex: 1; overflow-y: auto; padding: 20px 22px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div style="grid-column: 1/-1;">
                  <label class="field-label">Institution Name</label>
                  <input class="field-input" id="inst_name" value="${form.name}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} />
                </div>
                <div>
                  <label class="field-label">Type</label>
                  <select class="field-input" id="inst_type" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''}>
                    <option ${form.type === 'University' ? 'selected' : ''}>University</option>
                    <option ${form.type === 'Research Institute' ? 'selected' : ''}>Research Institute</option>
                    <option ${form.type === 'Funding Body' ? 'selected' : ''}>Funding Body</option>
                  </select>
                </div>
                <div>
                  <label class="field-label">Country</label>
                  <input class="field-input" id="inst_country" value="${form.country}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} />
                </div>
                <div>
                  <label class="field-label">Year Established</label>
                  <input class="field-input" type="number" id="inst_established" value="${form.established}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} />
                </div>
                <div>
                  <label class="field-label">Status</label>
                  <select class="field-input" id="inst_status" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''}>
                    <option ${form.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option ${form.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                  </select>
                </div>
                <div>
                  <label class="field-label">Number of Researchers</label>
                  <input class="field-input" type="number" id="inst_res_count" value="${form.researchers}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} />
                </div>
                <div>
                  <label class="field-label">Number of Publications</label>
                  <input class="field-input" type="number" id="inst_pub_count" value="${form.publications}" ${readOnly ? 'disabled style="background:#F5F6F8;"' : ''} />
                </div>
              </div>
            </div>
            <div style="padding: 14px 22px; border-top: 1px solid #F3F4F6; display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;">
              ${!readOnly ? `
                <button class="btn-secondary" id="cancelModalBtn">Cancel</button>
                <button class="btn-primary" id="saveModalBtn">Save</button>
              ` : `
                <button class="btn-secondary" id="cancelModalBtn">Close</button>
              `}
            </div>
          </div>
        </div>
      `;

      document.getElementById('closeModalBtn').onclick = () => { modalState = null; renderModal(); };
      document.getElementById('cancelModalBtn').onclick = () => { modalState = null; renderModal(); };

      if (!readOnly) {
        document.getElementById('saveModalBtn').onclick = () => {
          const updated = {
            id: form.id || Date.now(),
            name: document.getElementById('inst_name').value,
            type: document.getElementById('inst_type').value,
            country: document.getElementById('inst_country').value,
            established: Number(document.getElementById('inst_established').value),
            status: document.getElementById('inst_status').value,
            researchers: Number(document.getElementById('inst_res_count').value),
            publications: Number(document.getElementById('inst_pub_count').value)
          };

          if (mode === 'add') {
            _institutions.push(updated);
          } else {
            _institutions = _institutions.map(x => x.id === updated.id ? updated : x);
          }

          modalState = null;
          render();
        };
      }
    }
  }

  // ── TopBar Listeners & Theme ───────────────────────────────────────────
  function setupTopBarListeners() {
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.onclick = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      themeBtn.innerHTML = next === 'dark' ? '☀️ Light' : '🌙 Dark';
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
