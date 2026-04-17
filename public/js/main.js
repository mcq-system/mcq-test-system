/* public/js/main.js */

document.addEventListener('DOMContentLoaded', () => {

  // ── Drawer ──────────────────────────────────────────────
  const overlay     = document.getElementById('drawerOverlay');
  const addBtn      = document.querySelector('.btn-primary[href="/questions/new"]');
  const closeBtn    = document.getElementById('closeDrawerBtn');
  const cancelBtn   = document.getElementById('cancelDrawerBtn');

  // Nếu nút "Thêm câu hỏi" là <a>, chuyển thành mở drawer thay vì navigate
  const addLink = document.querySelector('a.btn-primary[href="/questions/new"]');
  if (addLink && overlay) {
    addLink.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });
  }

  if (closeBtn)  closeBtn.addEventListener('click', closeDrawer);
  if (cancelBtn) cancelBtn.addEventListener('click', closeDrawer);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDrawer();
    });
  }

  function openDrawer() {
    overlay.classList.remove('hidden');
    generateWave();
  }

  function closeDrawer() {
    overlay.classList.add('hidden');
  }

  // ── Question type switcher ───────────────────────────────
  const qTypeSelect      = document.getElementById('qTypeSelect');
  const readingSection   = document.getElementById('readingSection');
  const listeningSection = document.getElementById('listeningSection');

  if (qTypeSelect) {
    qTypeSelect.addEventListener('change', () => {
      const v = qTypeSelect.value;
      readingSection  && readingSection.classList.toggle('hidden',   v !== 'reading');
      listeningSection && listeningSection.classList.toggle('hidden', v !== 'listening');
    });
  }

  // ── Answer selection ─────────────────────────────────────
  document.querySelectorAll('.answer-letter').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.answer-letter').forEach(l => l.classList.remove('answer-correct'));
      el.classList.add('answer-correct');

      const label = document.getElementById('correctAnswerLabel');
      const input = document.getElementById('correctAnswerInput');
      const letter = el.dataset.letter || el.textContent.trim();
      if (label) label.textContent = letter;
      if (input) input.value = letter;
    });
  });

  // ── Audio waveform visual ────────────────────────────────
  function generateWave() {
    const wave = document.getElementById('audioWave');
    if (!wave) return;
    const heights = [8,14,20,28,22,16,32,24,18,30,26,20,14,28,22,16,24,32,18,12,26,20,28,16,22,30,14,24,18,20];
    wave.innerHTML = heights
      .map(h => `<div class="wave-bar" style="height:${h}px;"></div>`)
      .join('');
  }

  // ── Search: submit on Enter ──────────────────────────────
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchInput.closest('form').submit();
      }
    });
  }

  // ── Delete confirmation ──────────────────────────────────
  document.querySelectorAll('.icon-btn--danger[data-id]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!confirm(`Xoá câu hỏi ${id}?`)) return;

      try {
        const res = await fetch(`/questions/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          btn.closest('.q-card').remove();
        }
      } catch (err) {
        console.error('Xoá thất bại:', err);
      }
    });
  });

});
