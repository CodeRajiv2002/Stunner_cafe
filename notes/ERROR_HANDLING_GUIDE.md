# Error Handling Flow Diagram

## Request Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        INCOMING REQUEST                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │   asyncHandler Wrapper         │
          │ (Catches all async errors)     │
          └────────┬───────────────────────┘
                   │
        ┌──────────┴─────────────┐
        │                        │
        ▼                        ▼
   ┌────────────┐        ┌─────────────────┐
   │  SUCCESS   │        │   ERROR THROWN  │
   │            │        │   (catch block) │
   │ Send Res   │        │                 │
   │ with       │        │ ApiError or     │
   │ ApiResponse│        │ any Error       │
   └────────────┘        └────────┬────────┘
        │                         │
        │                         ▼
        │              ┌────────────────────────┐
        │              │  next(err) called      │
        │              │  by asyncHandler       │
        │              └────────────┬───────────┘
        │                           │
        └───────────────┬───────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │  Global Error Handler Middleware   │
        │  (app.use((err,req,res,next)=>))   │
        │                                    │
        │  • Extract statusCode              │
        │  • Extract message                 │
        │  • Format as ApiResponse           │
        │  • Add stack trace (dev only)      │
        │  • res.status(code).json(response) │
        └───────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │  RESPONSE TO FRONTEND              │
        │  {                                 │
        │    statuscode: number,             │
        │    data: any | null,               │
        │    message: string,                │
        │    success: boolean,               │
        │    stack?: string (dev only)       │
        │  }                                 │
        └───────────────────────────────────┘
```

## Controller Pattern (Before & After)

### BEFORE (Old Pattern)

```javascript
export const getTodayOrders = async (req, res) => {
  try {
    // ... logic here
    res.status(200).json(new ApiResponse(200, data, "Success"));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    // ❌ Inconsistent response format
    // ❌ Manual error handling in every controller
    // ❌ Duplicated try-catch blocks
  }
};
```

### AFTER (New Pattern)

```javascript
export const getTodayOrders = asyncHandler(async (req, res) => {
  // ... logic here
  res.status(200).json(new ApiResponse(200, data, "Success"));
  // ✅ Clean code, no try-catch
  // ✅ All errors automatically handled
  // ✅ Consistent response format
});
```

## Error Types & How They're Handled

### 1. **Expected Errors (Thrown ApiError)**

```javascript
if (!id) {
  throw new ApiError(400, "Order ID is required");
}
// ↓ Caught by asyncHandler
// ↓ Passed to global error handler
// ↓ Responds with ApiResponse format
```

### 2. **Unexpected Errors (Unhandled Promise Rejection)**

```javascript
const order = await Order.findById(invalidId); // May throw
// ↓ Caught by asyncHandler
// ↓ Passed to global error handler
// ↓ Responds with standardized error format
```

### 3. **Validation Errors (MongooseError)**

```javascript
const table = await Table.create({...});
// MongooseError thrown
// ↓ Caught by asyncHandler
// ↓ Global handler formats as ApiResponse
```

## Files Modified

```
Backend/
├── api/
│   ├── controllers/
│   │   ├── order.controller.js      ✅ All 4 functions wrapped
│   │   ├── chatController.js        ✅ 2 functions wrapped
│   │   ├── tableController.js       ✅ 3 functions wrapped
│   │   └── menu.controller.js       ✅ Already compliant
│   └── routes/
│       └── (no changes needed)
├── server.js                        ✅ Global error handler improved
└── utils/
    ├── apiResponse.js               ✅ Already correct
    ├── apiError.js                  ✅ Already correct
    └── asyncHandler.js              ✅ Already correct
```

## Key Improvements

| Aspect               | Before                       | After                        |
| -------------------- | ---------------------------- | ---------------------------- |
| **Error Handling**   | Try-catch in each controller | Centralized via asyncHandler |
| **Response Format**  | Inconsistent (manual JSON)   | Standardized ApiResponse     |
| **Code Duplication** | High (many try-catch blocks) | Low (DRY principle)          |
| **Error Messages**   | Manual string responses      | Structured error objects     |
| **Debugging**        | No stack traces              | Dev mode stack traces        |
| **Maintenance**      | Error logic scattered        | Single global handler        |

## Testing the Changes

### Test Success Response

```bash
GET /api/tables
# Response:
{
  "statuscode": 200,
  "data": { "count": 5, "tables": [...] },
  "message": "Tables fetched successfully",
  "success": true
}
```

### Test Error Response

```bash
GET /api/orders/update/invalid-id -X PUT
# Response:
{
  "statuscode": 404,
  "data": null,
  "message": "Order with ID invalid-id does not exist in the database",
  "success": false
  # "stack": "..." (only in dev mode)
}
```

## Migration Checklist

- [x] Order controller functions wrapped
- [x] Chat controller functions wrapped
- [x] Table controller functions wrapped
- [x] Menu controller verified
- [x] Global error handler implemented
- [x] Error response format standardized
- [x] ApiResponse class used consistently
- [x] asyncHandler properly handling rejections

**✅ All API endpoints now have unified error handling and response format!**
