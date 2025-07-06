async function getMyProducts() {
    const token = localStorage.getItem("token");
    if (!token) return alert("Sing in first");

    const userId = JSON.parse(atob(token.split('.')[1])).id;

    const res = await fetch("http://localhost:4000/api/v1/product/show", {
      method: 'GET',
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    const myProducts = data.product.filter(p => p.createdBy === userId);
    const container = document.getElementById("products");

    if (myProducts.length === 0) {
      container.innerHTML = "<p>No products found.</p>";
      return;
    }

    container.innerHTML = "";
    myProducts.forEach(product => {
      const productItem = document.createElement("div");
      productItem.className = "product-item";

      productItem.innerHTML = `
        <img style="height: 300px;" src="${product.image || '../media/default.jpg'}" alt="${product.name}">
        <div class="product-info">
          <div class="product-name">name:${product.name}</div>
          <div class="product-category">category: ${product.category}</div>
          <div class="product-description">description: ${product.description}</div>
          <div class="product-quantity">quantity: ${product.quantity}</div>
        </div>
        <div class="buttons">
          <button class="edit-button" onclick="editProduct('${product._id}')">
            <i class="fas fa-edit"></i> Update
          </button>
          <button class="delete-button" onclick="deleteProduct('${product._id}')">
            <i class="fas fa-trash-alt"></i> delete
          </button>
        </div>
      `;
      
      container.appendChild(productItem);
    });
  }

  async function editProduct(id) {
    if (!id) {
      console.error("Product ID is not defined!");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      showStatusMessage("Please sign in first!", false);
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:4000/api/v1/product/show/${id}`, {
        method: 'GET',
        headers: { "Authorization": `Bearer ${token}` }
      });
  
      if (!res.ok) {
        showStatusMessage("Error fetching product data.", false);
        return;
      }
  
      const product = await res.json();
      document.getElementById("product-id").value = product.product._id;
      document.getElementById("product-name").value = product.product.name;
      document.getElementById("product-category").value = product.product.category;
      document.getElementById("product-description").value = product.product.description;
  
      const editModal = new bootstrap.Modal(document.getElementById("editModal"));
      editModal.show();
    } catch (error) {
      console.error(error);
      showStatusMessage("Unexpected error while fetching product.", false);
    }
  }
  
  document.getElementById("edit-form").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const id = document.getElementById("product-id").value;
    const name = document.getElementById("product-name").value;
    const category = document.getElementById("product-category").value;
    const description = document.getElementById("product-description").value;
  
    if (!id) {
      showStatusMessage("Invalid product ID.", false);
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      showStatusMessage("Please sign in first!", false);
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:4000/api/v1/product/update/${id}`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, category, description })
      });
  
      if (!res.ok) {
        showStatusMessage("Update failed.", false);
        return;
      }
  
      showStatusMessage("Updated successfully!", true);
  
      const editModalElement = document.getElementById("editModal");
      const editModal = bootstrap.Modal.getInstance(editModalElement);
      editModal.hide();
  
      getMyProducts();
    } catch (error) {
      console.error(error);
      showStatusMessage("Unexpected error during update.", false);
    }
  });
  
  
  async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone!")) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      showStatusMessage("Please sign in first!", false);
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:4000/api/v1/product/delete/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
  
      if (!res.ok) {
        showStatusMessage("Error occurred while deleting.", false);
        return;
      }
  
      showStatusMessage("Deleted successfully!", true);
      getMyProducts();
    } catch (error) {
      console.error(error);
      showStatusMessage("Unexpected error while deleting.", false);
    }
  }
  