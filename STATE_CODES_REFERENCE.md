# 🗺️ State Codes Reference - India GST

## Apna State Code Kaise Dhundhe

**GSTIN ke pehle 2 digit = State Code**

---

## 📍 Complete State Code List

### North India
| State/UT | Code | Capital |
|----------|------|---------|
| Jammu and Kashmir | 01 | Srinagar/Jammu |
| Himachal Pradesh | 02 | Shimla |
| Punjab | 03 | Chandigarh |
| Chandigarh | 04 | Chandigarh |
| Uttarakhand | 05 | Dehradun |
| Haryana | 06 | Chandigarh |
| Delhi | 07 | New Delhi |
| Rajasthan | 08 | Jaipur |
| Uttar Pradesh | 09 | Lucknow |

### East India
| State/UT | Code | Capital |
|----------|------|---------|
| Bihar | 10 | Patna |
| Sikkim | 11 | Gangtok |
| Arunachal Pradesh | 12 | Itanagar |
| Nagaland | 13 | Kohima |
| Manipur | 14 | Imphal |
| Mizoram | 15 | Aizawl |
| Tripura | 16 | Agartala |
| Meghalaya | 17 | Shillong |
| Assam | 18 | Dispur |
| West Bengal | 19 | Kolkata |

### East/Central India
| State/UT | Code | Capital |
|----------|------|---------|
| Jharkhand | 20 | Ranchi |
| Odisha | 21 | Bhubaneswar |
| Chhattisgarh | 22 | Raipur |

### West India
| State/UT | Code | Capital |
|----------|------|---------|
| Madhya Pradesh | 23 | Bhopal |
| Gujarat | 24 | Gandhinagar |
| Daman and Diu | 25 | Daman |
| Dadra and Nagar Haveli | 26 | Silvassa |
| Maharashtra | 27 | Mumbai |

### South India
| State/UT | Code | Capital |
|----------|------|---------|
| Andhra Pradesh (before) | 28 | Hyderabad |
| Karnataka | 29 | Bengaluru |
| Goa | 30 | Panaji |
| Lakshadweep | 31 | Kavaratti |
| Kerala | 32 | Thiruvananthapuram |
| Tamil Nadu | 33 | Chennai |
| Puducherry | 34 | Puducherry |
| Andaman and Nicobar | 35 | Port Blair |
| Telangana | 36 | Hyderabad |
| Andhra Pradesh (new) | 37 | Amaravati |

### Other
| Territory | Code |
|-----------|------|
| Ladakh | 38 |
| Other Territory | 97 |
| Centre Jurisdiction | 99 |

---

## 🔍 Major Cities Aur Unke State Codes

### Popular Business Locations:
```
Mumbai, Maharashtra         → 27
Delhi NCR                   → 07
Bangalore, Karnataka        → 29
Chennai, Tamil Nadu         → 33
Hyderabad, Telangana       → 36
Kolkata, West Bengal        → 19
Pune, Maharashtra           → 27
Ahmedabad, Gujarat          → 24
Jaipur, Rajasthan          → 08
Lucknow, Uttar Pradesh     → 09
Chandigarh                  → 04
Kochi, Kerala              → 32
Goa                        → 30
Indore, Madhya Pradesh     → 23
Bhopal, Madhya Pradesh     → 23
Nagpur, Maharashtra        → 27
Vadodara, Gujarat          → 24
Surat, Gujarat             → 24
Visakhapatnam, Andhra P    → 37
Bhubaneswar, Odisha        → 21
```

---

## 📝 Examples of Valid GSTINs

### Format: `[State Code][PAN][Entity][Z][Check]`

```
Maharashtra:  27AABCT1234C1Z5
Delhi:        07AABCT1234C1Z5
Karnataka:    29AABCT1234C1Z5
Tamil Nadu:   33AABCT1234C1Z5
Gujarat:      24AABCT1234C1Z5
West Bengal:  19AABCT1234C1Z5
Telangana:    36AABCT1234C1Z5
Rajasthan:    08AABCT1234C1Z5
UP:           09AABCT1234C1Z5
Kerala:       32AABCT1234C1Z5
```

---

## 🎯 Apna State Code Use Kaise Karein

### Step 1: Apni State Dhundho
```
Example: Agar aap Mumbai mein ho
→ Mumbai = Maharashtra
→ Maharashtra ka code = 27
```

### Step 2: update-shop-details.js Mein Fill Karo
```javascript
const SHOP_DATA = {
    stateCode: "27",           // Yahan apna code
    stateName: "Maharashtra",  // Yahan apna state
    // ... baki details
};
```

### Step 3: Update Script Run Karo
```bash
node update-shop-details.js
```

---

## ⚡ Quick Reference

### Agar GSTIN Hai:
```
GSTIN: 27AABCT1234C1Z5
       ^^
Pehle 2 digit = State Code = 27 = Maharashtra
```

### Agar GSTIN Nahi Hai (Test Mode):
```
Apna state code use karo:
- Mumbai/Pune → 27
- Delhi → 07
- Bangalore → 29
- Chennai → 33
- etc.
```

---

## 🤔 Confusion?

### Example 1: Mumbai ki Dukaan
```
City: Mumbai
State: Maharashtra
Code: 27
GSTIN: 27XXXXX0000X1Z5
```

### Example 2: Delhi ki Dukaan
```
City: New Delhi
State: Delhi
Code: 07
GSTIN: 07XXXXX0000X1Z5
```

### Example 3: Bangalore ki Dukaan
```
City: Bangalore
State: Karnataka
Code: 29
GSTIN: 29XXXXX0000X1Z5
```

---

## ✅ Test Mode Ke Liye

Agar abhi GSTIN nahi hai:
1. Apna state code use karo
2. Dummy GSTIN banao: `[StateCode]XXXXX0000X1Z5`
3. Example: Delhi = `07XXXXX0000X1Z5`
4. System kaam karega testing ke liye

**Note**: Real business ke liye actual GSTIN lena padega!

---

**Last Updated**: November 30, 2025
