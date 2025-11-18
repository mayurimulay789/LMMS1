# TODO: Add Available Offers Section to Checkout Page

## Tasks Breakdown

### 1. Backend API Development
- [ ] Add `/available-offers` endpoint in `server/routes/payments.js` to fetch valid promo codes for a course
- [ ] Implement logic to query PromoCode model for active, valid offers applicable to the course

### 2. Redux State Management
- [ ] Add `fetchAvailableOffers` async thunk in `client/src/store/slices/paymentSlice.js`
- [ ] Update payment slice state to include available offers array
- [ ] Add reducers for handling offers fetching success/failure

### 3. Frontend UI Implementation
- [ ] Modify `client/src/Pages/CheckoutPage.jsx` to add "Available Offers" section
- [ ] Implement hover effect to show "Apply" button on offers
- [ ] Add click handler to apply selected offer and recalculate bill
- [ ] Ensure offers are displayed alongside existing promo code input

### 4. Integration and Testing
- [ ] Fetch available offers on checkout page load
- [ ] Test offer application and bill recalculation
- [ ] Handle edge cases (no offers available, offer application errors)

## Current Status
- Analysis complete: Understanding of existing promo code system and checkout page structure
- Ready to start implementation with backend API endpoint
