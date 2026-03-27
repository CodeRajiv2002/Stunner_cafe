# Frontend API Response Handler Guide

## Standard Response Format

All API endpoints now return responses in this consistent format:

### Success Response

```json
{
  "statuscode": 200,
  "data": {
    /* your actual data */
  },
  "message": "Success message",
  "success": true
}
```

### Error Response

```json
{
  "statuscode": 400,
  "data": null,
  "message": "Error message describing what went wrong",
  "success": false,
  "stack": "..." // Only in development environment
}
```

## Frontend Response Handler Pattern

### Universal Response Handler

```javascript
// utils/api.js or similar
export const handleApiResponse = (response) => {
  if (response.success) {
    // ✅ Success case
    console.log(response.message);
    return response.data;
  } else {
    // ❌ Error case
    console.error(response.message);
    throw new Error(response.message);
  }
};

// Usage in components
try {
  const data = handleApiResponse(apiResponse);
  // Use data
} catch (error) {
  console.error(error.message);
  // Show error to user
}
```

### Axios Interceptor Pattern

```javascript
// In your api.js or axios setup
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    const { success, message, data } = response.data;

    if (!success) {
      // Handle API error
      return Promise.reject(new Error(message));
    }

    return data; // Return only the data
  },
  (error) => {
    // Handle network error
    return Promise.reject(error);
  },
);

export default api;

// Usage:
const data = await api.get("/orders/today");
// data is already extracted from response!
```

### Component Usage Example

```javascript
// MenuContext.jsx or similar
import api from "./api";

export const MenuProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const fetchMenuItems = async () => {
    try {
      const menuItems = await api.get("/menu/allitems");
      setItems(menuItems);
      setError(null);
    } catch (err) {
      setError(err.message); // Already has error message
      console.error(err);
    }
  };

  return (
    <MenuContext.Provider value={{ items, error, fetchMenuItems }}>
      {children}
    </MenuContext.Provider>
  );
};
```

## API Endpoint Status Codes

| Code | Meaning      | Example                   |
| ---- | ------------ | ------------------------- |
| 200  | Success      | GET /api/tables           |
| 201  | Created      | POST /api/tables          |
| 400  | Bad Request  | Missing required field    |
| 404  | Not Found    | Order ID doesn't exist    |
| 500  | Server Error | Database connection error |

## Common API Endpoints

### Orders

```
GET    /api/orders/today        ✅ Get today's orders
GET    /api/orders/history      ✅ Get order history
PUT    /api/orders/update/:id   ✅ Update order status
PATCH  /api/orders/:id/payment  ✅ Update payment status
```

### Tables

```
GET    /api/tables              ✅ Get all tables
POST   /api/tables              ✅ Create new table
PUT    /api/tables/:number      ✅ Update table status
DELETE /api/tables/:number/reset ✅ Reset table
```

### Menu

```
GET    /api/menu/allitems       ✅ Get all menu items
```

### Chat

```
GET    /api/messages/active     ✅ Get active chats
DELETE /api/messages/:table     ✅ Clear table chat
```

## Error Handling Patterns

### Pattern 1: Try-Catch

```javascript
try {
  const response = await fetch("/api/orders/today");
  const result = await response.json();

  if (result.success) {
    console.log("Orders:", result.data);
  } else {
    console.error("Error:", result.message);
    // Show error message to user
  }
} catch (error) {
  console.error("Network error:", error);
}
```

### Pattern 2: Promise Chain

```javascript
fetch("/api/orders/today")
  .then((res) => res.json())
  .then((result) => {
    if (result.success) {
      handleOrdersData(result.data);
    } else {
      showErrorMessage(result.message);
    }
  })
  .catch((error) => {
    console.error("Failed to fetch orders:", error);
  });
```

### Pattern 3: Async/Await

```javascript
const getOrders = async () => {
  try {
    const response = await fetch("/api/orders/today");
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    // Re-throw or handle appropriately
    throw error;
  }
};
```

## Validation Examples

### Check if Response is Valid

```javascript
const isValidResponse = (response) => {
  return (
    response &&
    typeof response.statuscode === "number" &&
    typeof response.message === "string" &&
    typeof response.success === "boolean" &&
    response.data !== undefined
  );
};
```

### Handle Different Error Codes

```javascript
const handleApiError = (response) => {
  switch (response.statuscode) {
    case 400:
      showNotification("Invalid request. " + response.message, "error");
      break;
    case 404:
      showNotification("Resource not found.", "error");
      break;
    case 500:
      showNotification("Server error. Please try again later.", "error");
      break;
    default:
      showNotification(response.message, "error");
  }
};
```

## Socket.io Events Still Work

Socket events are unchanged and work alongside the new API response format:

```javascript
// Still works as before
socket.on("order_status_updated", (data) => {
  console.log("Order updated:", data);
});

socket.emit("send_message", {
  tableNumber: 1,
  message: "Need assistance",
});
```

## Migration Checklist for Frontend

- [x] Understand new response format
- [ ] Update axios/fetch interceptors
- [ ] Add response handler utilities
- [ ] Test all API calls
- [ ] Update error handling in components
- [ ] Remove old manual error handling code
- [ ] Update loading and error states
- [ ] Test error scenarios

## Quick Reference

```javascript
// ✅ NEW: Response structure
{
  statuscode: number,
  data: any | null,
  message: string,
  success: boolean
}

// ✅ Check success
if (response.success) { /* Success */ }

// ✅ Get data
const data = response.data;

// ✅ Get error message
const errorMsg = response.message;

// ✅ Show to user
showNotification(response.message, response.success ? 'success' : 'error');
```

---

**All backend APIs are now standardized and ready for consumption!** 🚀
