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

// The static link stays usable even if the GitHub API is unavailable or limited.
// Future stable APK releases can update download buttons without a site rebuild.
const repository = 'https://api.github.com/repos/kubok758/Smeshariki-Dust-Strike/releases/latest';
const releaseController = new AbortController();
const releaseTimeout = setTimeout(() => releaseController.abort(), 5000);
fetch(repository, {signal: releaseController.signal})
  .then(response => { if (!response.ok) throw new Error('Release unavailable'); return response.json(); })
  .then(release => {
    if (release.draft || release.prerelease || !/^v?\d+\.\d+\.\d+$/.test(release.tag_name)) return;
    const asset = release.assets?.find(item => item.name === 'Smeshariki-Dust-Strike.apk') || release.assets?.find(item => /^Smeshariki-Dust-Strike.*\.apk$/i.test(item.name));
    const prefix = 'https://github.com/kubok758/Smeshariki-Dust-Strike/releases/download/';
    if (!asset?.browser_download_url?.startsWith(prefix)) return;
    document.querySelectorAll('.download-link').forEach(link => { link.href = asset.browser_download_url; });
    document.querySelectorAll('.release-size').forEach(label => { label.textContent = `${Math.ceil(asset.size / 1e6)} МБ`; });
    const version = release.tag_name.replace(/^v/, '');
    document.querySelector('.header-version').textContent = version;
    document.querySelector('.version-value').textContent = version;
    if (release.html_url?.startsWith('https://github.com/kubok758/Smeshariki-Dust-Strike/releases/')) document.querySelector('.release-notes').href = release.html_url;
    if (version !== '1.8.4') {
      document.querySelector('.release-date').textContent = new Date(release.published_at).toLocaleDateString('ru-RU', {day:'numeric', month:'long', year:'numeric'});
      document.querySelector('.release-card h3').textContent = 'Новая версия уже доступна';
      const list = document.querySelector('.release-card ul');
      list.replaceChildren();
      const item = document.createElement('li');
      item.textContent = 'Список изменений — на странице обновления. Для совместной игры обновитесь всей компанией.';
      list.append(item);
    }
  }).catch(() => { /* Keep the verified release embedded in the page. */ })
  .finally(() => clearTimeout(releaseTimeout));
