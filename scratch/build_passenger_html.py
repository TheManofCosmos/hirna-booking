import os

with open('booking.html', 'r', encoding='utf-8') as f:
    b_html = f.read()

with open('payments.html', 'r', encoding='utf-8') as f:
    p_html = f.read()

b_tab_start = b_html.find('<div id="tab-booking"')
b_tab_end = b_html.find('</main>', b_tab_start)
b_tab_content = b_html[b_tab_start:b_tab_end].rstrip()

p_tab_start = p_html.find('<div id="tab-payments"')
p_tab_end = p_html.find('</main>', p_tab_start)
p_tab_content = p_html[p_tab_start:p_tab_end].rstrip()
# Make payments hidden by default
p_tab_content = p_tab_content.replace('id="tab-payments" class="tab-content-panel space-y-6 "', 'id="tab-payments" class="tab-content-panel space-y-6 hidden"')
p_tab_content = p_tab_content.replace('id="tab-payments" class="tab-content-panel space-y-6"', 'id="tab-payments" class="tab-content-panel space-y-6 hidden"')

# Extract modals from booking.html
b_modals_start = b_html.find('<!-- ================================================================= -->\n    <!-- FOOD & MART ORDER QUANTITY / OPTIONS MODAL', b_tab_end)
if b_modals_start == -1:
    b_modals_start = b_html.find('<!-- FOOD & MART ORDER QUANTITY', b_tab_end)
if b_modals_start == -1:
    b_modals_start = b_html.find('<div id="food-quantity-modal"', b_tab_end)

b_modals_end = b_html.find('<!-- TOAST NOTIFICATION CONTAINER -->', b_modals_start)
b_modals_content = b_html[b_modals_start:b_modals_end]

# Extract modals from payments.html
p_modal_topup_start = p_html.find('<!-- CASH IN / TOP UP WALLET MODAL -->')
if p_modal_topup_start == -1:
    p_modal_topup_start = p_html.find('<div id="wallet-topup-modal"')
p_modal_topup_end = p_html.find('<!-- TOAST NOTIFICATION CONTAINER -->', p_modal_topup_start)
p_modals_content = p_html[p_modal_topup_start:p_modal_topup_end]

# Extract add payment method modal if present in payments.html
p_add_method_modal = ""
if 'id="add-payment-method-modal"' in p_html:
    m_start = p_html.find('id="add-payment-method-modal"')
    # find enclosing div start
    div_start = p_html.rfind('<div', 0, m_start)
    # find where this modal ends (next modal or end)
    # Alternatively find by comment
    pass

print(f"Booking tab extracted: {len(b_tab_content)} chars")
print(f"Payments tab extracted: {len(p_tab_content)} chars")
print(f"Booking modals extracted: {len(b_modals_content)} chars")
print(f"Payments modals extracted: {len(p_modals_content)} chars")
