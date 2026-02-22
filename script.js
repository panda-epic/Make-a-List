const { createClient } = supabase;

// Use values from supabaseConfig.js
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// --- Populate group dropdown ---
async function loadGroups() {
  const { data, error } = await supabaseClient
    .from("item_group")
    .select("list_id, list_name");

  const groupSelect = document.getElementById("groupSelect");
  groupSelect.innerHTML = '<option value="">-- Select a group --</option>';

  if (error) {
    console.error("❌ Error loading groups:", error.message);
    return;
  }

  if (data.length > 0) {
    groupSelect.disabled = false;
    data.forEach(group => {
      const option = document.createElement("option");
      option.value = group.list_id;
      option.textContent = group.list_name;
      groupSelect.appendChild(option);
    });
  } else {
    groupSelect.disabled = true;
    document.getElementById("addItemBtn").disabled = true;
  }
}

// --- Create a new list group ---
async function createListGroup() {
  const listName = document.getElementById("listNameInput").value.trim();
  const isShared = document.getElementById("sharedToggle").checked;

  if (!listName) {
    alert("Please enter a list name.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("item_group")
    .insert([{ list_name: listName, is_shared: isShared }])
    .select();

  if (error) {
    console.error("❌ Error creating list:", error.message);
    alert("Failed to create list.");
  } else {
    console.log("✅ List created:", data);
    alert(`List "${listName}" created successfully! Shared: ${isShared}`);
    loadGroups(); // refresh dropdown
  }
}

// --- Add a new item linked to selected group ---
async function addItem() {
  const itemName = document.getElementById("itemInput").value.trim();
  const category = document.getElementById("categoryInput").value;
  const count = parseInt(document.getElementById("countInput").value) || 1;
  const price = parseFloat(document.getElementById("priceInput").value) || null;
  const listId = document.getElementById("groupSelect").value;

  if (!listId) {
    alert("Please select a group first.");
    return;
  }
  if (!itemName) {
    alert("Please enter an item name.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("items_list")
    .insert([{
      list_id: listId,
      item_name: itemName,
      item_category: category,
      item_count: count,
      item_price: price
    }])
    .select();

  if (error) {
    console.error("❌ Error adding item:", error.message);
    alert("Failed to add item.");
  } else {
    console.log(`✅ Item "${itemName}" added to group:`, data);
    alert(`Item "${itemName}" added successfully!`);
  }
}

// --- Enable Add Item button when group selected ---
document.getElementById("groupSelect").addEventListener("change", function() {
  document.getElementById("addItemBtn").disabled = !this.value;
});

// Ensure at least one group exists
const { data: lists, error: listError } = await supabaseClient
  .from("item_group")
  .select("list_id, list_name")
  .order("created_at", { ascending: false }) // get latest group
  .limit(1);

if (listError) {
  console.error("❌ Error fetching list:", listError.message);
  return;
}
if (!lists || lists.length === 0) {
  alert("No item group found. Please create a group first.");
  console.error("❌ No item group exists.");
  return;
}

const listId = lists[0].list_id;

const { data, error } = await supabaseClient
  .from("items_list")
  .insert([{
    list_id: listId,
    item_name: itemName,
    item_category: category,
    item_count: count,
    item_price: price
  }])
  .select();

if (error) {
  console.error("❌ Error adding item:", error.message);
  alert("Failed to add item.");
} else {
  console.log(`✅ Item "${itemName}" added to group "${lists[0].list_name}":`, data);
  alert(`Item "${itemName}" added successfully to group "${lists[0].list_name}"!`);
}


// --- Fetch items by list group name ---
async function fetchList() {
  const listName = document.getElementById("fetchListNameInput").value.trim();
  if (!listName) {
    alert("Please enter a list group name.");
    return;
  }

  // Find the list_id for the given name
  const { data: listData, error: listError } = await supabaseClient
    .from("item_group")
    .select("list_id")
    .eq("list_name", listName)
    .limit(1);

  if (listError) {
    console.error("❌ Error fetching list group:", listError.message);
    return;
  }
  if (!listData || listData.length === 0) {
    alert("No list found with that name.");
    return;
  }

  const listId = listData[0].list_id;

  // Fetch items for that list_id
  const { data: items, error: itemsError } = await supabaseClient
    .from("items_list")
    .select("*")
    .eq("list_id", listId);

  if (itemsError) {
    console.error("❌ Error fetching items:", itemsError.message);
    return;
  }

  console.log("✅ Items fetched:", items);

  // Render items in the <ul>
  const listElement = document.getElementById("list");
  listElement.innerHTML = ""; // clear old items
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.item_name} (${item.item_category}) - Count: ${item.item_count}, Price: ${item.item_price ?? "N/A"}`;
    listElement.appendChild(li);
  });
}

// --- Bind buttons ---
document.getElementById("createListBtn").addEventListener("click", createListGroup);
document.getElementById("addItemBtn").addEventListener("click", addItem);
document.getElementById("fetchListBtn").addEventListener("click", fetchList);

// --- Load groups on page load ---
window.onload = loadGroups;
