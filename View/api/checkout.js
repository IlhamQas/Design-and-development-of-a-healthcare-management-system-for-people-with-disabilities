
const userData = localStorage.getItem('user');

let userId = null;
if (userData) {
  try {
    const parsedUser = JSON.parse(userData);
    userId = parsedUser._id; 
  } catch (error) {
    console.error('Failed to parse user data from localStorage:', error);
  }
}

console.log('User ID:', userId);


async function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    try {
        const response = await fetch('http://localhost:4000/api/v1/order/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        const data = await response.json();
        if (response.status !== 200) {
            console.error(data.message || 'Failed to fetch cart data');
            return;
        }

        const cart = data.cart.products;
        cartItems.innerHTML = '';  
        cart.forEach(item => {
           
            const cartItem = document.createElement("li");
            cartItem.classList.add("list-group-item");
            cartItem.innerHTML = `${item.productId.name} ---> ₪${item.productId.price} x ${item.quantity}`;
            cartItems.appendChild(cartItem);
        });

        const totalPrice = cart.reduce((total, item) => total + (item.productId.price * item.quantity), 0);
        cartTotal.innerHTML = `₪${totalPrice.toFixed(2)}`;

    } catch (error) {
        console.error('Error fetching cart:', error);
    }
}
async function submitOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || { products: [], totalPrice: 0 };
    const fullName = document.getElementById("full-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
  
    if (!fullName || !email || !phone || !address) {
      showStatusMessage("Please fill in all the fields", false);
      return;
    }
  
    const orderDetails = {
      fullName,
      email,
      phone,
      address,
      cart: cart.products,
      totalAmount: cart.totalPrice
    };
  
    try {
      const response = await fetch('http://localhost:4000/api/v1/order/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(orderDetails)
      });
  
      const data = await response.json();
  
      if (response.status === 200) {
        showStatusMessage("✅ Your order has been successfully submitted.", true);
        localStorage.removeItem('cart');
  
        document.getElementById("cart-items").innerHTML = '';
        document.getElementById("cart-total").innerHTML = '₪0.00';
  
        const res = await fetch('http://localhost:4000/api/v1/contact/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({
            name: fullName,
            email: email,
            location: address
          })
        });
  
        const contactRes = await res.json();
  
        if (res.ok) {
          showStatusMessage("✅ Your contact information was saved successfully.", true);
  
          await sendNotification(
            "Order Received",
            `Dear ${fullName},\n\nWe have successfully received your order. Our team will contact you shortly to confirm the order.\n\nThank you for choosing us!`,
            userId
          );

        /*  const agentIdsSet = new Set();
          cart.products.forEach(item => {
            const agentId = item.productId.createdBy._id;
            if (agentId) {
              agentIdsSet.add(agentId);
            }
          });
  
          const uniqueAgentIds = Array.from(agentIdsSet);
  
          // إرسال إشعار لكل مالك منتج
          if (uniqueAgentIds.length > 0) {
            await sendNotification(
              "New Order Received",
              `You have received a new order including your product(s). Please check the order details and proceed accordingly.`,
              uniqueAgentIds
            );
          } */
          
        } else {
          showStatusMessage(contactRes.message || "❌ Failed to save contact information.", false);
        }
  
        setTimeout(() => {
          window.location.href = "../Html/order-confirmation.html";
        }, 1500);
  
      } else {
        showStatusMessage(data.message || "❌ Order submission failed. Please try again.", false);
      }
  
    } catch (error) {
      console.error("Error submitting the order:", error);
      showStatusMessage("❌ An error occurred. Please try again.", false);
    }
  }
  
  document.getElementById("checkout-form").addEventListener("submit", function (e) {
    e.preventDefault();
    submitOrder();
  });
  
  

 
async function sendNotification(title, message, receivers) {

    if (!Array.isArray(receivers)) {
      receivers = [receivers];  
    }
    receivers = receivers.filter(id => typeof id === 'string' && id.length === 24);
    
    await fetch(`http://localhost:4000/api/v1/notification/sendNotification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
    
      body: JSON.stringify({
        title,
        message,
        userIds: receivers 
      })
    });
    }
renderCart();
