document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const emailDisplay = document.getElementById('userEmail');
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('verifyBtn');
  
    if (email) emailDisplay.textContent = email;
  
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1 && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });
  
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });

    // Track failed attempts
    let failedAttempts = parseInt(sessionStorage.getItem('failedAttempts')) || 0;
    let cooldownUntil = parseInt(sessionStorage.getItem('cooldownUntil')) || 0;

    // Prevent verify if under cooldown
    if (Date.now() < cooldownUntil) {
        const secondsLeft = Math.ceil((cooldownUntil - Date.now()) / 1000);
        showError(`Too many attempts. Please wait ${secondsLeft}s.`);
        return;
    }

  
    verifyBtn.addEventListener('click', async () => {
      const otp = Array.from(otpInputs).map(input => input.value).join('');
  
      clearOtpStyles();
  
      if (!otp || otp.length < 6) {
        showError('Please enter the full 6-digit code.');
        return;
      }
  
      if (!/^\d{6}$/.test(otp)) {
        showError('OTP must contain only numbers.');
        resetOtpInputs();
        return;
      }
  
      setButtonLoading(true);
  
      try {
        const result = await mockVerifyOtp(otp);
  
        if (result.success) {
          showSuccess('Verification successful! Redirecting...');
          resetOtpInputs();
          setTimeout(() => window.location.href = 'success.html', 2000);
        } else {
          throw new Error(result.error);
        }
  
      } catch (err) {
        showError(err.message);
        failedAttempts++;
        sessionStorage.setItem('failedAttempts', failedAttempts);

        if (failedAttempts >= 3) {
            const cooldownSeconds = 30;
            const cooldownEnd = Date.now() + cooldownSeconds * 1000;
            sessionStorage.setItem('cooldownUntil', cooldownEnd);
            showError(`Too many incorrect attempts. Try again in ${cooldownSeconds}s.`);

            // visually disable button
            verifyBtn.disabled = true;
            let cooldownInterval = setInterval(() => {
                const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
                if (remaining <= 0) {
                clearInterval(cooldownInterval);
                verifyBtn.disabled = false;
                sessionStorage.removeItem('failedAttempts');
                sessionStorage.removeItem('cooldownUntil');
                } else {
                verifyBtn.innerHTML = `Wait ${remaining}s`;
                }
            }, 1000);
        }

        resetOtpInputs();
      } finally {
        setButtonLoading(false);
      }
    });
  
    function clearOtpStyles() {
      otpInputs.forEach(input => input.classList.remove('border-red-500', 'shake'));
    }
  
    function resetOtpInputs() {
      otpInputs.forEach(input => input.value = '');
      otpInputs[0].focus();
    }
  
    function setButtonLoading(isLoading) {
      verifyBtn.disabled = isLoading;
      verifyBtn.innerHTML = isLoading
        ? `<i class="fas fa-spinner fa-spin mr-2"></i> Verifying...`
        : `Verify`;
    }
  
    function showError(message) {
      showToast('Error', message, 'red');
      otpInputs.forEach(input => input.classList.add('border-red-500', 'shake'));
    }
  
    function showSuccess(message) {
      showToast('Success', message, 'green');
    }
  
    function showToast(title, message, color) {
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 bg-${color}-100 border border-${color}-400 text-${color}-700 px-4 py-3 rounded transition-opacity opacity-0 z-50`;
      toast.innerHTML = `<strong>${title}:</strong> ${message}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('opacity-100'), 10);
      setTimeout(() => toast.remove(), color === 'red' ? 5000 : 3000);
    }
  
    async function mockVerifyOtp(otp) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(otp === '123456'
            ? { success: true }
            : { success: false, error: 'Invalid verification code' });
        }, 1500);
      });
    }
  
    if (!document.getElementById('shake-style')) {
      const style = document.createElement('style');
      style.id = 'shake-style';
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
      `;
      document.head.appendChild(style);
    }
  });
  