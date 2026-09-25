import re

with open('login.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The new inner content to replace lines 86-464 (old left+right panels)
new_inner = '''
        <!-- ==========================================-->
        <!-- STEP 1: Main Login Form                  -->
        <!-- ==========================================-->
        <form id="standalone-login-form" class="space-y-4 text-sm">

            <!-- Email Field -->
            <div id="field-email-container">
                <label class="block text-slate-700 font-semibold mb-1.5 text-xs">Username</label>
                <input type="email" id="input-identifier-email" value="" placeholder="Enter username" class="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-hirna-600 focus:outline-none transition text-sm">
            </div>

            <!-- Password / PIN Field -->
            <div>
                <div class="flex justify-between items-center mb-1.5">
                    <label id="label-secret-input" class="text-slate-700 font-semibold text-xs">Password</label>
                    <div class="flex items-center space-x-2.5">
                        <button type="button" id="btn-toggle-pin-mode" onclick="togglePinMode()" class="text-[11px] text-slate-500 hover:text-hirna-700 font-semibold cursor-pointer transition">Use PIN instead</button>
                        <span class="text-slate-400 text-[10px]">&bull;</span>
                        <a href="javascript:void(0)" id="link-forgot-credential" onclick="handleForgotCredential()" class="text-[11px] text-hirna-700 hover:text-hirna-600 font-semibold">Forgot Password?</a>
                    </div>
                </div>

                <!-- Standard Password Input -->
                <div id="container-password-mode" class="relative">
                    <input type="password" id="input-password" value="" placeholder="Enter password" class="w-full px-3.5 py-3 pr-10 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-hirna-600 focus:outline-none transition text-sm">
                    <button type="button" onclick="togglePasswordVisibility()" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer" title="Toggle password visibility">
                        <span id="eye-icon" class="flex items-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></span>
                    </button>
                </div>

                <!-- 4-Digit PIN Mode -->
                <div id="container-pin-mode" class="hidden space-y-2">
                    <div class="flex justify-center items-center gap-3 max-w-xs mx-auto py-1" id="pin-input-group">
                        <input type="password" maxlength="1" inputmode="numeric" class="pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                        <input type="password" maxlength="1" inputmode="numeric" class="pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                        <input type="password" maxlength="1" inputmode="numeric" class="pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                        <input type="password" maxlength="1" inputmode="numeric" class="pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    </div>
                    <p class="text-[11px] text-slate-500 text-center font-medium">Enter your 4-digit security PIN</p>
                </div>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center text-xs text-slate-500 pt-1">
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="check-remember-me" class="w-4 h-4 rounded border-slate-300 bg-white text-hirna-700 focus:ring-hirna-600">
                    <span>Remember this device</span>
                </label>
            </div>

            <!-- Login Button -->
            <button type="submit" id="btn-submit-login" class="w-full py-3 bg-hirna-700 hover:bg-hirna-800 text-white font-black text-sm rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center cursor-pointer">
                <span id="btn-submit-login-text">Login</span>
            </button>
        </form>

        <!-- ==========================================-->
        <!-- STEP 1.5: Simultaneous Sessions          -->
        <!-- ==========================================-->
        <div id="simultaneous-sessions-section" class="hidden space-y-4 text-xs">
            <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
                <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div>
                    <h4 class="text-xs font-black text-amber-700 uppercase tracking-wide">Simultaneous Active Sign-In Detected</h4>
                    <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">This account is currently active on another device. Review the active sessions below:</p>
                </div>
            </div>
            <div id="simultaneous-sessions-list" class="space-y-2.5 max-h-64 overflow-y-auto pr-1"></div>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                <p>
                    &bull; <strong class="text-emerald-600">Allow &amp; Continue:</strong> Approves sign-in on this device and advances to OTP.<br>
                    &bull; <strong class="text-rose-600">Restrict &amp; Block:</strong> Aborts this sign-in attempt and protects the existing active session.
                </p>
            </div>
            <div class="grid grid-cols-2 gap-3 pt-2">
                <button type="button" id="btn-simultaneous-restrict" onclick="handleSimultaneousDecision(\'restrict\')" class="py-3 bg-rose-50 hover:bg-rose-600 border border-rose-300 text-rose-600 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                    <span>Restrict &amp; Block</span>
                </button>
                <button type="button" id="btn-simultaneous-allow" onclick="handleSimultaneousDecision(\'allow\')" class="py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center space-x-1.5 cursor-pointer">
                    <span>Allow &amp; Continue</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </button>
            </div>
        </div>

        <!-- ==========================================-->
        <!-- STEP 2: OTP Verification                 -->
        <!-- ==========================================-->
        <div id="otp-verification-section" class="hidden space-y-5 text-xs">
            <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-xl bg-hirna-50 border border-hirna-200 flex items-center justify-center text-hirna-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                        <span class="text-[11px] text-slate-500 block">Code sent to:</span>
                        <span id="otp-target-email" class="text-xs font-bold text-slate-900 font-mono">superadmin@hirna.ph</span>
                    </div>
                </div>
                <button type="button" onclick="cancelOtpStep()" class="text-[11px] text-slate-500 hover:text-slate-900 transition underline cursor-pointer">Change</button>
            </div>
            <div>
                <div class="flex justify-between items-center mb-2 px-1">
                    <label class="text-slate-700 font-bold text-xs">Enter 6-Digit Email Verification Code</label>
                    <button type="button" id="btn-autofill-otp" onclick="pasteFromClipboardOtp()" class="text-[11px] text-hirna-700 hover:text-hirna-600 font-semibold cursor-pointer transition">Paste</button>
                </div>
                <div class="flex justify-between items-center gap-2 max-w-sm mx-auto" id="otp-input-group">
                    <input type="text" maxlength="1" inputmode="numeric" class="otp-digit w-12 h-14 text-center text-xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="text" maxlength="1" inputmode="numeric" class="otp-digit w-12 h-14 text-center text-xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="text" maxlength="1" inputmode="numeric" class="otp-digit w-12 h-14 text-center text-xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="text" maxlength="1" inputmode="numeric" class="otp-digit w-12 h-14 text-center text-xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="text" maxlength="1" inputmode="numeric" class="otp-digit w-12 h-14 text-center text-xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="text" maxlength="1" inputmode="numeric" class="otp-digit w-12 h-14 text-center text-xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                </div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Didn\'t receive code?</span>
                <button type="button" id="btn-resend-otp" onclick="resendOtpCode()" class="text-hirna-700 hover:text-hirna-600 font-bold transition cursor-pointer">Resend Code (<span id="resend-countdown">30</span>s)</button>
            </div>
            <div class="space-y-2 pt-2">
                <button type="button" id="btn-verify-otp" onclick="verifyOtpCode()" class="w-full py-3 bg-hirna-700 hover:bg-hirna-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition transform active:scale-95 flex items-center justify-center space-x-2 cursor-pointer">
                    <span>Verify Code &amp; Complete Sign In</span>
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </button>
                <button type="button" onclick="cancelOtpStep()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer">
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    <span>Back to Credential Login</span>
                </button>
            </div>
        </div>

        <!-- ==========================================-->
        <!-- STEP 3: Forgot Password                  -->
        <!-- ==========================================-->
        <div id="forgot-password-section" class="hidden space-y-4 text-xs">
            <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
                <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                </div>
                <div>
                    <span class="text-xs font-bold text-slate-900 block">Password Reset via Email OTP</span>
                    <span class="text-[11px] text-slate-500">An OTP code will be sent by <code class="text-amber-600 font-mono">hirnasecurity@gmail.com</code> to verify ownership.</span>
                </div>
            </div>
            <div>
                <label class="block text-slate-700 font-bold mb-1.5">Account Email Address</label>
                <div class="flex gap-2">
                    <input type="email" id="reset-target-email" placeholder="e.g. yourname@gmail.com" class="flex-1 px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-hirna-600 focus:outline-none transition">
                    <button type="button" id="btn-request-reset-otp" onclick="requestResetOtpCode()" class="px-4 py-3 bg-hirna-700 hover:bg-hirna-800 text-white font-black rounded-xl transition whitespace-nowrap cursor-pointer">Send Code</button>
                </div>
            </div>
            <div>
                <div class="flex justify-between items-center mb-1.5">
                    <label class="text-slate-700 font-bold">6-Digit Reset Code</label>
                    <span id="reset-resend-indicator" class="text-[11px] text-slate-400 font-medium">Click "Send Code" above</span>
                </div>
                <input type="text" id="reset-input-otp" maxlength="6" inputmode="numeric" placeholder="Enter 6-digit code received in Gmail" class="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold tracking-widest text-center text-base focus:ring-2 focus:ring-hirna-600 focus:outline-none transition">
            </div>
            <div>
                <label class="block text-slate-700 font-bold mb-1.5">New Password</label>
                <input type="password" id="reset-new-password" placeholder="Enter new password" class="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-hirna-600 focus:outline-none transition">
            </div>
            <div>
                <label class="block text-slate-700 font-bold mb-1.5">Confirm New Password</label>
                <input type="password" id="reset-confirm-password" placeholder="Re-type new password to confirm" class="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-hirna-600 focus:outline-none transition">
            </div>
            <div class="space-y-2 pt-2">
                <button type="button" id="btn-confirm-password-reset" onclick="confirmPasswordReset()" class="w-full py-3 bg-hirna-700 hover:bg-hirna-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition transform active:scale-95 flex items-center justify-center space-x-2 cursor-pointer">
                    <span>Reset Password &amp; Sign In</span>
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </button>
                <button type="button" onclick="cancelForgotPasswordFlow()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer">
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    <span>Cancel &amp; Return to Login</span>
                </button>
            </div>
        </div>

        <!-- ==========================================-->
        <!-- STEP 4: PIN Setup                        -->
        <!-- ==========================================-->
        <div id="pin-setup-section" class="hidden space-y-4 text-xs">
            <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
                <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <div>
                    <span id="pin-setup-heading" class="text-xs font-bold text-slate-900 block">Set Up 4-Digit Security PIN</span>
                    <span class="text-[11px] text-slate-500">A verification code has been dispatched by <code class="text-amber-600 font-mono">hirnasecurity@gmail.com</code>.</span>
                </div>
            </div>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                    <span class="text-[11px] text-slate-500 block">Account:</span>
                    <span id="pin-setup-target-email" class="text-xs font-bold text-slate-900 font-mono">superadmin@hirna.ph</span>
                </div>
                <button type="button" id="btn-resend-pin-setup-otp" onclick="resendPinSetupOtp()" class="text-[11px] text-hirna-700 hover:text-hirna-600 font-bold transition cursor-pointer">Resend Code (<span id="pin-setup-countdown">30</span>s)</button>
            </div>
            <div>
                <label class="block text-slate-700 font-bold mb-1.5">6-Digit Email Verification Code</label>
                <input type="text" id="pin-setup-input-otp" maxlength="6" inputmode="numeric" placeholder="Enter 6-digit code received in Gmail" class="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold tracking-widest text-center text-base focus:ring-2 focus:ring-hirna-600 focus:outline-none transition">
            </div>
            <div>
                <label class="block text-slate-700 font-bold mb-1.5 text-center">Create 4-Digit PIN</label>
                <div class="flex justify-center items-center gap-3 max-w-xs mx-auto py-1" id="new-pin-input-group">
                    <input type="password" maxlength="1" inputmode="numeric" class="new-pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="password" maxlength="1" inputmode="numeric" class="new-pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="password" maxlength="1" inputmode="numeric" class="new-pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="password" maxlength="1" inputmode="numeric" class="new-pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                </div>
            </div>
            <div>
                <label class="block text-slate-700 font-bold mb-1.5 text-center">Confirm 4-Digit PIN (Type Again)</label>
                <div class="flex justify-center items-center gap-3 max-w-xs mx-auto py-1" id="confirm-pin-input-group">
                    <input type="password" maxlength="1" inputmode="numeric" class="confirm-pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="password" maxlength="1" inputmode="numeric" class="confirm-pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="password" maxlength="1" inputmode="numeric" class="confirm-pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                    <input type="password" maxlength="1" inputmode="numeric" class="confirm-pin-digit w-12 h-14 text-center text-2xl font-mono font-black bg-white border border-slate-300 rounded-xl text-hirna-700 focus:border-hirna-600 focus:ring-2 focus:ring-hirna-600/30 focus:outline-none transition shadow-inner">
                </div>
            </div>
            <div class="space-y-2 pt-2">
                <button type="button" id="btn-save-pin-setup" onclick="confirmSavePinSetup()" class="w-full py-3 bg-hirna-700 hover:bg-hirna-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition transform active:scale-95 flex items-center justify-center space-x-2 cursor-pointer">
                    <span id="btn-save-pin-text">Save PIN &amp; Enable PIN Sign-In</span>
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </button>
                <button type="button" onclick="cancelPinSetupFlow()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer">
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    <span>Back to Login</span>
                </button>
            </div>
        </div>

        <!-- Footer link -->
        <p class="text-center text-xs text-slate-500 pt-2">
            Don\'t have an account? <a href="#" class="text-hirna-700 font-bold hover:text-hirna-600">Job application</a>
        </p>

    </div>'''

# Find the range to replace (lines 86-464, 0-indexed: 85-463)
lines = content.split('\n')

# Find the old content markers
# Line 86 (0-indexed 85) starts with: "        <div>"  (the inner wrapper)
# Line 464 (0-indexed 463) is: "    </div>" (closing of main card)
# We need to replace lines 85 to 463 inclusive

before = '\n'.join(lines[:85])  # lines 1-85
after_line = 463  # 0-indexed, this is the </div> closing the main card

# After line 464, the next lines are script tags
after = '\n'.join(lines[after_line:])

new_content = before + '\n' + new_inner + '\n' + after

with open('login.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Verify
with open('login.html', 'r', encoding='utf-8') as f:
    result = f.read()
print(f'File written: {len(result)} bytes')
print('Contains Welcome Back:', 'Welcome Back' in result)
print('Contains standalone-login-form:', 'standalone-login-form' in result)
print('Contains old lg:col-span-5:', 'lg:col-span-5' in result)
