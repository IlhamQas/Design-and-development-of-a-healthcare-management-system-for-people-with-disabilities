ocument.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("product-name").value;
  const nameArabic = document.getElementById("product-name-arabic").value; // optional
  const price = document.getElementById("product-price").value;
  const quantity = document.getElementById("product-quantity").value;
  const description = document.getElementById("product-description").value;
  const image = document.getElementById("product-image").files[0];
  const category = document.getElementById("product-category").value;

  if (!image) {
    showStatusMessage("Please upload a product image", false);
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("quantity", quantity);
  formData.append("category", category);
  formData.append("image", image);

  try {
    const response = await fetch("http://localhost:4000/api/v1/product/add", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      showStatusMessage(result.message, true);
      document.getElementById("product-form").reset();
      setTimeout(() => {
        window.location.href = "../Html/ProductList.html";
      }, 1500);
    } else {
      showStatusMessage(`Error: ${result.message}`, false);
    }
  } catch (err) {
    showStatusMessage("An error occurred while sending data", false);
    console.error(err);
  }
});