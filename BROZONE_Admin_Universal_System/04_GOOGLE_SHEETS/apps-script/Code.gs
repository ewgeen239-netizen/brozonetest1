/**
 * BROZONE — Google Sheets API (Apps Script Web App)
 * Jedyny most między panelem / stroną a arkuszem.
 *
 * Wdrożenie: Rozszerzenia → Apps Script → Wdróż → Aplikacja internetowa
 *   Wykonaj jako: Ja      Dostęp: Wszyscy
 */

// ─── KONFIGURACJA ────────────────────────────────────────────────────────────
const API_SECRET = 'ZMIEN-MNIE-NA-DLUGI-SEKRET-MIN-32-ZNAKI';
const TZ = 'Europe/Warsaw';

const SHEETS = {
  bookings: 'bookings',
  clients: 'clients',
  staff: 'staff',
  services: 'services',
  permissions: 'permissions',
  syncLog: 'sync_log',
  settings: 'settings',
};

// ─── ROUTER ──────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.secret !== API_SECRET) return fail('UNAUTHORIZED', 'Brak dostępu do bazy.');

    const payload = body.payload || {};
    switch (body.action) {
      case 'getBookings':        return ok(getBookings(payload));
      case 'createBooking':      return ok(createBooking(payload));
      case 'updateBookingStatus':return ok(updateBookingStatus(payload));
      case 'rescheduleBooking':  return ok(rescheduleBooking(payload));
      case 'getServices':        return ok(getServices(payload));
      case 'getStaff':           return ok(getStaff(payload));
      case 'getAvailableSlots':  return ok(getAvailableSlots(payload));
      case 'getClients':         return ok(getClients(payload));
      case 'upsertClient':       return ok(upsertClient(payload));
      case 'getSettings':        return ok(getSettings());
      case 'appendSyncLog':      return ok(appendSyncLog(payload));
      default:                   return fail('VALIDATION_ERROR', 'Nieznana akcja: ' + body.action);
    }
  } catch (err) {
    if (err && err.code) return fail(err.code, err.message);
    return fail('SERVER_ERROR', String(err));
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'BROZONE Sheets API' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── POMOCNICZE ──────────────────────────────────────────────────────────────

function ok(data) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function fail(code, message) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: code, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function boom(code, message) {
  const e = new Error(message);
  e.code = code;
  throw e;
}

function sheet(name) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!s) boom('SHEET_STRUCTURE', 'Brak zakładki: ' + name);
  return s;
}

/** Cały arkusz jako tablica obiektów (klucz = nagłówek kolumny). */
function readAll(name) {
  const values = sheet(name).getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).map(function (row, i) {
    const obj = { _row: i + 2 };
    headers.forEach(function (h, c) { obj[h] = row[c]; });
    return obj;
  });
}

function headersOf(name) {
  return sheet(name).getRange(1, 1, 1, sheet(name).getLastColumn()).getValues()[0].map(String);
}

/** Dopisuje wiersz zgodnie z kolejnością nagłówków. */
function appendRow(name, obj) {
  const headers = headersOf(name);
  sheet(name).appendRow(headers.map(function (h) {
    return obj[h] !== undefined && obj[h] !== null ? obj[h] : '';
  }));
}

/** Aktualizuje wskazane pola w wierszu. */
function patchRow(name, rowIndex, patch) {
  const headers = headersOf(name);
  const sh = sheet(name);
  Object.keys(patch).forEach(function (key) {
    const col = headers.indexOf(key);
    if (col >= 0) sh.getRange(rowIndex, col + 1).setValue(patch[key]);
  });
}

function now() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
}

function toMinutes(hhmm) {
  const parts = String(hhmm).split(':');
  return Number(parts[0]) * 60 + Number(parts[1] || 0);
}

function toClock(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
}

function dateStr(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  return String(v);
}

// ─── REZERWACJE ──────────────────────────────────────────────────────────────

function getBookings(p) {
  const from = p.from || '0000-01-01';
  const to = p.to || '9999-12-31';
  return readAll(SHEETS.bookings).filter(function (b) {
    const d = dateStr(b.date);
    if (d < from || d > to) return false;
    if (p.category && b.category !== p.category) return false;
    if (p.staffId && b.staff_id !== p.staffId) return false;
    if (p.status && b.status !== p.status) return false;
    return true;
  });
}

function nextBookingId(date) {
  const sameDay = readAll(SHEETS.bookings).filter(function (b) { return dateStr(b.date) === date; });
  const n = ('00' + (sameDay.length + 1)).slice(-3);
  return 'BZ-' + date.replace(/-/g, '').replace(/^(\d{4})(\d{4})$/, '$1-$2') + '-' + n;
}

/** Kolizja terminów tego samego pracownika. Statusy odwołane są pomijane. */
function assertNoConflict(staffId, date, startMin, endMin, ignoreBookingId) {
  const clash = readAll(SHEETS.bookings).some(function (b) {
    if (b.staff_id !== staffId) return false;
    if (dateStr(b.date) !== date) return false;
    if (b.status === 'cancelled' || b.status === 'no_show') return false;
    if (ignoreBookingId && b.booking_id === ignoreBookingId) return false;
    const s = toMinutes(b.time_start), e = toMinutes(b.time_end);
    return startMin < e && endMin > s;
  });
  if (clash) boom('BOOKING_CONFLICT', 'Ten termin jest już zajęty. Wybierz inny.');
}

function createBooking(p) {
  if (!p.date || !p.time_start || !p.service_id || !p.staff_id) {
    boom('VALIDATION_ERROR', 'Brakuje daty, godziny, usługi lub specjalisty.');
  }
  if (!p.client_phone) boom('VALIDATION_ERROR', 'Brakuje numeru telefonu.');

  const service = readAll(SHEETS.services).filter(function (s) { return s.service_id === p.service_id; })[0];
  if (!service) boom('NOT_FOUND', 'Nie znaleziono usługi.');

  const startMin = toMinutes(p.time_start);
  const endMin = startMin + Number(service.duration_minutes || 60);
  const date = dateStr(p.date);

  assertNoConflict(p.staff_id, date, startMin, endMin, null);

  const client = upsertClient({
    name: p.client_name,
    phone: p.client_phone,
    email: p.client_email,
    consent_rodo: p.consent_rodo,
    consent_marketing: p.consent_marketing,
    tag: p.category,
  });

  const booking = {
    booking_id: nextBookingId(date),
    date: date,
    time_start: p.time_start,
    time_end: toClock(endMin),
    category: p.category,
    service_id: p.service_id,
    service_name: service.name,
    staff_id: p.staff_id,
    staff_name: p.staff_name || '',
    client_id: client.client_id,
    client_name: p.client_name,
    client_phone: p.client_phone,
    client_email: p.client_email || '',
    price: p.price || service.price_from,
    deposit: p.deposit || 0,
    status: p.status || 'new',
    source: p.source || 'website',
    notes: p.notes || '',
    tattoo_idea: p.tattoo_idea || '',
    tattoo_placement: p.tattoo_placement || '',
    tattoo_size: p.tattoo_size || '',
    tattoo_reference: p.tattoo_reference || '',
    massage_pressure: p.massage_pressure || '',
    massage_focus: p.massage_focus || '',
    massage_contraindications: p.massage_contraindications || '',
    consent_rodo: p.consent_rodo || 'nie',
    consent_marketing: p.consent_marketing || 'nie',
    created_at: now(),
    updated_at: now(),
    sync_status: 'synced',
  };

  appendRow(SHEETS.bookings, booking);
  appendSyncLog({ operation: 'createBooking', entity: 'booking', entityId: booking.booking_id,
                  user: p.user || 'website', result: 'ok', message: '' });
  return booking;
}

function findBooking(bookingId) {
  const row = readAll(SHEETS.bookings).filter(function (b) { return b.booking_id === bookingId; })[0];
  if (!row) boom('NOT_FOUND', 'Nie znaleziono tej wizyty.');
  return row;
}

function assertFresh(row, clientUpdatedAt) {
  if (!clientUpdatedAt) return;
  if (String(row.updated_at) > String(clientUpdatedAt)) {
    boom('STALE_UPDATE', 'Ktoś zmienił tę wizytę przed chwilą.');
  }
}

function updateBookingStatus(p) {
  const allowed = ['new', 'confirmed', 'completed', 'cancelled', 'no_show'];
  if (allowed.indexOf(p.status) < 0) boom('VALIDATION_ERROR', 'Nieznany status.');

  const row = findBooking(p.bookingId);
  assertFresh(row, p.updatedAt);

  const patch = { status: p.status, updated_at: now(), sync_status: 'synced' };
  if (p.note !== undefined) patch.notes = p.note;
  patchRow(SHEETS.bookings, row._row, patch);

  if (p.status === 'completed' || p.status === 'no_show') bumpClientCounters(row.client_id, p.status);

  appendSyncLog({ operation: 'updateBookingStatus', entity: 'booking', entityId: p.bookingId,
                  user: p.user || 'panel', result: 'ok', message: p.status });
  return Object.assign({}, row, patch);
}

function rescheduleBooking(p) {
  const row = findBooking(p.bookingId);
  assertFresh(row, p.updatedAt);

  const duration = toMinutes(row.time_end) - toMinutes(row.time_start);
  const startMin = toMinutes(p.timeStart);
  const date = dateStr(p.date);
  assertNoConflict(row.staff_id, date, startMin, startMin + duration, p.bookingId);

  const patch = { date: date, time_start: p.timeStart, time_end: toClock(startMin + duration),
                  updated_at: now(), sync_status: 'synced' };
  patchRow(SHEETS.bookings, row._row, patch);
  appendSyncLog({ operation: 'rescheduleBooking', entity: 'booking', entityId: p.bookingId,
                  user: p.user || 'panel', result: 'ok', message: date + ' ' + p.timeStart });
  return Object.assign({}, row, patch);
}

// ─── USŁUGI / PRACOWNICY ─────────────────────────────────────────────────────

function getServices(p) {
  return readAll(SHEETS.services).filter(function (s) {
    if (p && p.category && s.category !== p.category) return false;
    if (p && p.activeOnly && String(s.active).toLowerCase() !== 'tak') return false;
    return true;
  });
}

function getStaff(p) {
  return readAll(SHEETS.staff).filter(function (s) {
    if (p && p.category && s.category !== p.category) return false;
    if (p && p.activeOnly && String(s.active).toLowerCase() !== 'tak') return false;
    return true;
  });
}

/** `pn-sb 10:00-20:00; nd wolne` → godziny dla podanego dnia tygodnia. */
function parseWorkingHours(text, weekday) {
  const DAYS = ['pn', 'wt', 'sr', 'czw', 'pt', 'sb', 'nd'];
  const key = DAYS[weekday - 1];
  const parts = String(text || '').split(';');
  for (var i = 0; i < parts.length; i++) {
    const chunk = parts[i].trim().toLowerCase().replace('ś', 's');
    const m = chunk.match(/^([a-z]+)(?:-([a-z]+))?\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (!m) continue;
    const from = DAYS.indexOf(m[1]);
    const to = m[2] ? DAYS.indexOf(m[2]) : from;
    const idx = DAYS.indexOf(key);
    if (from < 0 || idx < 0) continue;
    if (to >= from ? (idx >= from && idx <= to) : (idx >= from || idx <= to)) {
      return { start: m[3], end: m[4] };
    }
  }
  return null;
}

function getAvailableSlots(p) {
  const date = dateStr(p.date);
  const service = getServices({}).filter(function (s) { return s.service_id === p.serviceId; })[0];
  if (!service) boom('NOT_FOUND', 'Nie znaleziono usługi.');
  const duration = Number(service.duration_minutes || 60);

  const staffList = getStaff({ activeOnly: true }).filter(function (s) {
    if (p.staffId) return s.staff_id === p.staffId;
    return s.category === service.category;
  });

  const weekday = (function () {
    const parts = date.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.getDay() === 0 ? 7 : d.getDay();
  })();

  const bookings = getBookings({ from: date, to: date });
  const STEP = 15;
  const result = [];

  staffList.forEach(function (staff) {
    if (String(staff.days_off || '').indexOf(date) >= 0) return;
    const hours = parseWorkingHours(staff.working_hours, weekday);
    if (!hours) return;

    const busy = bookings.filter(function (b) {
      return b.staff_id === staff.staff_id && b.status !== 'cancelled' && b.status !== 'no_show';
    }).map(function (b) { return { from: toMinutes(b.time_start), to: toMinutes(b.time_end) }; });

    for (var t = toMinutes(hours.start); t + duration <= toMinutes(hours.end); t += STEP) {
      const start = t, end = t + duration;
      const taken = busy.some(function (x) { return start < x.to && end > x.from; });
      if (!taken) result.push({ time: toClock(start), staff_id: staff.staff_id, staff_name: staff.name });
    }
  });

  return result;
}

// ─── KLIENCI ─────────────────────────────────────────────────────────────────

function normalizePhone(phone) {
  return String(phone || '').replace(/[^0-9]/g, '').slice(-9);
}

function getClients(p) {
  const q = String((p && p.query) || '').toLowerCase();
  const list = readAll(SHEETS.clients).filter(function (c) {
    if (!q) return true;
    return String(c.name).toLowerCase().indexOf(q) >= 0 ||
           normalizePhone(c.phone).indexOf(normalizePhone(q)) >= 0;
  });
  return p && p.limit ? list.slice(0, p.limit) : list;
}

function upsertClient(p) {
  const phone = normalizePhone(p.phone);
  if (!phone) boom('VALIDATION_ERROR', 'Brakuje numeru telefonu.');

  const existing = readAll(SHEETS.clients).filter(function (c) {
    return normalizePhone(c.phone) === phone;
  })[0];

  if (existing) {
    const patch = { updated_at: now() };
    if (p.name && !existing.name) patch.name = p.name;
    if (p.email && !existing.email) patch.email = p.email;
    if (p.tag && String(existing.tags || '').indexOf(p.tag) < 0) {
      patch.tags = existing.tags ? existing.tags + ',' + p.tag : p.tag;
    }
    patchRow(SHEETS.clients, existing._row, patch);
    return Object.assign({}, existing, patch);
  }

  const all = readAll(SHEETS.clients);
  const client = {
    client_id: 'cli_' + ('00000' + (all.length + 1)).slice(-6),
    name: p.name || '',
    phone: p.phone,
    email: p.email || '',
    tags: p.tag ? p.tag + ',nowy' : 'nowy',
    last_visit: '',
    total_visits: 0,
    no_shows: 0,
    notes: '',
    consent_marketing: p.consent_marketing || 'nie',
    consent_rodo: p.consent_rodo || 'nie',
    created_at: now(),
  };
  appendRow(SHEETS.clients, client);
  return client;
}

function bumpClientCounters(clientId, status) {
  const row = readAll(SHEETS.clients).filter(function (c) { return c.client_id === clientId; })[0];
  if (!row) return;
  if (status === 'completed') {
    patchRow(SHEETS.clients, row._row, {
      total_visits: Number(row.total_visits || 0) + 1,
      last_visit: Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'),
    });
  } else if (status === 'no_show') {
    patchRow(SHEETS.clients, row._row, { no_shows: Number(row.no_shows || 0) + 1 });
  }
}

// ─── USTAWIENIA / LOG ────────────────────────────────────────────────────────

function getSettings() {
  const out = {};
  readAll(SHEETS.settings).forEach(function (r) { out[r.key] = r.value; });
  return out;
}

function appendSyncLog(p) {
  appendRow(SHEETS.syncLog, {
    log_id: 'log_' + new Date().getTime(),
    timestamp: now(),
    operation: p.operation || '',
    entity: p.entity || '',
    entity_id: p.entityId || '',
    user: p.user || '',
    result: p.result || 'ok',
    message: p.message || '',
  });
  return { ok: true };
}
