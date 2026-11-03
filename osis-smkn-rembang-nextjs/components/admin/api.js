// Fungsi bantu di sisi browser untuk panel admin.

export async function api(url, opts) {
  const res = await fetch(url, opts);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {}
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Sesi berakhir. Silakan masuk lagi.');
  }
  if (!res.ok) throw new Error((data && data.error) || `Terjadi kesalahan (${res.status}).`);
  return data;
}

export const simpan = (key, value) =>
  api('/api/admin/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });

// Foto dari HP bisa berukuran besar. Dikecilkan dulu di browser supaya unggahan cepat dan hemat penyimpanan.
export async function kompres(file, sisiMaks = 1920, mutu = 0.86) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`"${file.name}" bukan JPG, PNG, atau WebP.`);
  let bmp;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (e) {
    bmp = await new Promise((ok, gagal) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => gagal(new Error(`"${file.name}" tidak bisa dibaca.`));
      img.src = URL.createObjectURL(file);
    });
  }
  const w0 = bmp.width;
  const h0 = bmp.height;
  const skala = Math.min(1, sisiMaks / Math.max(w0, h0));
  const w = Math.round(w0 * skala);
  const h = Math.round(h0 * skala);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', mutu));
  if (!blob) throw new Error(`"${file.name}" gagal diproses.`);
  return blob;
}

export async function unggah(file, folder, sisiMaks) {
  const blob = await kompres(file, sisiMaks);
  const fd = new FormData();
  fd.append('file', blob, 'foto.jpg');
  fd.append('folder', folder);
  const { path } = await api('/api/admin/upload', { method: 'POST', body: fd });
  return path;
}

export const bersihkanFile = (paths) => {
  if (!paths.length) return Promise.resolve();
  return api('/api/admin/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths }),
  }).catch(() => {});
};

export const buatSlug = (t) =>
  String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

export const acak = (n = 4) => Math.random().toString(36).slice(2, 2 + n).padEnd(n, '0');
