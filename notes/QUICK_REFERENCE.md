# Quick Reference Card - Unified API Response

## For Backend Developers

### Creating a New Controller Function

```javascript
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";

// ✅ CORRECT PATTERN
export const myController = asyncHandler(async (req, res) => {
  // Validation
  if (!req.body.required) {
    throw new ApiError(400, "Required field is missing");
  }

  // Logic
  const result = await Model.findById(req.params.id);

  // Error handling
  if (!result) {
    throw new ApiError(404, "Resource not found");
  }

  // Success response
  res.status(200).json(new ApiResponse(200, result, "Success message"));
});

// ❌ DON'T DO THIS
export const badController = async (req, res) => {
  try {
    // ... logic
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### HTTP Status Codes to Use

```
200 - OK / Success
201 - Created
400 - Bad Request (validation error)
401 - Unauthorized
403 - Forbidden
404 - Not Found
422 - Unprocessable Entity
500 - Server Error
```

---

## For Frontend Developers

### Handling API Response

```javascript
// ✅ Check success flag
if (response.success) {
  const data = response.data;
  // Use data
} else {
  const error = response.message;
  // Show error to user
}

// ✅ Always have: statuscode, data, message, success
console.log(response.statuscode); // 200, 400, 404, etc.
console.log(response.data); // Actual data or null
console.log(response.message); // Human readable message
console.log(response.success); // true or false
```

### Common Response Examples

**Success - List Data**

```json
{
  "statuscode": 200,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "message": "Items fetched successfully",
  "success": true
}
```

**Success - Single Object**

```json
{
  "statuscode": 201,
  "data": { "id": 1, "name": "New Item", "status": "Active" },
  "message": "Item created successfully",
  "success": true
}
```

**Error - Validation**

```json
{
  "statuscode": 400,
  "data": null,
  "message": "Order ID is required",
  "success": false
}
```

**Error - Not Found**

```json
{
  "statuscode": 404,
  "data": null,
  "message": "Order with ID 123 not found",
  "success": false
}
```

**Error - Server Error**

```json
{
  "statuscode": 500,
  "data": null,
  "message": "Database connection failed",
  "success": false
}
```

---

## Common Errors & Fixes

### ❌ Issue: Response format is inconsistent

**Solution**: Always use `ApiResponse` class in success cases and let global handler format errors

### ❌ Issue: Frontend can't find error message

**Solution**: Check `response.message` - that's where error description is

### ❌ Issue: Status code is always 500

**Solution**: Throw `ApiError(code, message)` with proper status code

### ❌ Issue: Stack trace appearing in production

**Solution**: Verify `NODE_ENV=production` is set in deployment

### ❌ Issue: asyncHandler is not catching error

**Solution**: Make sure function is `async` and error is `throw`n (not returned)

---

## API Endpoints Quick List

| Method | Endpoint                  | Purpose        | Success Code |
| ------ | ------------------------- | -------------- | ------------ |
| GET    | `/api/menu/allitems`      | Get menu       | 200          |
| GET    | `/api/tables`             | Get tables     | 200          |
| POST   | `/api/tables`             | Create table   | 201          |
| PUT    | `/api/tables/:num`        | Update table   | 200          |
| DELETE | `/api/tables/:num/reset`  | Reset table    | 200          |
| GET    | `/api/orders/today`       | Today's orders | 200          |
| GET    | `/api/orders/history`     | Order history  | 200          |
| PUT    | `/api/orders/update/:id`  | Update order   | 200          |
| PATCH  | `/api/orders/:id/payment` | Pay order      | 200          |
| GET    | `/api/messages/active`    | Active chats   | 200          |
| DELETE | `/api/messages/:table`    | Clear chat     | 200          |

---

## Axios Setup (Recommended for Frontend)

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
});

// Handle responses automatically
api.interceptors.response.use(
  (response) => response.data, // Return just the data
  (error) => {
    const { data } = error.response || {};
    return Promise.reject(new Error(data?.message || error.message));
  },
);

export default api;
```

---

## Response Handler Utility

```javascript
export const handleResponse = (response) => {
  // response.success tells you if it worked
  // response.data has the content (or null if error)
  // response.message explains what happened

  if (!response.success) {
    // Error occurred
    const errorMsg = response.message;
    // Show toast/notification to user
    toast.error(errorMsg);
    return null;
  }

  // Success
  toast.success(response.message);
  return response.data;
};
```

---

## Troubleshooting

**Q: How do I know if an API call succeeded?**
A: Check `response.success === true`

**Q: Where is the error message?**
A: It's in `response.message`

**Q: What does `data` contain on error?**
A: It's always `null` on error. Check `message` instead.

**Q: Can I see the stack trace?**
A: Only in development mode (`NODE_ENV=development`)

**Q: Which status code means what?**
A: 2xx = Success, 4xx = Client error, 5xx = Server error

---

## Summary Table

| Component      | Location                | Purpose                        |
| -------------- | ----------------------- | ------------------------------ |
| AsyncHandler   | `utils/asyncHandler.js` | Catches Promise rejections     |
| ApiError       | `utils/apiError.js`     | Create proper errors           |
| ApiResponse    | `utils/apiResponse.js`  | Format success responses       |
| Global Handler | `server.js` middleware  | Catches and formats all errors |

**That's it! Follow these patterns and all APIs will be consistent.** ✅
