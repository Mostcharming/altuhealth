# Finance Dashboard Sample Data

This document shows the expected API response structure for the finance dashboard at `/admin/dashboard/finance`.

## Complete API Response Example

```json
{
  "data": {
    "metrics": {
      "totalClaimsPaid": {
        "amount": 4500000,
        "percentage": 12.5,
        "trend": "up"
      },
      "totalPendingClaims": {
        "count": 187,
        "percentage": 8.3,
        "trend": "down"
      },
      "totalInvoiceGenerated": {
        "count": 542,
        "percentage": 5.2,
        "trend": "up"
      },
      "totalRevenueCollected": {
        "amount": 8750000,
        "percentage": 15.8,
        "trend": "up"
      }
    },
    "churnRate": {
      "data": [35, 38, 32, 40, 36, 42, 39]
    },
    "growthRate": {
      "data": [5, 8, 3, 12, 7, 15, 10]
    },
    "funnelChart": {
      "data": [1200, 980, 850, 720, 650, 580, 520, 450]
    },
    "invoices": [
      {
        "id": 1,
        "serialNo": "#INV001",
        "closeDate": "December 20, 2024",
        "user": "Zenith Healthcare Ltd",
        "amount": "₦1,250,000",
        "status": "Complete"
      },
      {
        "id": 2,
        "serialNo": "#INV002",
        "closeDate": "December 19, 2024",
        "user": "MediCare Partners",
        "amount": "₦850,500",
        "status": "Complete"
      },
      {
        "id": 3,
        "serialNo": "#INV003",
        "closeDate": "December 18, 2024",
        "user": "HealthFirst Corp",
        "amount": "₦2,100,000",
        "status": "Pending"
      },
      {
        "id": 4,
        "serialNo": "#INV004",
        "closeDate": "December 17, 2024",
        "user": "Wellness Solutions",
        "amount": "₦675,250",
        "status": "Complete"
      },
      {
        "id": 5,
        "serialNo": "#INV005",
        "closeDate": "December 16, 2024",
        "user": "Premium Health",
        "amount": "₦1,500,000",
        "status": "Cancelled"
      }
    ],
    "productPerformance": {
      "drugs": [4200, 4500, 3800, 5100, 4600, 5300, 4900],
      "services": [2100, 2300, 1950, 2600, 2400, 2800, 2500]
    },
    "activities": [
      {
        "id": 1,
        "description": "Claim CLM-2024-0001 approved for payment",
        "timestamp": "2 hours ago",
        "type": "claim"
      },
      {
        "id": 2,
        "description": "Invoice INV-2024-0042 generated for Zenith Healthcare",
        "timestamp": "4 hours ago",
        "type": "invoice"
      },
      {
        "id": 3,
        "description": "Payment of ₦1,250,000 received from MediCare",
        "timestamp": "6 hours ago",
        "type": "payment"
      },
      {
        "id": 4,
        "description": "System reconciliation completed successfully",
        "timestamp": "1 day ago",
        "type": "system"
      },
      {
        "id": 5,
        "description": "Claim CLM-2024-0002 flagged for review",
        "timestamp": "1 day ago",
        "type": "claim"
      },
      {
        "id": 6,
        "description": "Payment reminder sent to HealthFirst Corp",
        "timestamp": "2 days ago",
        "type": "payment"
      },
      {
        "id": 7,
        "description": "Monthly batch invoice processing completed",
        "timestamp": "2 days ago",
        "type": "invoice"
      }
    ]
  }
}
```

## Field Descriptions

### Metrics Object

- **totalClaimsPaid**: Total amount paid out in claims

  - `amount`: Naira amount (number)
  - `percentage`: Month-over-month change percentage
  - `trend`: "up" or "down"

- **totalPendingClaims**: Number of claims awaiting payment

  - `count`: Number of pending claims
  - `percentage`: Change percentage
  - `trend`: "up" or "down"

- **totalInvoiceGenerated**: Total invoices created

  - `count`: Number of invoices
  - `percentage`: Change percentage
  - `trend`: "up" or "down"

- **totalRevenueCollected**: Total revenue received
  - `amount`: Naira amount (number)
  - `percentage`: Change percentage
  - `trend`: "up" or "down"

### Chart Data Objects

- **churnRate**: Array of 7 numbers representing enrollee claims rate percentage over 7 days
- **growthRate**: Array of 7 numbers representing claims with issues (reconciliation) over 7 days
- **funnelChart**: Array of 8 numbers representing payment amounts at different stages

### Invoices Array

Each invoice object contains:

- `id`: Unique identifier
- `serialNo`: Invoice serial number (string, e.g., "#INV001")
- `closeDate`: Date the invoice was closed (string, formatted date)
- `user`: Company/organization name
- `amount`: Amount in Naira (string, formatted with ₦ symbol and commas)
- `status`: "Complete", "Pending", or "Cancelled"

### Product Performance Object

- `drugs`: Array of 7 numbers representing drug sales over 7 days
- `services`: Array of 7 numbers representing service rendered over 7 days

### Activities Array

Each activity object contains:

- `id`: Unique identifier
- `description`: What happened (string)
- `timestamp`: When it happened (string, e.g., "2 hours ago", "1 day ago")
- `type`: "claim", "invoice", "payment", or "system"

## Sample Data by Component

### Metrics Display

```
┌─────────────────────────────────────────────────────────┐
│ Overview                                                  │
├─────────────────────────────────────────────────────────┤
│ Total Claims Paid  │ Total Pending Claims │ Total Invoice Generated │ Total Revenue
│ ₦4,500,000        │ 187                  │ 542                    │ ₦8,750,000
│ +12.5%            │ -8.3%                │ +5.2%                  │ +15.8%
└─────────────────────────────────────────────────────────┘
```

### Churn Rate Chart

```
Enrollee Claims Rate - 35%, 38%, 32%, 40%, 36%, 42%, 39%
(Line chart showing trend over 7 days)
```

### Growth/Reconciliation Chart

```
Reconciliation - 5, 8, 3, 12, 7, 15, 10 claims with issues
(Line chart showing reconciliation issues over 7 days)
```

### Funnel Chart

```
Payment Amount - [1200, 980, 850, 720, 650, 580, 520, 450]
(Stacked bar chart showing payment amounts at different stages)
```

### Invoice Table

```
┌────────┬──────────────────┬────────────────────────┬──────────────┬─────────┐
│ Serial │ Close Date       │ User                   │ Amount       │ Status  │
├────────┼──────────────────┼────────────────────────┼──────────────┼─────────┤
│ #INV001│ December 20, 2024│ Zenith Healthcare Ltd  │ ₦1,250,000   │ Complete│
│ #INV002│ December 19, 2024│ MediCare Partners      │ ₦850,500     │ Complete│
│ #INV003│ December 18, 2024│ HealthFirst Corp       │ ₦2,100,000   │ Pending │
└────────┴──────────────────┴────────────────────────┴──────────────┴─────────┘
```

### Product Performance Tab

```
Drug Sales:
Sold: 4200
Claims: 4900
Average Daily Sales: ₦0 (+0.52%)

Services Rendered:
Digital Product: 2100
Physical Product: 2500
Total Online Sales: ₦0 (+0.52%)
```

### Activities Card

```
┌─────────────────────────────────────────┐
│ Activities                              │
├─────────────────────────────────────────┤
│ 📋 Claim CLM-2024-0001 approved         │
│    2 hours ago                          │
│ 🧾 Invoice INV-2024-0042 generated      │
│    4 hours ago                          │
│ 💳 Payment of ₦1,250,000 received       │
│    6 hours ago                          │
│ ⚙️  System reconciliation completed      │
│    1 day ago                            │
└─────────────────────────────────────────┘
```

## Notes for Backend Development

1. **Currency Formatting**: Amounts should be returned as numbers, not formatted strings
2. **Dates**: Can be ISO format or human-readable; frontend will handle display
3. **Data Frequency**: Consider caching this data as most values are calculated aggregates
4. **Error Handling**: If any sub-query fails, return empty arrays/default values for that section
5. **Performance**: Consider pagination for invoices if dealing with large datasets
6. **Real-time Updates**: Consider using WebSocket or polling for activities that need live updates

## API Endpoint Structure

```
GET /admin/dashboard/finance
```

**Response Code**: 200 OK

**Response Format**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Finance dashboard data retrieved successfully"
}
```

## Testing the Integration

After implementing the backend endpoint, you can test it with:

```bash
curl -X GET http://localhost:5000/admin/dashboard/finance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The frontend will automatically display this data in the finance dashboard components with proper loading states and error handling.
