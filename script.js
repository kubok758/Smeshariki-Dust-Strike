'use strict';
const lightbox = document.querySelector('.lightbox');
const preview = lightbox.querySelector('img');
const caption = document.querySelector('#lightbox-caption');
document.querySelectorAll('[data-shot]').forEach(button => {
  button.addEventListener('click', () => {
    preview.src = button.dataset.shot;
    preview.alt = button.querySelector('img').alt;
    caption.textContent = button.dataset.caption;
    lightbox.showModal();
  });
});
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => {
  if (event.target !== lightbox) return;
  const bounds = lightbox.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) lightbox.close();
});

// Keep the same verified release in index.html as a no-JavaScript fallback.
// An empty URL deliberately leaves download links pointing to the status panel.
fetch('release.json', {cache: 'no-cache'})
  .then(response => {
    if (!response.ok) throw new Error('Release unavailable');
    return response.json();
  })
  .then(release => {
    if (!/^\d+\.\d+\.\d+$/.test(release.version) || !Number.isSafeInteger(release.apkBytes) || release.apkBytes <= 0) return;
    if (typeof release.downloadUrl !== 'string') return;
    if (release.downloadUrl) {
      const url = new URL(release.downloadUrl);
      if (url.origin !== 'https://mega.nz' || !url.pathname.startsWith('/file/') || !url.hash) return;
    }
    const ready = Boolean(release.downloadUrl);
    document.querySelectorAll('.download-link').forEach(link => {
      link.href = ready ? release.downloadUrl : '#download';
      if (ready) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = 'Открыть APK на MEGA в новой вкладке';
      } else {
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.removeAttribute('title');
      }
      const label = link.querySelector('.download-label');
      label.textContent = ready ? label.dataset.readyLabel : label.dataset.pendingLabel;
    });
    document.querySelectorAll('.header-version, .version-value').forEach(label => { label.textContent = release.version; });
    document.querySelectorAll('.release-size').forEach(label => { label.textContent = `${Math.ceil(release.apkBytes / 1e6)} МБ`; });
    document.querySelector('.release-state').textContent = ready ? 'ГОТОВО К УСТАНОВКЕ' : 'ГОТОВИМ ССЫЛКУ';
    document.querySelector('.release-badge').textContent = ready ? 'LIVE' : 'ОЖИДАЕТ ССЫЛКИ';
    document.querySelector('#release-status').textContent = ready
      ? 'Кнопка откроет файл на MEGA в новой вкладке. Скачай APK, затем открой его на Android.'
      : 'Файл готовится к публикации на MEGA. Ссылка на скачивание появится здесь.';
    const published = new Date(release.publishedAt);
    if (!Number.isNaN(published.getTime())) document.querySelector('.release-date').textContent = published.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
    if (Array.isArray(release.changes) && release.changes.length && release.changes.every(change => typeof change === 'string')) {
      const list = document.querySelector('.release-card ul');
      list.replaceChildren(...release.changes.map(change => {
        const item = document.createElement('li');
        item.textContent = change;
        return item;
      }));
    }
  })
  .catch(() => { /* The static release remains usable when the config cannot load. */ });
