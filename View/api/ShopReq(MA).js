



const token = localStorage.getItem('token');

async function loadOrders() {
  try {
    const response = await fetch('http://localhost:4000/api/v1/order/allOrder', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to load orders');

    const data = await response.json();
    displayOrders(data.filteredOrders);
  } catch (err) {
    console.error(err.message);
    document.getElementById('orders-list').innerHTML = `<p class="message">Failed to load orders</p>`;
  }
}



function displayOrders(orders) {
  const container = document.getElementById('orders-list');
  container.innerHTML = '';

  if (!orders || orders.length === 0) {
    container.innerHTML = `<p class="message">No orders found.</p>`;
    return;
  }

  orders.forEach(order => {
    const orderEl = document.createElement('div');
    orderEl.className = 'order';

    const productItems = order.products.map(p =>
      `<li>${p.productId?.name || 'Deleted Product'} - Quantity: ${p.quantity}</li>`
    ).join('');

    orderEl.innerHTML = `
      <p><strong>Order ID:</strong> ${order._id}</p>
      <ul class="product-list">${productItems}</ul>
      <p class="total">Total Price: $${order.totalPrice}</p>
      <div class="buttons">
        ${order.status === 'pending' ? `
          <button class="accept" onclick="handleAction('${order._id}', 'accepted')">Accept</button>
          <button class="reject" onclick="handleAction('${order._id}', 'rejected')">Reject</button>
        ` : `<p class="status">Status: ${order.status}</p>`}
      </div>
    `;

    container.appendChild(orderEl);
  });
}

async function handleAction(orderId, status) {
  try {
    const response = await fetch(`http://localhost:4000/api/v1/order/${status}/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    alert(data.message);
    loadOrders();
  } catch (err) {
    console.error(err.message);
    alert('Failed to perform the action');
  }
}

loadOrders();
