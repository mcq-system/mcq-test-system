/**
 * profile.js
 * Xử lý 2 chức năng trên trang Profile:
 *   1. Chuyển tab giữa "Thông tin cá nhân" và "Đổi mật khẩu"
 *   2. Gọi API PATCH /auth/change-password để đổi mật khẩu
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. Tab Switching ──────────────────────────────────────────────────────
  const tabItems  = document.querySelectorAll('.tab-item');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabItems.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabItems.forEach(t => t.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tabPanels[index].classList.add('active');
    });
  });

  // ─── 2. Toggle hiện/ẩn mật khẩu ──────────────────────────────────────────
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? '🙈' : '👁️';
    });
  });

  // ─── 3. Xử lý form đổi mật khẩu ──────────────────────────────────────────
  const changePasswordForm = document.getElementById('change-password-form');
  if (!changePasswordForm) return;

  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword     = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const msgBox          = document.getElementById('cp-message');

    // ── Validate phía client ─────────────────────────────────────────────────
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showMessage(msgBox, 'error', 'Vui lòng điền đầy đủ tất cả các trường.');
    }
    if (newPassword.length < 6) {
      return showMessage(msgBox, 'error', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
    }
    if (newPassword !== confirmPassword) {
      return showMessage(msgBox, 'error', 'Mật khẩu xác nhận không khớp.');
    }
    if (newPassword === currentPassword) {
      return showMessage(msgBox, 'error', 'Mật khẩu mới phải khác mật khẩu hiện tại.');
    }

    const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    try {
      // ── Gọi API PATCH /auth/change-password ──────────────────────────────
      // Cookie JWT (httpOnly) được trình duyệt tự đính kèm – không cần token thủ công
      const response = await fetch('/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage(msgBox, 'success', '✅ ' + data.message);
        changePasswordForm.reset();
      } else {
        showMessage(msgBox, 'error', '❌ ' + (data.message || 'Đổi mật khẩu thất bại.'));
      }
    } catch (err) {
      console.error('Change password error:', err);
      showMessage(msgBox, 'error', '❌ Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🔒 Đổi mật khẩu';
    }
  });

  // ─── Helper: hiển thị thông báo ───────────────────────────────────────────
  function showMessage(el, type, text) {
    if (!el) return;
    el.textContent = text;
    el.className = 'cp-message ' + type;
    el.style.display = 'block';
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => { el.style.display = 'none'; }, 5000);
  }
});
