# Analytics Dashboard Sample Data

This document shows the expected API response structure for the analytics dashboard at `/admin/dashboard/analytics`.

## Complete API Response Example

```json
{
  "data": {
    "metrics": {
      "activeSubscriptions": {
        "count": 1542,
        "percentage": 12.5,
        "trend": "up"
      },
      "expiredSubscriptions": {
        "count": 89,
        "percentage": 8.3,
        "trend": "down"
      },
      "aboutToExpire": {
        "count": 156,
        "percentage": 5.2,
        "trend": "up"
      }
    },
    "saleChart": {
      "highestPlans": 450,
      "mostServices": 320,
      "highestEnrollees": 280
    },
    "upcomingSessions": [
      {
        "id": 1,
        "doctorName": "Dr. Chioma Okafor",
        "specialty": "Cardiology",
        "sessionDate": "December 29, 2024",
        "sessionTime": "10:00 AM",
        "patientName": "John Adeyemi",
        "status": "Scheduled"
      },
      {
        "id": 2,
        "doctorName": "Dr. Ade Balogun",
        "specialty": "Orthopedics",
        "sessionDate": "December 29, 2024",
        "sessionTime": "02:30 PM",
        "patientName": "Folake Okonkwo",
        "status": "Confirmed"
      },
      {
        "id": 3,
        "doctorName": "Dr. Zainab Mohammed",
        "specialty": "Ophthalmology",
        "sessionDate": "December 30, 2024",
        "sessionTime": "09:00 AM",
        "patientName": "Amina Hassan",
        "status": "Scheduled"
      },
      {
        "id": 4,
        "doctorName": "Dr. Emeka Nwankwo",
        "specialty": "Neurology",
        "sessionDate": "December 30, 2024",
        "sessionTime": "03:00 PM",
        "patientName": "Tunde Akinade",
        "status": "Confirmed"
      }
    ],
    "doctors": [
      {
        "id": "DOC001",
        "user": {
          "initials": "CO",
          "name": "Dr. Chioma Okafor",
          "email": "chioma.okafor@healthcare.com"
        },
        "avatarColor": "brand",
        "isOnline": true,
        "availableTime": "9:00 AM - 5:00 PM",
        "bookingsCount": 24,
        "specialty": "Cardiology",
        "rating": 4.8,
        "totalPatients": 156
      },
      {
        "id": "DOC002",
        "user": {
          "initials": "AB",
          "name": "Dr. Ade Balogun",
          "email": "ade.balogun@healthcare.com"
        },
        "avatarColor": "blue",
        "isOnline": false,
        "availableTime": "10:00 AM - 6:00 PM",
        "bookingsCount": 18,
        "specialty": "Orthopedics",
        "rating": 4.6,
        "totalPatients": 98
      },
      {
        "id": "DOC003",
        "user": {
          "initials": "ZM",
          "name": "Dr. Zainab Mohammed",
          "email": "zainab.mohammed@healthcare.com"
        },
        "avatarColor": "green",
        "isOnline": true,
        "availableTime": "8:00 AM - 4:00 PM",
        "bookingsCount": 31,
        "specialty": "Ophthalmology",
        "rating": 4.9,
        "totalPatients": 203
      },
      {
        "id": "DOC004",
        "user": {
          "initials": "EN",
          "name": "Dr. Emeka Nwankwo",
          "email": "emeka.nwankwo@healthcare.com"
        },
        "avatarColor": "red",
        "isOnline": true,
        "availableTime": "9:00 AM - 5:30 PM",
        "bookingsCount": 22,
        "specialty": "Neurology",
        "rating": 4.7,
        "totalPatients": 142
      },
      {
        "id": "DOC005",
        "user": {
          "initials": "OO",
          "name": "Dr. Olufemi Okonkwo",
          "email": "olufemi.okonkwo@healthcare.com"
        },
        "avatarColor": "yellow",
        "isOnline": false,
        "availableTime": "10:00 AM - 6:00 PM",
        "bookingsCount": 15,
        "specialty": "Dermatology",
        "rating": 4.5,
        "totalPatients": 87
      }
    ]
  }
}
```

## Field Descriptions

### Metrics Object

- **activeSubscriptions**: Active plan subscriptions

  - `count`: Number of active subscriptions
  - `percentage`: Month-over-month change percentage
  - `trend`: "up" or "down"

- **expiredSubscriptions**: Expired plan subscriptions

  - `count`: Number of expired subscriptions
  - `percentage`: Change percentage
  - `trend`: "up" or "down"

- **aboutToExpire**: Subscriptions expiring in next 30 days
  - `count`: Number of subscriptions about to expire
  - `percentage`: Change percentage
  - `trend`: "up" or "down"

### Sale Chart Object (Pie Chart)

- **highestPlans**: Number of providers with highest plan adoption
- **mostServices**: Number of providers offering most services
- **highestEnrollees**: Number of providers with highest enrollees

### Upcoming Sessions Array

Each session object contains:

- `id`: Unique identifier
- `doctorName`: Full name of the doctor
- `specialty`: Medical specialty
- `sessionDate`: Date of the session (formatted string)
- `sessionTime`: Time of the session (formatted string)
- `patientName`: Name of the patient
- `status`: "Scheduled", "Confirmed", "Completed", or "Cancelled"

### Doctors Array

Each doctor object contains:

- `id`: Unique doctor identifier
- `user`: Doctor's user information
  - `initials`: First letters of first and last name
  - `name`: Full name
  - `email`: Email address
- `avatarColor`: Color variant ("brand", "blue", "green", "red", "yellow", "gray")
- `isOnline`: Whether doctor is currently online
- `availableTime`: Doctor's available time slots
- `bookingsCount`: Total number of patient bookings
- `specialty`: Medical specialty
- `rating`: Star rating (optional, 0-5)
- `totalPatients`: Total number of patients (optional)

## Visual Mockups

### Metrics Display

```
┌────────────────────────────────────────────────────────────┐
│ Active Subscriptions    │ Expired Subscriptions │ About to Expire
│ 1542                    │ 89                    │ 156
│ +12.5%                  │ -8.3%                 │ +5.2%
└────────────────────────────────────────────────────────────┘
```

### Providers Overview (Donut Chart)

```
     Highest Plans: 450
     Most Services: 320
     Highest Enrollees: 280
```

### Upcoming Sessions Table

```
┌──────────────────────────────────────────────────────────────┐
│ Doctor Name        │ Specialty      │ Time        │ Status    │
├──────────────────────────────────────────────────────────────┤
│ Dr. Chioma Okafor  │ Cardiology     │ 10:00 AM    │ Scheduled │
│ Dr. Ade Balogun    │ Orthopedics    │ 02:30 PM    │ Confirmed │
└──────────────────────────────────────────────────────────────┘
```

### Recent Doctors Table

```
┌────────────────────────────────────────────────────────────────┐
│ ID     │ Name              │ Specialty       │ Status  │ Bookings
├────────────────────────────────────────────────────────────────┤
│ DOC001 │ Dr. Chioma Okafor │ Cardiology      │ Online  │ 24
│ DOC002 │ Dr. Ade Balogun   │ Orthopedics     │ Offline │ 18
│ DOC003 │ Dr. Zainab M...   │ Ophthalmology   │ Online  │ 31
└────────────────────────────────────────────────────────────────┘
```

## Status Color Mapping

For Upcoming Sessions:

- **Scheduled**: Warning (yellow/amber)
- **Confirmed**: Success (green)
- **Completed**: Success (green)
- **Cancelled**: Error (red)

For Doctor Online Status:

- **Online**: Success (green)
- **Offline**: Error (red)

## API Endpoint Structure

```
GET /admin/dashboard/analytics
```

**Response Code**: 200 OK

**Response Format**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Analytics dashboard data retrieved successfully"
}
```

## Testing the Integration

After implementing the backend endpoint, test with:

```bash
curl -X GET http://localhost:5000/admin/dashboard/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes for Backend Development

1. **Metrics Calculations**:

   - Compare current period with previous period for percentage changes
   - Determine trend based on positive/negative change

2. **Doctors List**:

   - Sort by booking count or rating for relevance
   - Include only active/verified doctors in the list
   - Real-time online status can be tracked via WebSocket or polling

3. **Sessions**:

   - Return upcoming sessions for the current and next 7 days
   - Sort by date and time
   - Filter by logged-in admin's managed doctors if applicable

4. **Performance**:

   - Consider caching metrics as they don't change frequently
   - Use database indexes on doctors and sessions tables
   - Pagination may be needed for large doctor lists

5. **Real-time Updates**:
   - For online status, consider implementing WebSocket for live updates
   - Activity feeds can be updated every 5-10 minutes
