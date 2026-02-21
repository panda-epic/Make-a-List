document.getElementById("addBtn").addEventListener("click", addItem);

function addItem() {
  const input = document.getElementById("itemInput");
  const list = document.getElementById("list");

  if (input.value.trim() !== "") {
    const li = document.createElement("li");
    li.textContent = input.value;
    list.appendChild(li);
    input.value = "";
  }
}
