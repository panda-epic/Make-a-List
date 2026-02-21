const { createClient } = supabase;

const supabaseUrl = "https://jaxnufmqpegezmovpaur.supabase.co";
const supabaseKey = "sb_publishable_ie_p8CqCoGbO7gqkB7oenw_Hzs1vPem";
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// --- Create a new list group ---
async function createListGroup() {
  const listName = document.getElementById("listNameInput").value.trim();
  if (!listName) {
    alert("Please enter a list name.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("item_group")
    .insert([{ list_name: listName }])
    .select();

  if (error) {
    console.error("❌ Error creating list:", error.message);
  } else {
    console.log("✅ List created:", data);
    alert("List created successfully!");
  }
}

// --- Add a new item to the first list ---
async function addItem() {
  const itemName = document.getElementById("itemInput").value.trim();
  const category = document.getElementById("categoryInput").value;
  const count = parseInt(document.getElementById("countInput").value) || 1;
  const price = parseFloat(document.getElementById("priceInput").value) || null;

  if (!itemName) {
    alert("Please enter an item name.");
    return;
  }

  const { data: lists, error: listError } = await supabaseClient
    .from("item_group")
    .select("list_id")
    .limit(1);

  if (listError) {
    console.error("❌ Error fetching list:", listError.message);
    return;
  }
  if (!lists || lists.length === 0) {
    alert("No list found. Please create a list first.");
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
  } else {
    console.log("✅ Item added:", data);
    alert("Item added successfully!");
  }
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
