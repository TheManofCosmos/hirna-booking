import sys
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_tests():
    print("=== STARTING COMPREHENSIVE E2E VERIFICATION ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        page = context.new_page()

        # Log console errors
        page.on("console", lambda msg: print(f"[BROWSER CONSOLE {msg.type}]: {msg.text}") if msg.type in ['error', 'warn'] else None)

        # -------------------------------------------------------------
        # TEST 1: Transport Vehicle Choices (Hirna Premium replaced with Hirna Moto)
        # -------------------------------------------------------------
        print("\n--- TEST 1: Transport Options & Motorcycle Rate ---")
        page.goto("http://localhost:8000/booking.html")
        page.wait_for_load_state("networkidle")

        # Set user role to Customer to see booking interface
        page.evaluate("""() => {
            localStorage.setItem('hirna_user_role', 'customer');
            if (typeof AuthModule !== 'undefined') {
                AuthModule.currentUser = { id: 'usr-1', name: 'Juan Dela Cruz', role: 'customer', email: 'customer@hirna.ph' };
            }
        }""")
        page.reload()
        page.wait_for_load_state("networkidle")

        # Switch to Transport vertical
        page.evaluate("BookingModule.switchService('transport')")
        page.wait_for_timeout(500)

        # Verify Hirna Premium is NOT in DOM
        premium_count = page.locator('text="Hirna Premium"').count()
        print(f"Hirna Premium present count: {premium_count} (Expected: 0)")
        assert premium_count == 0, "Hirna Premium was expected to be removed!"

        # Verify Hirna Moto is in DOM
        moto_label = page.locator('text="Hirna Moto"')
        print(f"Hirna Moto found: {moto_label.count() > 0}")
        assert moto_label.count() > 0, "Hirna Moto should be available in transport choices!"

        # Select Hirna Moto
        moto_radio = page.locator('input[name="vehicle-class"][value="Motorcycle (1-Passenger)"]')
        assert moto_radio.count() > 0, "Motorcycle (1-Passenger) radio input not found!"
        moto_radio.check(force=True)
        page.wait_for_timeout(300)

        # Set pickup and dropoff
        page.evaluate("""() => {
            BookingModule.setPickup(14.5547, 121.0244, 'Ayala Triangle Gardens, Makati');
            BookingModule.setDropoff(14.5833, 121.0583, 'SM Megamall, EDSA, Mandaluyong');
        }""")
        page.wait_for_timeout(800)

        # Verify calculated base fare is ₱35.00
        base_fare_text = page.locator('#quote-base').inner_text()
        print(f"Calculated base fare: {base_fare_text} (Expected: ₱35.00)")
        assert "35.00" in base_fare_text, f"Expected ₱35.00 base fare, got: {base_fare_text}"

        page.screenshot(path="C:/Users/Asus/.gemini/antigravity/brain/57104813-3721-4ee3-9732-9925a894118b/transport_moto_option.png")
        print("Captured transport_moto_option.png screenshot")

        # -------------------------------------------------------------
        # TEST 2: Transport Motorcycle Booking & Driver Assignment
        # -------------------------------------------------------------
        print("\n--- TEST 2: Transport Motorcycle Booking & Driver Assignment ---")
        # Click book now / submit booking
        page.evaluate("BookingModule.handleBookingSubmit()")
        page.wait_for_timeout(2500) # wait for radar lock

        # Verify assigned driver is a motorcycle courier
        assigned_name = page.locator('#assign-driver-name').inner_text()
        assigned_car = page.locator('#assign-driver-car').inner_text()
        assigned_avatar = page.locator('#assign-driver-avatar').inner_text()
        print(f"Assigned Driver: {assigned_name}, Vehicle: {assigned_car}, Avatar: {assigned_avatar}")
        assert assigned_avatar == "🛵", f"Expected motorcycle avatar 🛵, got: {assigned_avatar}"

        # -------------------------------------------------------------
        # TEST 3: Transport Receipt Verification (Duration, Synced Time, Contacts)
        # -------------------------------------------------------------
        print("\n--- TEST 3: Transport Receipt Verification ---")
        # Skip simulation directly to dropoff to view receipt
        page.evaluate("BookingModule.onArrivedAtDropoff()")
        page.wait_for_timeout(800)

        # Settle via cash/wallet to open receipt
        page.evaluate("PaymentsModule.submitActivePayment()")
        page.wait_for_timeout(800)

        receipt_modal = page.locator('#receipt-modal')
        assert receipt_modal.is_visible(), "Receipt modal should be open"

        rcpt_datetime = page.locator('#rcpt-datetime').inner_text()
        rcpt_duration = page.locator('#rcpt-duration').inner_text()
        rcpt_passenger = page.locator('#rcpt-passenger').inner_text()
        rcpt_passenger_phone = page.locator('#rcpt-passenger-phone').inner_text()
        rcpt_driver = page.locator('#rcpt-driver').inner_text()
        rcpt_driver_phone = page.locator('#rcpt-driver-phone').inner_text()
        rcpt_rec_container = page.locator('#rcpt-recipient-container')

        print(f"Receipt Date & Time: {rcpt_datetime}")
        print(f"Receipt Duration: {rcpt_duration}")
        print(f"Receipt Booker: {rcpt_passenger} | Phone: {rcpt_passenger_phone}")
        print(f"Receipt Driver: {rcpt_driver} | Phone: {rcpt_driver_phone}")
        print(f"Receipt Recipient Container Hidden for Transport: {not rcpt_rec_container.is_visible()}")

        assert "mins" in rcpt_duration or "hr" in rcpt_duration, "Receipt duration should have units"
        assert "📞" in rcpt_passenger_phone, "Booker phone should be displayed"
        assert "📞" in rcpt_driver_phone, "Driver phone should be displayed"
        assert not rcpt_rec_container.is_visible(), "Recipient container should be hidden for transport"

        page.screenshot(path="C:/Users/Asus/.gemini/antigravity/brain/57104813-3721-4ee3-9732-9925a894118b/transport_receipt_contacts.png")
        print("Captured transport_receipt_contacts.png screenshot")

        # Close receipt
        page.evaluate("BookingModule.closeReceipt()")
        page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # TEST 4: Parcel Service & Scheduled Delivery
        # -------------------------------------------------------------
        print("\n--- TEST 4: Parcel Service & Schedule Hours / Gray-Out ---")
        page.evaluate("BookingModule.switchService('parcel')")
        page.wait_for_timeout(500)

        # Check motorcycle preference card is removed
        pref_card_count = page.locator('#parcel-moto-pref-card').count()
        print(f"Parcel motorcycle preference card count: {pref_card_count} (Expected: 0)")
        assert pref_card_count == 0, "Parcel motorcycle preference card should be removed from DOM!"

        # Turn ON Scheduled Delivery toggle
        page.evaluate("""() => {
            const toggle = document.getElementById('parcel-schedule-toggle');
            toggle.checked = true;
            BookingModule.toggleParcelSchedule(true);
        }""")
        page.wait_for_timeout(400)

        # Verify working hours text
        sched_container = page.locator('#parcel-schedule-time-container')
        assert sched_container.is_visible(), "Parcel schedule container should be visible"
        container_text = sched_container.inner_text()
        print(f"Working hours text found in schedule container: {'06:00 AM – 09:00 PM' in container_text}")
        assert "06:00 AM – 09:00 PM" in container_text, "Working hours should be 06:00 AM – 09:00 PM"

        # Verify time slot chips in #parcel-schedule-slots-grid
        slots = page.locator('#parcel-schedule-slots-grid button')
        slot_count = slots.count()
        print(f"Total time slot buttons rendered: {slot_count}")
        assert slot_count >= 15, f"Expected 16 hourly slots (06:00 to 21:00), got {slot_count}"

        # Verify disabled / past slots have line-through styling
        now_hour = time.localtime().tm_hour
        disabled_slots = page.locator('#parcel-schedule-slots-grid button:disabled')
        print(f"Current hour: {now_hour}. Disabled past slots count: {disabled_slots.count()}")
        if now_hour > 6:
            assert disabled_slots.count() > 0, "Slots before current hour should be disabled"

        # Test selecting a past time (e.g. 06:00 when now_hour > 6)
        if now_hour > 6:
            valid = page.evaluate("BookingModule.validateAndSetParcelScheduleTime('06:00')")
            print(f"Validation result for 06:00 (past time): {valid} (Expected: False)")
            assert valid == False, "Past delivery time should be rejected!"
            err_text = page.locator('#parcel-schedule-error-text').inner_text()
            print(f"Error message displayed: {err_text}")
            assert "already passed" in err_text or "future time" in err_text

        # Test selecting a valid future time within working hours (e.g. 20:30)
        valid_future = page.evaluate("BookingModule.validateAndSetParcelScheduleTime('20:30')")
        print(f"Validation result for 20:30: {valid_future} (Expected: True)")
        assert valid_future == True, "Future time 20:30 within working hours should be accepted"

        page.screenshot(path="C:/Users/Asus/.gemini/antigravity/brain/57104813-3721-4ee3-9732-9925a894118b/parcel_schedule_grayout.png")
        print("Captured parcel_schedule_grayout.png screenshot")

        # -------------------------------------------------------------
        # TEST 5: Parcel Booking & Recipient Details on Receipt
        # -------------------------------------------------------------
        print("\n--- TEST 5: Parcel Booking & Recipient Details on Receipt ---")
        # Fill in Step 1 sender details
        page.evaluate("""() => {
            document.getElementById('parcel-booker-name').value = "Maria Santos";
            document.getElementById('parcel-booker-phone').value = "+63 917 555 7788";
            BookingModule.setPickup(14.5547, 121.0244, 'Greenbelt 5, Legazpi Village, Makati');
            BookingModule.goToStep(2);
        }""")
        page.wait_for_timeout(500)

        # Fill in Step 2 recipient details
        page.evaluate("""() => {
            document.getElementById('parcel-dropoff-input').value = "Bonifacio High Street, BGC, Taguig";
            document.getElementById('parcel-recipient-name').value = "Roberto Gomez";
            document.getElementById('parcel-recipient-phone').value = "+63 928 333 4411";
            BookingModule.dropoffCoords = [14.5517, 121.0509];
            BookingModule.dropoffName = "Bonifacio High Street, BGC, Taguig";
        }""")
        page.wait_for_timeout(300)

        # Submit Parcel Booking
        page.evaluate("BookingModule.handleParcelSubmit()")
        page.wait_for_timeout(2500) # wait for radar modal

        assigned_parcel_driver = page.locator('#assign-driver-name').inner_text()
        assigned_parcel_car = page.locator('#assign-driver-car').inner_text()
        assigned_parcel_avatar = page.locator('#assign-driver-avatar').inner_text()
        print(f"Assigned Parcel Courier: {assigned_parcel_driver}, Vehicle: {assigned_parcel_car}, Avatar: {assigned_parcel_avatar}")
        assert assigned_parcel_avatar == "🛵", "Courier avatar for parcel must be 🛵"

        # Complete trip & trigger payment receipt
        page.evaluate("BookingModule.onArrivedAtDropoff()")
        page.wait_for_timeout(800)
        page.evaluate("PaymentsModule.submitActivePayment()")
        page.wait_for_timeout(800)

        # Verify receipt modal for parcel
        p_dt = page.locator('#rcpt-datetime').inner_text()
        p_dur = page.locator('#rcpt-duration').inner_text()
        p_booker = page.locator('#rcpt-passenger').inner_text()
        p_booker_phone = page.locator('#rcpt-passenger-phone').inner_text()
        p_driver = page.locator('#rcpt-driver').inner_text()
        p_driver_phone = page.locator('#rcpt-driver-phone').inner_text()
        p_rec_container = page.locator('#rcpt-recipient-container')
        p_rec_name = page.locator('#rcpt-recipient-name').inner_text()
        p_rec_phone = page.locator('#rcpt-recipient-phone').inner_text()

        print(f"\nParcel Receipt Date & Time: {p_dt}")
        print(f"Parcel Receipt Duration: {p_dur}")
        print(f"Parcel Booker: {p_booker} ({p_booker_phone})")
        print(f"Parcel Driver: {p_driver} ({p_driver_phone})")
        print(f"Parcel Recipient Container Visible: {p_rec_container.is_visible()}")
        print(f"Parcel Recipient Name: {p_rec_name} ({p_rec_phone})")

        assert p_rec_container.is_visible(), "Recipient container MUST be visible on parcel receipt!"
        assert "Roberto Gomez" in p_rec_name, f"Expected Roberto Gomez, got {p_rec_name}"
        assert "+63 928 333 4411" in p_rec_phone, f"Expected recipient phone, got {p_rec_phone}"
        assert "+63 917 555 7788" in p_booker_phone, f"Expected booker phone, got {p_booker_phone}"

        page.screenshot(path="C:/Users/Asus/.gemini/antigravity/brain/57104813-3721-4ee3-9732-9925a894118b/parcel_receipt_contacts.png")
        print("Captured parcel_receipt_contacts.png screenshot")

        browser.close()
        print("\n=== ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
