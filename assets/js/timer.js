document.addEventListener('DOMContentLoaded', () => {
    class Timer {
      constructor(duration, display, resendButton) {
        this.duration = duration;
        this.display = display;
        this.resendButton = resendButton;
        this.interval = null;
      }
  
      start(fromSeconds = null) {
        let endTime = Date.now() + ((fromSeconds ?? this.duration) * 1000);
        sessionStorage.setItem('otpTimerEnd', endTime);
  
        this.updateUI(endTime);
  
        this.interval = setInterval(() => {
          this.updateUI(endTime);
        }, 1000);
      }
  
      updateUI(endTime) {
        const timeLeft = Math.floor((endTime - Date.now()) / 1000);
  
        if (timeLeft <= 0) {
          clearInterval(this.interval);
          sessionStorage.removeItem('otpTimerEnd');
          this.display.textContent = '00:00';
          this.resendButton.disabled = false;
          this.resendButton.classList.add('hover:text-blue-500');
          return;
        }
  
        this.display.textContent = this.formatTime(timeLeft);
        this.resendButton.disabled = true;
        this.resendButton.classList.remove('hover:text-blue-500');
      }
  
      reset() {
        clearInterval(this.interval);
        this.start(this.duration);
      }
  
      formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
      }
    }
  
    const timerDisplay = document.getElementById('timer');
    const resendButton = document.getElementById('resendBtn');
    const otpTimer = new Timer(30, timerDisplay, resendButton);
  
    const savedEndTime = sessionStorage.getItem('otpTimerEnd');
    if (savedEndTime && Date.now() < +savedEndTime) {
      const secondsLeft = Math.ceil((+savedEndTime - Date.now()) / 1000);
      otpTimer.start(secondsLeft);
    } else {
      otpTimer.start();
    }
  
    // Handle resend
    let isRequestPending = false;
  
    resendButton.addEventListener('click', async () => {
      if (isRequestPending) return;
  
      try {
        isRequestPending = true;
        resendButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Sending...`;
        resendButton.disabled = true;
  
        // Simulated API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            Math.random() < 0.9 ? resolve() : reject(new Error('Failed to send OTP'));
          }, 1500);
        });
  
        otpTimer.reset();
  
        resendButton.innerHTML = `<i class="fas fa-check-circle mr-2"></i> Code Resent!`;
        resendButton.classList.add('text-green-500');
        resendButton.classList.remove('text-gray-600', 'hover:text-blue-500');
  
        setTimeout(() => {
          resendButton.innerHTML = 'Resend Code';
          resendButton.classList.remove('text-green-500');
          resendButton.classList.add('text-gray-600', 'hover:text-blue-500');
        }, 2000);
  
      } catch (error) {
        resendButton.innerHTML = `<i class="fas fa-times-circle mr-2"></i> ${error.message}`;
        resendButton.classList.add('text-red-500');
  
        setTimeout(() => {
          resendButton.innerHTML = 'Resend Code';
          resendButton.classList.remove('text-red-500');
          resendButton.classList.add('text-gray-600', 'hover:text-blue-500');
          resendButton.disabled = false;
        }, 3000);
      } finally {
        isRequestPending = false;
      }
    });
  });
  