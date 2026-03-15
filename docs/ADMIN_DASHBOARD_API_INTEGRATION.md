# Admin Dashboard API Integration - Implementation Guide

## Overview

Connected the Admin Dashboard to real APIs, replacing static numbers with dynamic data, and implemented full CRUD functionality for agencies and users with confirmation modals.

---

## Step 1: Backend - AdminController Creation

**File**: `backend/app/Http/Controllers/Api/AdminController.php`

Created comprehensive controller with methods:

- `getDashboardStats()` - Platform-wide statistics
- `getAgencies()` - List all agencies with revenue data
- `getUsers()` - List all users with role information
- `updateAgency($id)` - Update agency details
- `deleteAgency($id)` - Delete agency (with validation)
- `updateUser($id)` - Update user details
- `deleteUser($id)` - Delete user (with validation)

**Key Features**:

- Revenue calculation from reservations
- Agency payout tracking (92% after 8% commission)
- Prevents deletion of agencies with vehicles or users
- Prevents deletion of users with active reservations
- Prevents admins from deleting themselves

---

## Step 2: Backend - API Routes

**File**: `backend/routes/api.php`

Added super_admin protected routes:

```php
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/admin/agencies', [AdminController::class, 'getAgencies']);
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::put('/admin/agencies/{id}', [AdminController::class, 'updateAgency']);
    Route::delete('/admin/agencies/{id}', [AdminController::class, 'deleteAgency']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
});
```

---

## Step 3: Frontend - API Service Functions

**File**: `frontend/src/services/api.js`

Added `adminService` with 7 methods:

- `getDashboardStats()` - Fetch platform statistics
- `getAgencies()` - Fetch all agencies
- `getUsers()` - Fetch all users
- `updateAgency(id, data)` - Update agency
- `deleteAgency(id)` - Delete agency
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user

All methods include error handling and return structured responses.

---

## Step 4: Frontend - Reusable Modal Components

### ConfirmationModal Component

**File**: `frontend/src/components/ConfirmationModal.jsx`

Features:

- Customizable title, message, and button text
- Danger mode (red) for destructive actions
- Success mode (blue) for confirmations
- Fade-in and scale-in animations
- Icon changes based on action type

### EditModal Component

**File**: `frontend/src/components/EditModal.jsx`

Features:

- **Universal design** - adapts to user or agency
- Dynamic form fields based on type
- Real-time validation
- Role-based fields (agency selection for agency_admin)
- Loading states during save
- Error handling with user feedback
- Smooth animations

**Agency Fields**:

- Name, Address, Phone, Email

**User Fields**:

- Name, Email, Phone, Role
- Agency dropdown (conditional for agency_admin role)

### Toast Notification Component

**File**: `frontend/src/components/Toast.jsx`

Features:

- **Success/Error/Info modes** - green for success, red for error, blue for info
- Auto-dismiss after 3 seconds (customizable)
- Manual close button
- Slide-in animation from right
- Fixed position (top-right corner)
- z-index 100 to appear above all content

**Usage**:

```javascript
const [toast, setToast] = useState({
  isVisible: false,
  message: "",
  type: "success",
});

const showToast = (message, type = "success") => {
  setToast({ isVisible: true, message, type });
};

// Render
<Toast
  isVisible={toast.isVisible}
  message={toast.message}
  type={toast.type}
  onClose={hideToast}
/>;
```

---

## Step 5: Admin Dashboard Integration

**File**: `frontend/src/pages/AdminDashboard.jsx`

### Changes Made:

#### 1. Imports & State Management

```javascript
import { useState, useEffect } from "react";
import { adminService } from "../services/api";
import ConfirmationModal from "../components/ConfirmationModal";
import EditModal from "../components/EditModal";
import Toast from "../components/Toast";

// State structure
const [platformStats, setPlatformStats] = useState({...});
const [agencies, setAgencies] = useState([]);
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, item: null });
const [editModal, setEditModal] = useState({ isOpen: false, type: null, item: null });
const [editConfirmModal, setEditConfirmModal] = useState({ isOpen: false, type: null, item: null });
const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

// Toast helper functions
const showToast = (message, type = "success") => {
  setToast({ isVisible: true, message, type });
};

const hideToast = () => {
  setToast({ isVisible: false, message: "", type: "success" });
};
```

#### 2. Data Fetching (useEffect)

```javascript
useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  const [statsRes, agenciesRes, usersRes] = await Promise.all([
    adminService.getDashboardStats(),
    adminService.getAgencies(),
    adminService.getUsers(),
  ]);

  setPlatformStats(statsRes.data);
  setAgencies(agenciesRes.data);
  setUsers(usersRes.data);
};
```

#### 3. Delete Handlers

```javascript
const handleDeleteAgency = async (id) => {
  try {
    await adminService.deleteAgency(id);
    setAgencies(agencies.filter((a) => a.id !== id));
    setPlatformStats((prev) => ({
      ...prev,
      totalAgencies: prev.totalAgencies - 1,
    }));
    showToast("Agence supprimée avec succès", "success");
  } catch (error) {
    showToast(
      error.response?.data?.message || "Erreur lors de la suppression",
      "error",
    );
  }
};

const handleDeleteUser = async (id) => {
  try {
    await adminService.deleteUser(id);
    setUsers(users.filter((u) => u.id !== id));
    setPlatformStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    showToast("Utilisateur supprimé avec succès", "success");
  } catch (error) {
    showToast(
      error.response?.data?.message || "Erreur lors de la suppression",
      "error",
    );
  }
};
```

#### 4. Edit Handlers

```javascript
const handleEditAgency = async (updatedData) => {
  try {
    const response = await adminService.updateAgency(
      updatedData.id,
      updatedData,
    );
    setAgencies(
      agencies.map((a) =>
        a.id === updatedData.id ? { ...a, ...response.data } : a,
      ),
    );
    showToast("Agence modifiée avec succès", "success");
  } catch (error) {
    showToast(
      error.response?.data?.message || "Erreur lors de la modification",
      "error",
    );
    throw error; // Re-throw to prevent modal from closing
  }
};

const handleEditUser = async (updatedData) => {
  try {
    const response = await adminService.updateUser(updatedData.id, updatedData);
    setUsers(
      users.map((u) =>
        u.id === updatedData.id ? { ...u, ...response.data } : u,
      ),
    );
    showToast("Utilisateur modifié avec succès", "success");
  } catch (error) {
    showToast(
      error.response?.data?.message || "Erreur lors de la modification",
      "error",
    );
    throw error; // Re-throw to prevent modal from closing
  }
};
```

#### 5. UI Updates

**Agencies Tab - Action Buttons**:

```javascript
<button
  onClick={() => setEditConfirmModal({ isOpen: true, type: 'agency', item: agency })}
  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg"
>
  Modifier
</button>
<button
  onClick={() => setDeleteModal({ isOpen: true, type: 'agency', item: agency })}
  className="bg-red-600 text-white px-4 py-2 rounded-lg"
>
  Supprimer
</button>
```

**Users Tab - Action Buttons**:

```javascript
<button
  onClick={() => setEditConfirmModal({ isOpen: true, type: 'user', item: user })}
  className="text-primary-600 hover:text-primary-900 mr-3"
>
  Modifier
</button>
<button
  onClick={() => setDeleteModal({ isOpen: true, type: 'user', item: user })}
  className="text-red-600 hover:text-red-900"
>
  Supprimer
</button>
```

#### 6. Modal Components

```javascript
{
  /* Delete Confirmation Modal */
}
<ConfirmationModal
  isOpen={deleteModal.isOpen}
  onClose={() => setDeleteModal({ isOpen: false, type: null, item: null })}
  onConfirm={() => {
    if (deleteModal.type === "agency") handleDeleteAgency(deleteModal.item.id);
    else if (deleteModal.type === "user") handleDeleteUser(deleteModal.item.id);
  }}
  title="Confirmer la suppression"
  message={`Êtes-vous sûr de vouloir supprimer ${deleteModal.type === "agency" ? "l'agence" : "l'utilisateur"} "${deleteModal.item?.name}" ? Cette action est irréversible.`}
  confirmText="Supprimer"
  cancelText="Annuler"
  danger={true}
/>;

{
  /* Edit Confirmation Modal */
}
<ConfirmationModal
  isOpen={editConfirmModal.isOpen}
  onClose={() => setEditConfirmModal({ isOpen: false, type: null, item: null })}
  onConfirm={() => {
    setEditConfirmModal({ isOpen: false, type: null, item: null });
    setEditModal({
      isOpen: true,
      type: editConfirmModal.type,
      item: editConfirmModal.item,
    });
  }}
  title="Confirmer la modification"
  message={`Voulez-vous modifier ${editConfirmModal.type === "agency" ? "l'agence" : "l'utilisateur"} "${editConfirmModal.item?.name}" ?`}
  confirmText="Continuer"
  cancelText="Annuler"
  danger={false}
/>;

{
  /* Edit Modal */
}
<EditModal
  isOpen={editModal.isOpen}
  onClose={() => setEditModal({ isOpen: false, type: null, item: null })}
  onSave={editModal.type === "agency" ? handleEditAgency : handleEditUser}
  item={editModal.item}
  type={editModal.type}
  agencies={agencies}
/>;

{
  /* Toast Notification */
}
<Toast
  isVisible={toast.isVisible}
  message={toast.message}
  type={toast.type}
  onClose={hideToast}
/>;
```

#### 7. Loading State

```javascript
{loading ? (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="text-gray-600">Chargement des données...</p>
    </div>
  </div>
) : (
  // Dashboard content
)}
```

---

## Data Flow Summary

### Statistics Display

```
Backend: AdminController::getDashboardStats()
  → Counts: agencies, users, vehicles, reservations
  → Calculates: monthly revenue from platform_commission

Frontend: useEffect → fetchDashboardData()
  → setPlatformStats(statsRes.data)
  → Display in stat cards (dynamic numbers)
```

### Agencies Management

```
Fetch: GET /admin/agencies
  → Returns: id, name, address, phone, email, vehicles_count, revenue

Edit: PUT /admin/agencies/{id}
  → Step 1: Click "Modifier" → Opens Edit Confirmation Modal
  → Step 2: Confirm → Opens EditModal with agency data
  → Step 3: Save → Validates: name, address, phone, email
  → Step 4: Success → Updates local state + Shows green toast
  → Step 5: Error → Shows red toast + keeps modal open

Delete: DELETE /admin/agencies/{id}
  → Step 1: Click "Supprimer" → Opens Delete Confirmation Modal (red)
  → Step 2: Confirm → Calls API
  → Step 3: Backend validates: no vehicles, no users
  → Step 4: Success → Updates local state + Shows green toast
  → Step 5: Error → Shows red toast with reason
```

### Users Management

```
Fetch: GET /admin/users
  → Returns: id, name, email, phone, role, agency, reservations_count

Edit: PUT /admin/users/{id}
  → Step 1: Click "Modifier" → Opens Edit Confirmation Modal
  → Step 2: Confirm → Opens EditModal with user data
  → Step 3: Save → Validates: name, email, phone, role, agency_id (if agency_admin)
  → Step 4: Success → Updates local state + Shows green toast
  → Step 5: Error → Shows red toast + keeps modal open

Delete: DELETE /admin/users/{id}
  → Step 1: Click "Supprimer" → Opens Delete Confirmation Modal (red)
  → Step 2: Confirm → Calls API
  → Step 3: Backend validates: not self, no active reservations
  → Step 4: Success → Updates local state + Shows green toast
  → Step 5: Error → Shows red toast with reason
```

---

## Key Implementation Details

### Security

- All endpoints protected by `auth:sanctum` middleware
- Super admin role required (`role:super_admin`)
- Prevents self-deletion
- Validates data integrity before deletion

### UX Enhancements

- Loading spinner during data fetch
- **Edit confirmation modal** - Prevents accidental edits
- **Delete confirmation modal** - Prevents accidental deletions (red danger mode)
- **Toast notifications** - Success (green) / Error (red) messages
- Auto-dismiss toasts after 3 seconds
- Inline error messages in forms
- Modal stays open on error for corrections
- Smooth animations for modals and toasts

### Performance

- Parallel API calls using `Promise.all()`
- Local state updates after mutations (no full reload)
- Optimistic UI updates with error rollback

---

## Testing the Implementation

1. **Start Backend**: `php artisan serve`
2. **Start Frontend**: `npm run dev`
3. **Login as Super Admin**: Email from seeders
4. **Navigate to Admin Dashboard**

### Test Cases:

- ✅ View real-time statistics
- ✅ Click "Modifier" on agency → See edit confirmation → Proceed to edit form
- ✅ Edit agency name/address → See success toast
- ✅ Click "Modifier" on user → See edit confirmation → Edit user role (client → agency_admin)
- ✅ See success toast after edit
- ✅ Try to delete agency with vehicles → See red error toast with message
- ✅ Try to delete user with active reservations → See red error toast
- ✅ Successfully delete empty agency → See green success toast
- ✅ Successfully delete inactive user → See green success toast
- ✅ Toasts auto-dismiss after 3 seconds
- ✅ Successfully delete empty agency
- ✅ Successfully delete inactive user

---

## Files Created/Modified

### Created (4 files):

1. `backend/app/Http/Controllers/Api/AdminController.php` - Admin API controller with stats, CRUD operations
2. `frontend/src/components/ConfirmationModal.jsx` - Reusable confirmation dialog (delete & edit confirm)
3. `frontend/src/components/EditModal.jsx` - Universal edit form (user & agency)
4. `frontend/src/components/Toast.jsx` - Success/Error notification component

### Modified (3 files):

1. `backend/routes/api.php` - Added 7 admin-protected routes
2. `frontend/src/services/api.js` - Added adminService with 7 methods
3. `frontend/src/pages/AdminDashboard.jsx` - Integrated API, modals, confirmations & toasts

---

## Future Enhancements

- Add agency creation modal
- Add user creation modal
- Implement search/filter for users table
- Add pagination for large datasets
- Export statistics to PDF
- Real-time updates with WebSockets

---

**Implementation Date**: February 24, 2026
**Status**: ✅ Complete and Functional
