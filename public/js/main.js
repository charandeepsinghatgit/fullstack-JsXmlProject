// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Initialize save job buttons
  initializeSaveButtons();
});

// Save Job Functionality
function initializeSaveButtons() {
  const saveButtons = document.querySelectorAll('.btn-save, .btn-save-large');
  
  saveButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const jobId = this.dataset.jobId;
      const jobTitle = this.dataset.title;
      const company = this.dataset.company;
      const location = this.dataset.location;
      const isSaved = this.classList.contains('saved');
      
      try {
        const endpoint = isSaved ? `/jobs/unsave/${jobId}` : `/jobs/save/${jobId}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: jobTitle,
            company: company,
            location: location
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          if (data.saved) {
            this.classList.add('saved');
            this.innerHTML = '<i class="fas fa-bookmark"></i> ' + (this.classList.contains('btn-save-large') ? 'Saved' : '');
            showNotification('Job saved successfully!', 'success');
          } else {
            this.classList.remove('saved');
            this.innerHTML = '<i class="far fa-bookmark"></i> ' + (this.classList.contains('btn-save-large') ? 'Save Job' : '');
            showNotification('Job removed from saved list', 'info');
          }
          
          // Update badge count
          updateSavedJobsCount();
        }
      } catch (error) {
        console.error('Error saving job:', error);
        showNotification('Failed to save job', 'error');
      }
    });
  });
}

// Update saved jobs count in navigation
async function updateSavedJobsCount() {
  // The count is server-side, so we'll reload to update it
  // In a real app, you might use AJAX to get the count
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Form validation helper
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;
  
  const inputs = form.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = '#e74c3c';
      isValid = false;
    } else {
      input.style.borderColor = '#bdc3c7';
    }
  });
  
  return isValid;
}

// Loading state helper
function setLoadingState(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  } else {
    button.disabled = false;
  }
}

// Format number as currency
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Debounce helper for search inputs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}