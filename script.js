const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// =============================================
// TOAST NOTIFICATIONS (replaces all alert())
// =============================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

// =============================================
// AUTH UI — swap between form and user card
// =============================================
function showUserCard(user) {
  document.getElementById('authForm').style.display = 'none';
  document.getElementById('userCard').style.display = 'flex';
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userAvatar').textContent = user.email[0].toUpperCase();
  // Wire up the sign-out button on the card
  document.getElementById('signOutBtn2').onclick = signOut;
}

function showAuthForm() {
  document.getElementById('authForm').style.display = 'flex';
  document.getElementById('userCard').style.display = 'none';
}

// =============================================
// SHOW LOGGED-IN USER INFO (kept for script.js compatibility)
// =============================================
function showUserInfo(user) {
  if (user) {
    showUserCard(user);
  } else {
    showAuthForm();
  }
}

// =============================================
// AUTHENTICATION
// =============================================
async function signUp() {
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();

  const { data, error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    console.error('❌ Sign-up error:', error.message);
    showToast('Sign up failed: ' + error.message, 'error');
  } else {
    console.log('✅ Sign-up successful:', data);
    showToast('Check your email to confirm your account.', 'info');
  }
}

async function signIn() {
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('❌ Sign-in error:', error.message);
    showToast('Sign in failed: ' + error.message, 'error');
  } else {
    console.log('✅ Sign-in successful:', data);
    showToast('Signed in successfully!', 'success');
    document.getElementById('signOutBtn').disabled = false;
    showUserInfo(data.user);
    enableAppFeatures();
    loadGroups();
  }
}

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error('❌ Sign-out error:', error.message);
    showToast('Sign out failed: ' + error.message, 'error');
  } else {
    console.log('✅ Signed out');
    showToast('Signed out successfully.', 'info');
    document.getElementById('signOutBtn').disabled = true;
    showUserInfo(null);
    disableAppFeatures();
  }
}

// =============================================
// ENABLE / DISABLE APP FEATURES
// =============================================
function enableAppFeatures() {
  document.getElementById('createListBtn').disabled = false;
  document.getElementById('groupSelect').disabled = false;
  document.getElementById('addItemBtn').disabled = false;
  document.getElementById('signOutBtn').disabled = false;
  document.getElementById('passwordInput').disabled = true;
  document.getElementById('signUpBtn').disabled = true;
  document.getElementById('signInBtn').disabled = true;
}

function disableAppFeatures() {
  document.getElementById('createListBtn').disabled = true;
  document.getElementById('groupSelect').disabled = true;
  document.getElementById('addItemBtn').disabled = true;
  document.getElementById('passwordInput').disabled = false;
  document.getElementById('signUpBtn').disabled = false;
  document.getElementById('signInBtn').disabled = false;

  // Clear group tabs and item list
  document.getElementById('groupTabs').innerHTML = '';
  document.getElementById('list').innerHTML = '';
  updateEmptyState(false, false);

  // Reset topbar
  document.getElementById('activeListTitle').textContent = 'My Shopping List';
  document.getElementById('activeListSubtitle').textContent = 'Select a list from the sidebar';
}

// =============================================
// AUTH STATE LISTENER
// =============================================
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    console.log('🔑 User logged in:', session.user);
    showUserInfo(session.user);
    enableAppFeatures();
    loadGroups();
  } else {
    console.log('🔒 No user logged in');
    showUserInfo(null);
    disableAppFeatures();
  }
});

// =============================================
// EMPTY STATE MANAGEMENT
// =============================================
// hasList: whether a list tab is selected
// hasItems: whether the selected list has items
function updateEmptyState(hasList, hasItems) {
  const list = document.getElementById('list');
  const emptyState = document.getElementById('emptyState');
  const noListState = document.getElementById('noListState');
  const summary = document.getElementById('listSummary');

  if (!hasList) {
    list.style.display = 'none';
    emptyState.style.display = 'none';
    noListState.style.display = 'flex';
    summary.style.display = 'none';
  } else if (hasItems) {
    list.style.display = 'flex';
    emptyState.style.display = 'none';
    noListState.style.display = 'none';
    summary.style.display = 'flex';
  } else {
    list.style.display = 'none';
    emptyState.style.display = 'flex';
    noListState.style.display = 'none';
    summary.style.display = 'none';
  }
}

// =============================================
// RENDER GROUP TABS
// =============================================
let activeListId = null;

function renderGroupTabs(groups) {
  const groupTabs = document.getElementById('groupTabs');
  groupTabs.innerHTML = '';

  if (groups.length === 0) {
    groupTabs.innerHTML = '<p class="group-tabs-empty">No lists yet. Create one above.</p>';
    updateEmptyState(false, false);
    return;
  }

  groups.forEach(group => {
    const tab = document.createElement('button');
    tab.className = 'group-tab' + (group.list_id === activeListId ? ' active' : '');
    tab.dataset.listId = group.list_id;
    tab.dataset.listName = group.list_name;
    tab.innerHTML = `
      <span>${group.is_shared ? '👥 ' : ''}${group.list_name}</span>
      <button class="tab-delete-btn" title="Delete list">✕</button>
    `;

    // Click tab to load list
    tab.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-delete-btn')) return;
      setActiveTab(tab, group);
      fetchList(group.list_id);
    });

    // Delete list button
    tab.querySelector('.tab-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteListGroup(group.list_id, group.list_name);
    });

    groupTabs.appendChild(tab);
  });
}

function setActiveTab(tabEl, group) {
  document.querySelectorAll('.group-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');
  activeListId = group.list_id;

  // Sync the hidden dropdown
  document.getElementById('groupSelect').value = group.list_id;

  // Update topbar
  document.getElementById('activeListTitle').textContent = group.list_name;
  document.getElementById('activeListSubtitle').textContent = group.is_shared ? 'Shared list' : 'Personal list';
}

// =============================================
// RENDER GROUP DROPDOWN
// =============================================
function renderGroupDropdown(groups) {
  const groupSelect = document.getElementById('groupSelect');
  groupSelect.innerHTML = '<option value="">— Select a list —</option>';
  if (groups.length > 0) {
    groupSelect.disabled = false;
    groups.forEach(group => {
      const option = document.createElement('option');
      option.value = group.list_id;
      option.textContent = group.is_shared
        ? `${group.list_name} (Shared)`
        : group.list_name;
      groupSelect.appendChild(option);
    });
  } else {
    groupSelect.disabled = true;
    document.getElementById('addItemBtn').disabled = true;
  }
}

// =============================================
// LOAD GROUPS
// =============================================
async function loadGroups() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    renderGroupTabs([]);
    renderGroupDropdown([]);
    return;
  }

  const { data, error } = await supabaseClient
    .from('item_group')
    .select('list_id, list_name, is_shared')
    .or(`created_by.eq.${user.id},is_shared.eq.true`);

  if (error) {
    console.error('❌ Error loading groups:', error.message);
    showToast('Failed to load lists.', 'error');
    return;
  }

  renderGroupTabs(data);
  renderGroupDropdown(data);
}

// =============================================
// CREATE LIST GROUP
// =============================================
async function createListGroup() {
  const listName = document.getElementById('listNameInput').value.trim();
  const isShared = document.getElementById('sharedToggle').checked;

  if (!listName) {
    showToast('Please enter a list name.', 'error');
    return;
  }

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    showToast('You must be signed in to create a list.', 'error');
    return;
  }

  const { data, error } = await supabaseClient
    .from('item_group')
    .insert([{ list_name: listName, is_shared: isShared, created_by: user.id }])
    .select();

  if (error) {
    console.error('❌ Error creating list:', error.message);
    showToast('Failed to create list.', 'error');
  } else {
    console.log('✅ List created:', data);
    showToast(`List "${listName}" created!`, 'success');
    document.getElementById('listNameInput').value = '';
    document.getElementById('sharedToggle').checked = false;
    loadGroups();
  }
}

// =============================================
// DELETE LIST GROUP
// =============================================
async function deleteListGroup(listId, listName) {
  if (!confirm(`Delete the list "${listName}"? This will also remove all its items.`)) return;

  // Delete items first (foreign key)
  const { error: itemsError } = await supabaseClient
    .from('items_list')
    .delete()
    .eq('list_id', listId);

  if (itemsError) {
    console.error('❌ Error deleting items:', itemsError.message);
    showToast('Failed to delete list items.', 'error');
    return;
  }

  const { error } = await supabaseClient
    .from('item_group')
    .delete()
    .eq('list_id', listId);

  if (error) {
    console.error('❌ Error deleting list:', error.message);
    showToast('Failed to delete list.', 'error');
  } else {
    console.log('✅ List deleted:', listId);
    showToast(`List "${listName}" deleted.`, 'info');
    if (activeListId === listId) {
      activeListId = null;
      document.getElementById('list').innerHTML = '';
      document.getElementById('activeListTitle').textContent = 'My Shopping List';
      document.getElementById('activeListSubtitle').textContent = 'Select a list from the sidebar';
      updateEmptyState(false, false);
    }
    loadGroups();
  }
}

// =============================================
// ADD ITEM
// =============================================
async function addItem() {
  const itemName = document.getElementById('itemInput').value.trim();
  const category = document.getElementById('categoryInput').value;
  const count = parseInt(document.getElementById('countInput').value) || 1;
  const price = parseFloat(document.getElementById('priceInput').value) || null;
  const listId = document.getElementById('groupSelect').value;

  if (!listId) {
    showToast('Please select a list first.', 'error');
    return;
  }
  if (!itemName) {
    showToast('Please enter an item name.', 'error');
    return;
  }

  const { data, error } = await supabaseClient
    .from('items_list')
    .insert([{
      list_id: listId,
      item_name: itemName,
      item_category: category,
      item_count: count,
      item_price: price
    }])
    .select();

  if (error) {
    console.error('❌ Error adding item:', error.message);
    showToast('Failed to add item.', 'error');
  } else {
    console.log(`✅ Item "${itemName}" added:`, data);
    showToast(`"${itemName}" added!`, 'success');
    // Clear inputs
    document.getElementById('itemInput').value = '';
    document.getElementById('countInput').value = '1';
    document.getElementById('priceInput').value = '';
    // Auto-refresh the list
    fetchList(listId);
  }
}

// =============================================
// DELETE ITEM
// =============================================
async function deleteItem(itemId, itemName, listId) {
  const { error } = await supabaseClient
    .from('items_list')
    .delete()
    .eq('item_id', itemId);

  if (error) {
    console.error('❌ Error deleting item:', error.message);
    showToast('Failed to delete item.', 'error');
  } else {
    console.log('✅ Item deleted:', itemId);
    showToast(`"${itemName}" removed.`, 'info');
    currentListId = item.list_id;
    fetchList(currentListId);
  }
}

// =============================================
// FETCH + RENDER ITEMS
// =============================================
async function fetchList(listId) {
  const { data: items, error } = await supabaseClient
    .from('items_list')
    .select('*')
    .eq('list_id', listId);

  if (error) {
    console.error('❌ Error fetching items:', error.message);
    showToast('Failed to fetch items.', 'error');
    return;
  }

  console.log('✅ Items fetched:', items);

  const listElement = document.getElementById('list');
  listElement.innerHTML = '';

  if (items.length === 0) {
    updateEmptyState(true, false);
    return;
  }

  updateEmptyState(true, true);
  renderSummary(items);

  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="item-name">${item.item_name}</span>
      <span class="item-badge">${item.item_category}</span>
      <span class="item-meta">×${item.item_count}${item.item_price != null ? ' · $' + parseFloat(item.item_price).toFixed(2) : ''}</span>
      <button class="item-delete-btn" title="Remove item">✕</button>
    `;
    li.querySelector('.item-delete-btn').addEventListener('click', () => {
      deleteItem(item.item_id, item.item_name, item.list_id);
    });
    listElement.appendChild(li);
  });
}

// =============================================
// RENDER SUMMARY
// =============================================
const CATEGORY_EMOJI = {
  'Grocery':   '🛒',
  'Shopping':  '🛍️',
  'To Buy':    '📦',
  'Dine-in':   '🍽️',
  'Take-outs': '🥡',
  'Custom':    '✏️',
};

function renderSummary(items) {
  // Totals
  const totalItems = items.reduce((sum, i) => sum + (i.item_count || 1), 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.item_price != null ? parseFloat(i.item_price) * (i.item_count || 1) : 0), 0);

  document.getElementById('summaryTotalItems').textContent = totalItems;
  document.getElementById('summaryTotalPrice').textContent = '$' + totalPrice.toFixed(2);

  // Per-category breakdown
  const cats = {};
  items.forEach(item => {
    const cat = item.item_category || 'Custom';
    if (!cats[cat]) cats[cat] = { count: 0, price: 0, hasPrice: false };
    cats[cat].count += (item.item_count || 1);
    if (item.item_price != null) {
      cats[cat].price += parseFloat(item.item_price) * (item.item_count || 1);
      cats[cat].hasPrice = true;
    }
  });

  const container = document.getElementById('summaryCategories');
  container.innerHTML = '';
  Object.entries(cats).forEach(([cat, data]) => {
    const card = document.createElement('div');
    card.className = 'summary-cat-card';
    card.innerHTML = `
      <span class="summary-cat-emoji">${CATEGORY_EMOJI[cat] || '📋'}</span>
      <div class="summary-cat-info">
        <span class="summary-cat-name">${cat}</span>
        <span class="summary-cat-meta">${data.count} item${data.count !== 1 ? 's' : ''}</span>
      </div>
      <span class="summary-cat-price">${data.hasPrice ? '$' + data.price.toFixed(2) : '—'}</span>
    `;
    container.appendChild(card);
  });
}

// =============================================
// LOOKUP USER / SHARE GROUP (existing, unchanged)
// =============================================
async function lookupUserByEmail(email) {
  const { data, error } = await supabaseClient
    .rpc('get_user_by_email', { email });
}

async function shareGroup(listId, targetUserId, permission = 'view') {
  const { error } = await supabaseClient
    .from('access_list')
    .insert([{
      list_id: listId,
      user_id: targetUserId,
      permission: permission,
      granted_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('❌ Error sharing group:', error.message);
    showToast('Failed to share list.', 'error');
  } else {
    showToast('List shared successfully!', 'success');
  }
}

// =============================================
// AUTO-INIT ON PAGE LOAD
// =============================================
window.onload = async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session && session.user) {
    console.log('🔑 User already logged in:', session.user);
    showUserInfo(session.user);
    document.getElementById('signOutBtn').disabled = false;
    enableAppFeatures();
    await loadGroups();
  } else {
    console.log('🔒 No user logged in on page load');
    showUserInfo(null);
    disableAppFeatures();
  }
};

// =============================================
// EVENT LISTENERS
// =============================================
document.getElementById('groupSelect').addEventListener('change', function () {
  document.getElementById('addItemBtn').disabled = !this.value;
});

document.getElementById('createListBtn').addEventListener('click', createListGroup);
document.getElementById('addItemBtn').addEventListener('click', addItem);
document.getElementById('signUpBtn').addEventListener('click', signUp);
document.getElementById('signInBtn').addEventListener('click', signIn);
document.getElementById('signOutBtn').addEventListener('click', signOut);

