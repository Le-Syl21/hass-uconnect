/* Uconnect Lovelace vehicle card
 * - Vehicle selector via backend websocket
 * - Visual style inspired by BMW CarData vehicle card
 * - Configurable sections
 */

const WS_TYPE = "uconnect/vehicle_cards";
const CARD_TAG = "uconnect-vehicle-card";
const CACHE_MS = 30_000;

// Card texts, in the language of the Home Assistant user (English fallback)
const STRINGS = {
  en: {
    card_name: "Uconnect Vehicle",
    card_description: "Vehicle card with indicators, SOC/range, image, map and quick info",
    device_id: "Vehicle",
    license_plate: "License plate (shown instead of VIN)",
    show_indicators: "Show the status and command tiles",
    show_trail: "Show the trip trail on the map",
    merge_trunk: "One lock for the doors and the trunk",
    charge_times: "Charging times",
    charge_times_note: "The vehicle's estimates, from {soc} % to a full battery.",
    no_charge_times: "The vehicle gives no charging time estimate yet.",
    car_l1: "Household socket",
    car_l2: "Wallbox",
    car_l3: "Fast charger",
    close: "Close",
    show_range: "Show SOC and range bar",
    show_image: "Show vehicle image",
    show_map: "Show mini map",
    show_buttons: "Show quick info buttons",
    show_actions: "Commands on the tiles",
    select_vehicle: "Select a vehicle in the card editor.",
    vehicle_not_found: "Vehicle not found yet. Try again in a few seconds.",
    no_tracker: "No vehicle tracker entity available",
    tracker_unavailable: "Tracker entity unavailable",
    loading_map: "Loading map\u2026",
    map_failed: "Unable to load map",
    location_unavailable: "Location unavailable",
    home: "Home",
    away: "Away",
    doors_locked: "Doors: Locked",
    doors_unlocked: "Doors: Unlocked",
    windows_closed: "Windows: Closed",
    windows_open: "Windows: {count} open",
    trunk_locked: "Trunk: Locked",
    trunk_unlocked: "Trunk: Unlocked",
    liftgate_locked: "Liftgate: Locked",
    liftgate_unlocked: "Liftgate: Unlocked",
    charging: "Charging",
    plugged_in: "Plugged in",
    not_plugged_in: "Not plugged in",
    not_charging: "Not charging",
    ignition_on: "Ignition: On",
    ignition_off: "Ignition: Off",
    tires: "Tires",
    tire: "Tire {position}",
    tire_fl: "FL",
    tire_fr: "FR",
    tire_rl: "RL",
    tire_rr: "RR",
    warning: "Warning",
    ok: "OK",
    location: "Location",
    range: "Range",
    fuel_range: "Fuel Range",
    battery_12v: "12V Battery",
    odometer: "Odometer",
    lock_doors: "Lock",
    unlock_doors: "Unlock",
    lock_trunk: "Lock trunk",
    unlock_trunk: "Unlock trunk",
    precondition: "Climate",
    hvac: "Climate",
    engine: "Remote start",
    charge_now: "Charge now",
    lights: "Flash lights",
    lights_horn: "Lights and horn",
    refresh_location: "Locate",
    update: "Update",
    confirm_unlock_doors: "Unlock the doors?",
    confirm_unlock_trunk: "Unlock the trunk?",
    confirm_engine: "Start the engine remotely?",
    action_failed: "The command failed: {error}",
    tile_charging: "Charging",
    tile_waiting: "Waiting",
    tile_unplugged: "Unplugged",
    tile_locked: "Locked",
    tile_unlocked: "Unlocked",
    tile_trunk_locked: "Trunk locked",
    tile_trunk_unlocked: "Trunk unlocked",
    tile_liftgate_locked: "Liftgate locked",
    tile_liftgate_unlocked: "Liftgate unlocked",
    tile_windows_closed: "Windows closed",
    tile_windows_open: "Window open",
    tile_running: "On",
    start: "Start",
    stop: "Stop",
    refresh: "Refresh",
    age_now: "just now",
    age_min: "{n} min ago",
    age_hour: "{n} h ago",
    age_day: "{n} d ago",
    position_age: "Position {age}",
    alert_tires: "Check the tire pressure",
    alert_12v: "12 V battery low ({value})",
  },
  fr: {
    card_name: "Véhicule Uconnect",
    card_description: "Carte du véhicule avec indicateurs, batterie/autonomie, image, carte et infos rapides",
    device_id: "Véhicule",
    license_plate: "Plaque d'immatriculation (affichée à la place du VIN)",
    show_indicators: "Afficher les tuiles d'état et de commande",
    show_trail: "Afficher le trajet sur la carte",
    merge_trunk: "Verrouillage unique (portes et coffre)",
    charge_times: "Temps de charge",
    charge_times_note: "Estimations de la voiture, de {soc} % jusqu'à la charge complète.",
    no_charge_times: "La voiture ne donne pas encore d'estimation de temps de charge.",
    car_l1: "Prise domestique",
    car_l2: "Borne",
    car_l3: "Borne rapide",
    close: "Fermer",
    show_range: "Afficher la barre de batterie et d'autonomie",
    show_image: "Afficher l'image du véhicule",
    show_map: "Afficher la mini-carte",
    show_buttons: "Afficher les boutons d'infos rapides",
    show_actions: "Commandes sur les tuiles",
    select_vehicle: "Choisissez un véhicule dans l'éditeur de la carte.",
    vehicle_not_found: "Véhicule pas encore trouvé. Réessayez dans quelques secondes.",
    no_tracker: "Aucune entité de localisation du véhicule",
    tracker_unavailable: "Entité de localisation indisponible",
    loading_map: "Chargement de la carte\u2026",
    map_failed: "Impossible de charger la carte",
    location_unavailable: "Position indisponible",
    home: "Maison",
    away: "Absent",
    doors_locked: "Portes : verrouillées",
    doors_unlocked: "Portes : déverrouillées",
    windows_closed: "Vitres : fermées",
    windows_open: "Vitres : {count} ouverte(s)",
    trunk_locked: "Coffre : verrouillé",
    trunk_unlocked: "Coffre : déverrouillé",
    liftgate_locked: "Hayon : verrouillé",
    liftgate_unlocked: "Hayon : déverrouillé",
    charging: "En charge",
    plugged_in: "Branché",
    not_plugged_in: "Non branché",
    not_charging: "Pas en charge",
    ignition_on: "Contact : mis",
    ignition_off: "Contact : coupé",
    tires: "Pneus",
    tire: "Pneu {position}",
    tire_fl: "AVG",
    tire_fr: "AVD",
    tire_rl: "ARG",
    tire_rr: "ARD",
    warning: "Alerte",
    ok: "OK",
    location: "Position",
    range: "Autonomie",
    fuel_range: "Autonomie carburant",
    battery_12v: "Batterie 12 V",
    odometer: "Kilométrage",
    lock_doors: "Verrouiller",
    unlock_doors: "Déverrouiller",
    lock_trunk: "Verrouiller le coffre",
    unlock_trunk: "Déverrouiller le coffre",
    precondition: "Climatisation",
    hvac: "Climatisation",
    engine: "Démarrage à distance",
    charge_now: "Charger maintenant",
    lights: "Clignotants",
    lights_horn: "Feux et klaxon",
    refresh_location: "Localiser",
    update: "Actualiser",
    confirm_unlock_doors: "Déverrouiller les portes ?",
    confirm_unlock_trunk: "Déverrouiller le coffre ?",
    confirm_engine: "Démarrer le moteur à distance ?",
    action_failed: "La commande a échoué : {error}",
    tile_charging: "En charge",
    tile_waiting: "En attente",
    tile_unplugged: "Débranchée",
    tile_locked: "Verrouillée",
    tile_unlocked: "Déverrouillée",
    tile_trunk_locked: "Coffre verrouillé",
    tile_trunk_unlocked: "Coffre déverrouillé",
    tile_liftgate_locked: "Hayon verrouillé",
    tile_liftgate_unlocked: "Hayon déverrouillé",
    tile_windows_closed: "Vitres fermées",
    tile_windows_open: "Vitre ouverte",
    tile_running: "En marche",
    start: "Démarrer",
    stop: "Arrêter",
    refresh: "Actualiser",
    age_now: "à l'instant",
    age_min: "il y a {n} min",
    age_hour: "il y a {n} h",
    age_day: "il y a {n} j",
    position_age: "Position {age}",
    alert_tires: "Vérifier la pression des pneus",
    alert_12v: "Batterie 12 V faible ({value})",
  },
};

// The editor and the card picker have no hass object, Home Assistant sets
// the lang attribute of the page to the language of the user
const userLanguage = (hass) =>
  hass?.locale?.language || hass?.language || document.documentElement.lang || navigator.language || "en";

const translate = (hass, key, vars = {}) => {
  const language = String(userLanguage(hass)).toLowerCase();
  const strings = STRINGS[language] || STRINGS[language.split("-")[0]] || STRINGS.en;
  const text = strings[key] ?? STRINGS.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
};

const ensureCustomCardsArray = () => {
  window.customCards = window.customCards || [];
  return window.customCards;
};

const boolConfig = (cfg, key, fallback) => {
  const raw = cfg?.[key];
  return typeof raw === "boolean" ? raw : fallback;
};

const normalizeState = (stateObj) => {
  const raw = stateObj?.state;
  if (raw === undefined || raw === null) return "";
  if (raw === "unknown" || raw === "unavailable") return "";
  return String(raw).trim().toLowerCase();
};

const formatState = (stateObj, hass) => {
  if (!stateObj) return "\u2014";
  const state = stateObj.state;
  if (state === "unknown" || state === "unavailable") return "\u2014";
  const unit = stateObj.attributes?.unit_of_measurement;
  const num = Number(state);
  if (Number.isFinite(num)) {
    const entityId = stateObj.entity_id;
    const precision = hass?.entities?.[entityId]?.display_precision;
    if (precision !== undefined && precision !== null) {
      const formatted = num.toFixed(precision);
      return unit ? `${formatted} ${unit}` : `${formatted}`;
    }
  }
  return unit ? `${state} ${unit}` : `${state}`;
};

const toNumberOrZero = (stateObj) => {
  const state = normalizeState(stateObj);
  if (!state) return 0;
  const parsed = Number(state);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const isOnState = (stateObj) => {
  const state = normalizeState(stateObj);
  if (!state) return false;
  return state === "on" || state === "true" || state.includes("active");
};

const hasUsableState = (stateObj) => normalizeState(stateObj) !== "";

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");

const escapeHtml = (input) =>
  String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const humanizeLocationState = (stateObj, hass) => {
  const rawState = stateObj?.state;
  if (rawState === undefined || rawState === null) return translate(hass, "location_unavailable");
  const normalized = String(rawState).trim().toLowerCase();
  if (!normalized || normalized === "unknown" || normalized === "unavailable") return translate(hass, "location_unavailable");
  // Translated by Home Assistant itself (home, away, zone names)
  if (typeof hass?.formatEntityState === "function") return hass.formatEntityState(stateObj);
  if (normalized === "not_home") return translate(hass, "away");
  if (normalized === "home") return translate(hass, "home");
  return String(rawState).replaceAll("_", " ");
};

const sanitizePlate = (raw) => {
  if (typeof raw !== "string") return "";
  return raw.trim().replace(/[^\p{L}\p{N}\s-]/gu, "").substring(0, 15).toUpperCase();
};

// A press longer than this opens the entity's dialog instead of acting
const HOLD_MS = 500;

// How long a command's result stays on its tile
const FEEDBACK_MS = { done: 2500, failed: 4000 };

// How long a switch without state (preconditioning on some vehicles) is shown
// on after the card turned it on
const ASSUMED_ON_MS = 30 * 60 * 1000;

const formatDuration = (minutes) => {
  const m = Math.max(1, Math.round(minutes));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
};

// Below this the 12 V battery gets a warning (volts)
const LOW_12V = 11.8;

// "3 min ago", "2 h ago" for an ISO timestamp state
const formatAge = (hass, stateObj) => {
  const time = Date.parse(stateObj?.state ?? "");
  if (!Number.isFinite(time)) return "";
  const minutes = Math.max(0, Math.round((Date.now() - time) / 60000));
  if (minutes < 1) return translate(hass, "age_now");
  if (minutes < 60) return translate(hass, "age_min", { n: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 48) return translate(hass, "age_hour", { n: hours });
  return translate(hass, "age_day", { n: Math.round(hours / 24) });
};

class UconnectVehicleCard extends HTMLElement {
  setConfig(config) {
    const cfg = config || {};
    this._config = cfg.license_plate
      ? { ...cfg, license_plate: sanitizePlate(cfg.license_plate) }
      : cfg;
    this._initialized = false;
    this._vehicles = null;
    this._vehiclesFetchedAt = 0;
    this._fetchInFlight = null;
  }

  getCardSize() {
    const cfg = this._config || {};
    let size = 5;
    if (boolConfig(cfg, "show_image", true)) size += 2;
    if (boolConfig(cfg, "show_map", true)) size += 2;
    if (boolConfig(cfg, "show_buttons", false)) size += 2;
    if (boolConfig(cfg, "show_indicators", true)) size += 2;
    return size;
  }

  static getConfigForm() {
    return {
      schema: [
        {
          name: "device_id",
          required: true,
          selector: { device: { integration: "uconnect" } },
        },
        { name: "license_plate", selector: { text: {} } },
        { name: "show_indicators", selector: { boolean: {} } },
        { name: "show_range", selector: { boolean: {} } },
        { name: "show_image", selector: { boolean: {} } },
        { name: "show_map", selector: { boolean: {} } },
        { name: "show_buttons", selector: { boolean: {} } },
        { name: "show_actions", selector: { boolean: {} } },
        { name: "merge_trunk", selector: { boolean: {} } },
        { name: "show_trail", selector: { boolean: {} } },
      ],
      computeLabel: (schema) =>
        STRINGS.en[schema.name] !== undefined ? translate(null, schema.name) : undefined,
    };
  }

  static getStubConfig() {
    return {
      show_indicators: true,
      show_range: true,
      show_image: true,
      show_map: true,
      show_buttons: false,
      show_actions: true,
      merge_trunk: false,
      show_trail: false,
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;

    if (!this._initialized) {
      this._initialized = true;
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; }
          ha-card {
            background: linear-gradient(
              180deg,
              color-mix(in srgb, var(--card-background-color) 90%, transparent),
              color-mix(in srgb, var(--card-background-color) 72%, transparent)
            );
            border: 0;
            box-shadow: none;
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
          }
          .card-header {
            font-size: 22px;
            font-weight: 700;
            line-height: 1.15;
            color: var(--primary-text-color);
            margin: 0 0 12px;
          }
          .vin {
            margin-top: 2px;
            font-size: 12px;
            color: var(--secondary-text-color);
          }
          #main-wrapper {
            display: grid;
            gap: 12px;
          }
          .box {
            border: 0;
            border-radius: var(--ha-card-border-radius, 12px);
            background: color-mix(in srgb, var(--card-background-color) 62%, transparent);
            padding: 10px;
          }

          .range-box {
            display: grid;
            gap: 8px;
          }
          .range-top {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .bar-wrap {
            position: relative;
            border-radius: 8px;
            height: 18px;
            flex: 1 1 auto;
            background: color-mix(in srgb, var(--secondary-background-color, #90909040) 66%, transparent);
            overflow: hidden;
            cursor: pointer;
          }
          .bar-level {
            position: relative;
            height: 100%;
            background: var(--primary-color);
            transition: width 0.2s ease;
            overflow: hidden;
          }
          .bar-wrap.charging .bar-level {
            animation: chargingBarPulse 1.8s ease-in-out infinite;
          }
          .bar-wrap.charging .bar-level::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              110deg,
              transparent 10%,
              color-mix(in srgb, var(--primary-color) 45%, white) 45%,
              transparent 80%
            );
            transform: translateX(-120%);
            animation: chargingSweep 2.3s linear infinite;
            pointer-events: none;
          }
          .energy-text {
            position: absolute;
            left: 8px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-primary-color, #fff);
            font-size: 12px;
            font-weight: 600;
            text-shadow: 0 1px 2px rgb(0 0 0 / 35%);
          }
          .range-value {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--primary-text-color);
            font-size: 14px;
            white-space: nowrap;
            cursor: pointer;
          }

          .image {
            width: 100%;
            border-radius: 10px;
            overflow: hidden;
            border: 0;
            background: transparent;
          }
          .image img {
            width: 100%;
            display: block;
            object-fit: cover;
            object-position: center;
            background: transparent;
            transform-origin: center center;
          }
          .image.charging img {
            animation: chargingImagePulse 2.2s ease-in-out infinite;
          }

          .map {
            border-radius: 10px;
            overflow: hidden;
            border: 0;
            background: color-mix(in srgb, var(--secondary-background-color, #90909040) 56%, transparent);
          }
          .map hui-map-card {
            display: block;
            width: 100%;
            height: 120px;
          }
          .map-mount {
            height: 120px;
            overflow: hidden;
          }
          .map-mount > * {
            height: 100%;
          }
          .map-fallback {
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--secondary-text-color);
            font-size: 13px;
          }

          .buttons-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .btn-item {
            appearance: none;
            cursor: pointer;
            border: 0;
            border-radius: 10px;
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            background: color-mix(in srgb, var(--secondary-background-color, #90909040) 52%, transparent);
            text-align: left;
            transition: background 0.2s ease;
          }
          .btn-item:hover {
            background: color-mix(in srgb, var(--secondary-background-color, #90909040) 74%, transparent);
          }
          .btn-item.alert .btn-icon {
            color: var(--error-color);
          }
          .btn-item.alert .btn-value {
            color: var(--error-color);
          }
          .btn-icon {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            border: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--secondary-text-color);
            flex: 0 0 auto;
            background: color-mix(in srgb, var(--card-background-color) 50%, transparent);
          }
          .btn-text {
            min-width: 0;
          }
          .btn-title {
            font-size: 12px;
            color: var(--secondary-text-color);
          }
          .btn-value {
            font-size: 14px;
            color: var(--primary-text-color);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .tiles {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
          }
          .tile {
            --tone: var(--secondary-text-color);
            appearance: none;
            cursor: pointer;
            border: 0;
            border-radius: 14px;
            padding: 10px 4px 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            min-width: 0;
            background: color-mix(in srgb, var(--tone) 16%, var(--secondary-background-color, #80808033));
            color: var(--primary-text-color);
            font: inherit;
            text-align: center;
            transition: background 0.25s ease, transform 0.1s ease;
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
          }
          .tile:active { transform: scale(0.96); }
          .tile ha-icon { color: var(--tone); --mdc-icon-size: 28px; }
          .tile.ok { --tone: var(--success-color, #43a047); }
          .tile.bad { --tone: var(--error-color, #db4437); }
          .tile.warn { --tone: var(--warning-color, #ffa600); }
          .tile.idle { --tone: var(--secondary-text-color); background: var(--secondary-background-color, #80808033); }
          .tile.ok, .tile.bad, .tile.warn { background: color-mix(in srgb, var(--tone) 24%, transparent); }
          .tile.live ha-icon { animation: chargingBadgePulse 1.4s ease-in-out infinite; }
          .tile.pending { --tone: var(--warning-color, #ffa600); animation: tilePending 1s ease-in-out infinite; pointer-events: none; }
          .tile.done { --tone: var(--success-color, #43a047); background: color-mix(in srgb, var(--tone) 40%, transparent); }
          .tile.failed { --tone: var(--error-color, #db4437); background: color-mix(in srgb, var(--tone) 40%, transparent); }
          .tile[disabled] { opacity: 0.4; cursor: default; }
          .tile-label {
            font-size: 13px;
            font-weight: 600;
            line-height: 1.15;
          }
          .tile-sub {
            font-size: 11px;
            line-height: 1.15;
            color: var(--secondary-text-color);
            min-height: 1.15em;
          }
          .alert-row {
            appearance: none;
            cursor: pointer;
            border: 0;
            border-radius: 12px;
            width: 100%;
            padding: 10px 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            font: inherit;
            font-size: 14px;
            color: var(--primary-text-color);
            background: color-mix(in srgb, var(--warning-color, #ffa600) 26%, transparent);
          }
          .alert-row ha-icon { color: var(--warning-color, #ffa600); }
          #alerts { display: grid; gap: 8px; }
          #alerts:empty { display: none; }
          .panel {
            position: fixed;
            inset: 0;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: rgb(0 0 0 / 55%);
          }
          .panel-box {
            width: min(440px, 100%);
            max-height: 90vh;
            overflow: auto;
            border-radius: 16px;
            padding: 16px;
            background: var(--card-background-color, #1c1c1c);
            color: var(--primary-text-color);
            box-shadow: 0 8px 32px rgb(0 0 0 / 40%);
          }
          .panel-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
          .panel-title span { font-size: 14px; font-weight: 400; color: var(--secondary-text-color); }
          .panel-box table { width: 100%; border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; }
          .panel-box th { text-align: left; font-size: 12px; font-weight: 500; color: var(--secondary-text-color); padding: 4px 0; }
          .panel-box td { padding: 6px 0; border-top: 1px solid var(--divider-color, #8884); }
          .panel-box td:last-child, .panel-box th:last-child { text-align: right; white-space: nowrap; font-weight: 600; }
          .panel-note { margin-top: 8px; font-size: 12px; color: var(--secondary-text-color); }
          .panel-close {
            appearance: none; border: 0; cursor: pointer; font: inherit;
            margin-top: 14px; width: 100%; padding: 10px; border-radius: 10px;
            background: var(--secondary-background-color, #80808033); color: var(--primary-text-color);
          }
          .map-age {
            margin-top: 4px;
            font-size: 12px;
            color: var(--secondary-text-color);
          }

          @media (max-width: 520px) {
            .buttons-grid {
              grid-template-columns: 1fr;
            }
          }

          @keyframes tilePending {
            0%, 100% { background: color-mix(in srgb, var(--tone) 14%, transparent); }
            50% { background: color-mix(in srgb, var(--tone) 38%, transparent); }
          }

          @keyframes chargingBadgePulse {
            0% { filter: brightness(1); }
            50% { filter: brightness(1.45); }
            100% { filter: brightness(1); }
          }

          @keyframes chargingBarPulse {
            0% { filter: brightness(1); }
            50% { filter: brightness(1.18); }
            100% { filter: brightness(1); }
          }

          @keyframes chargingSweep {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(120%); }
          }

          @keyframes chargingImagePulse {
            0% { filter: brightness(1) saturate(1); }
            50% { filter: brightness(1.08) saturate(1.1); }
            100% { filter: brightness(1) saturate(1); }
          }
        </style>
        <ha-card>
          <div class="card-content">
            <div class="card-header" id="name"></div>
            <div class="vin" id="vin"></div>
            <main id="main-wrapper">
              <div id="indicators"></div>
              <div id="alerts"></div>
              <div id="images"></div>
              <div id="range_info"></div>
              <div id="mini_map"></div>
              <div id="buttons"></div>
            </main>
            <div id="panel"></div>
          </div>
        </ha-card>
      `;
      this._bindInteractions();
    }

    this._maybeFetchVehicles();
    this._render();
  }

  _maybeFetchVehicles() {
    const hass = this._hass;
    if (!hass || typeof hass.callWS !== "function") return;

    const now = Date.now();
    if (this._vehicles && now - this._vehiclesFetchedAt < CACHE_MS) return;
    if (this._fetchInFlight) return;

    this._fetchInFlight = hass
      .callWS({ type: WS_TYPE })
      .then((payload) => {
        this._vehicles = Array.isArray(payload?.vehicles) ? payload.vehicles : [];
        this._vehiclesFetchedAt = Date.now();
      })
      .catch(() => {})
      .finally(() => {
        this._fetchInFlight = null;
        this._render();
      });
  }

  _bindInteractions() {
    if (!this.shadowRoot || this._interactionsBound) return;
    this._interactionsBound = true;
    // A tap on a tile runs its command, a long press opens the entity's
    // dialog (history, attributes), like Home Assistant's button card.
    // Elements without a command open the dialog either way.
    const root = this.shadowRoot;
    const entityTarget = (event) => {
      const node = event.target;
      return node instanceof Element ? node.closest("[data-entity-id]") : null;
    };
    root.addEventListener("pointerdown", (event) => {
      const target = entityTarget(event);
      if (!target || event.button !== 0) return;
      clearTimeout(this._holdTimer);
      this._held = false;
      this._holdTimer = setTimeout(() => {
        this._held = true;
        this._haptic("medium");
        this._openMoreInfo(target.getAttribute("data-entity-id"));
      }, HOLD_MS);
    });
    const cancelHold = () => clearTimeout(this._holdTimer);
    root.addEventListener("pointerup", cancelHold);
    root.addEventListener("pointercancel", cancelHold);
    root.addEventListener("pointerleave", cancelHold, true);
    root.addEventListener("contextmenu", (event) => {
      if (entityTarget(event)) event.preventDefault();
    });
    root.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("[data-close-panel]")) {
        if (event.target.closest(".panel-box") && !event.target.closest("button[data-close-panel]")) return;
        this._openPanel(null);
        return;
      }
      const target = entityTarget(event);
      if (!target) return;
      if (this._held) {
        this._held = false;
        return;
      }
      const entityId = target.getAttribute("data-entity-id");
      if (!entityId) return;
      const steps = target.getAttribute("data-steps");
      const panel = target.getAttribute("data-panel");
      if (steps) this._runSteps(target, entityId, JSON.parse(steps));
      else if (panel) this._openPanel(panel);
      else this._openMoreInfo(entityId);
    });
  }

  _haptic(kind) {
    this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: kind }));
  }

  _openPanel(name) {
    this._panel = name;
    this._render();
  }

  _renderChargePanel(hass, socValue, read) {
    // The vehicle's own estimates: the integration can't tell the battery
    // capacity or the charging power limits of a vehicle
    const rows = [["car_l1", "time_to_charge_l1"], ["car_l2", "time_to_charge_l2"], ["car_l3", "time_to_charge_l3"]]
      .map(([label, key]) => [label, toNumberOrZero(read(key))])
      .filter(([, minutes]) => minutes > 0)
      .map(([label, minutes]) => `<tr><td>${escapeHtml(translate(hass, label))}</td><td>${formatDuration(minutes)}</td></tr>`)
      .join("");
    return `
      <div class="panel" data-close-panel>
        <div class="panel-box">
          <div class="panel-title">${escapeHtml(translate(hass, "charge_times"))}</div>
          ${rows
            ? `<table>${rows}</table>
               <div class="panel-note">${escapeHtml(translate(hass, "charge_times_note", { soc: Math.round(socValue) }))}</div>`
            : `<div class="panel-note">${escapeHtml(translate(hass, "no_charge_times"))}</div>`}
          <button class="panel-close" data-close-panel>${escapeHtml(translate(hass, "close"))}</button>
        </div>
      </div>`;
  }

  _setFeedback(entityId, state) {
    this._feedback = this._feedback || {};
    const duration = FEEDBACK_MS[state];
    this._feedback[entityId] = { state, until: duration ? Date.now() + duration : Infinity };
    this._render();
    if (duration) setTimeout(() => this._render(), duration + 50);
  }

  async _runSteps(button, entityId, steps) {
    const hass = this._hass;
    if (!hass || this._feedback?.[entityId]?.state === "pending") return;
    const confirmKey = button.getAttribute("data-confirm");
    if (confirmKey && !window.confirm(translate(hass, confirmKey))) return;
    const assume = button.getAttribute("data-assume");
    this._haptic("light");
    this._setFeedback(entityId, "pending");
    try {
      // One after the other: the vehicle takes one remote command at a time
      for (const { action, entity } of steps) {
        const [domain, service] = action.split(".");
        await hass.callService(domain, service, { entity_id: entity });
      }
      if (assume) {
        this._assumed = this._assumed || {};
        this._assumed[entityId] = { until: assume === "on" ? Date.now() + ASSUMED_ON_MS : 0 };
      }
      this._haptic("success");
      this._setFeedback(entityId, "done");
    } catch (err) {
      this._haptic("failure");
      this._setFeedback(entityId, "failed");
      button.title = translate(hass, "action_failed", { error: err?.message || String(err) });
    }
  }

  _openMoreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      })
    );
  }

  async _createMapCard(hass, trackerEntityId, trail) {
    try {
      if (!window.loadCardHelpers) return null;
      const helpers = await window.loadCardHelpers();
      if (!helpers?.createCardElement) return null;
      const mapCard = helpers.createCardElement({
        type: "map",
        entities: [trackerEntityId],
        default_zoom: 14,
        // The trip trail draws a line to the car, off unless asked for
        hours_to_show: trail ? 24 : 0,
        aspect_ratio: "16:6",
      });
      mapCard.hass = hass;
      return mapCard;
    } catch {
      return null;
    }
  }

  _renderMap(target, hass, trackerEntityId, trail = false, age = "") {
    const mapKey = `${trackerEntityId}|${trail}`;
    if (!target) return;

    if (!trackerEntityId) {
      this._cachedMapCard = null;
      this._cachedMapTracker = null;
      target.innerHTML = `
        <div class="map">
          <div class="map-fallback">${escapeHtml(translate(hass, "no_tracker"))}</div>
        </div>
      `;
      return;
    }

    if (!hass?.states?.[trackerEntityId]) {
      this._cachedMapCard = null;
      this._cachedMapTracker = null;
      target.innerHTML = `
        <div class="map">
          <div class="map-fallback">${escapeHtml(translate(hass, "tracker_unavailable"))}</div>
        </div>
      `;
      return;
    }

    if (this._cachedMapCard && this._cachedMapTracker === mapKey) {
      this._cachedMapCard.hass = hass;
      if (this._mapAgeEl) this._mapAgeEl.textContent = age ? translate(hass, "position_age", { age }) : "";
      return;
    }

    this._cachedMapCard = null;
    this._cachedMapTracker = null;

    const renderToken = (this._mapRenderToken || 0) + 1;
    this._mapRenderToken = renderToken;

    const wrapper = document.createElement("div");
    wrapper.className = "map";
    const mapMount = document.createElement("div");
    mapMount.className = "map-mount";
    mapMount.innerHTML = `<div class="map-fallback">${escapeHtml(translate(hass, "loading_map"))}</div>`;
    wrapper.appendChild(mapMount);
    const ageEl = document.createElement("div");
    ageEl.className = "map-age";
    ageEl.textContent = age ? translate(hass, "position_age", { age }) : "";
    this._mapAgeEl = ageEl;
    target.replaceChildren(wrapper, ageEl);

    this._createMapCard(hass, trackerEntityId, trail).then((mapCard) => {
      if (!target.isConnected) return;
      if (this._mapRenderToken !== renderToken) return;
      if (!mapCard) {
        mapMount.innerHTML = `<div class="map-fallback">${escapeHtml(translate(hass, "map_failed"))}</div>`;
        return;
      }
      this._cachedMapCard = mapCard;
      this._cachedMapTracker = mapKey;
      mapMount.replaceChildren(mapCard);
    });
  }

  _setHtml(el, html) {
    if (el && el.innerHTML !== html) el.innerHTML = html;
  }

  _render() {
    if (!this.shadowRoot) return;

    const hass = this._hass;
    const cfg = this._config || {};
    const deviceId = cfg.device_id;

    if (!deviceId) {
      this._renderMessage(translate(hass, "select_vehicle"));
      return;
    }

    const vehicles = this._vehicles || [];
    const vehicle = vehicles.find((v) => v && v.device_id === deviceId);
    if (!vehicle) {
      this._renderMessage(translate(hass, "vehicle_not_found"));
      return;
    }

    const nameEl = this.shadowRoot.getElementById("name");
    const vinEl = this.shadowRoot.getElementById("vin");
    const indicatorsEl = this.shadowRoot.getElementById("indicators");
    const rangeEl = this.shadowRoot.getElementById("range_info");
    const imageEl = this.shadowRoot.getElementById("images");
    const mapEl = this.shadowRoot.getElementById("mini_map");
    const buttonsEl = this.shadowRoot.getElementById("buttons");
    const alertsEl = this.shadowRoot.getElementById("alerts");

    const vin = vehicle.vin || "";
    const name = vehicle.name || vin || "Uconnect";
    const entities = vehicle.entities || {};

    const read = (key) => hass?.states?.[entities[key]];

    nameEl.textContent = name;
    const odometerText = hasUsableState(read("odometer")) ? formatState(read("odometer"), hass) : "";
    vinEl.textContent = [cfg.license_plate || vin, odometerText].filter(Boolean).join(" \u00b7 ");
    const dataAge = formatAge(hass, read("timestamp_status"));

    const showIndicators = boolConfig(cfg, "show_indicators", true);
    const showRange = boolConfig(cfg, "show_range", true);
    const showImage = boolConfig(cfg, "show_image", true);
    const showMap = boolConfig(cfg, "show_map", true);
    const showButtons = boolConfig(cfg, "show_buttons", false);

    // Uconnect binary sensors use postprocess inversion:
    //   off = locked/closed (secure), on = unlocked/open (not secure)
    // Sensors without a usable state (e.g. rear doors of a two-door car, which
    // the vehicle reports as not available) are left out.
    const secureStates = (keys) => keys
      .map((key) => read(key))
      .filter((s) => hasUsableState(s))
      .map((s) => !isOnState(s));

    const doorStates = secureStates(["door_driver", "door_passenger", "door_rear_left", "door_rear_right"]);
    const allDoorsLocked = doorStates.length > 0 && doorStates.every(Boolean);
    const anyDoorEntity = entities.door_driver || entities.door_passenger || "";

    const windowStates = secureStates(["window_driver", "window_passenger", "window_rear_left", "window_rear_right", "sunroof"]);
    const allWindowsClosed = windowStates.length > 0 && windowStates.every(Boolean);
    const openWindows = windowStates.filter((closed) => !closed).length;
    const windowEntity = entities.window_driver || entities.window_passenger || "";

    // Vehicles have either a trunk or a liftgate
    const trunkKey = entities.trunk ? "trunk" : "liftgate";
    const trunkLocked = hasUsableState(read(trunkKey)) && !isOnState(read(trunkKey));
    const trunkEntity = entities[trunkKey] || "";

    const chargingActive = isOnState(read("charging"));
    const pluggedIn = isOnState(read("plugged_in"));
    const chargingEntity = entities.charging || entities.plugged_in || "";

    const ignitionOn = isOnState(read("ignition")) || isOnState(read("ev_running"));
    const ignitionEntity = entities.ignition || entities.ev_running || "";

    const hasSoc = Boolean(entities.soc && hasUsableState(read("soc")));
    const hasFuel = Boolean(entities.fuel && hasUsableState(read("fuel")));
    const hasRange = Boolean(entities.range && hasUsableState(read("range")));
    const hasRangeTotal = Boolean(entities.range_total && hasUsableState(read("range_total")));

    const socValue = clamp(toNumberOrZero(read("soc")), 0, 100);
    const fuelValue = clamp(toNumberOrZero(read("fuel")), 0, 100);

    const primaryLevelValue = hasSoc ? socValue : hasFuel ? fuelValue : 0;
    const primaryLevelLabel = hasSoc ? `${Math.round(socValue)}%` : hasFuel ? `${Math.round(fuelValue)}%` : "\u2014";
    const primaryLevelEntity = hasSoc ? (entities.soc || "") : hasFuel ? (entities.fuel || "") : "";
    const primaryLevelHasBar = hasSoc || hasFuel;

    const rangeState = hasRange ? read("range") : hasRangeTotal ? read("range_total") : null;
    const rangeEntity = hasRange ? (entities.range || "") : hasRangeTotal ? (entities.range_total || "") : "";
    const rangeText = rangeState ? formatState(rangeState, hass) : "\u2014";
    const rangeIcon = hasSoc ? "mdi:arrow-left-right" : "mdi:gas-station";

    // Status and command tiles: green when secure or running, red when it
    // needs attention, orange for a warning. A tap runs the tile's command,
    // a long press opens the entity's dialog.
    if (showIndicators) {
      const commands = boolConfig(cfg, "show_actions", true);
      const has = (key) => Boolean(entities[key]);
      const step = (action, key) => ({ action, entity: entities[key] });
      const tiles = [];

      // Charge: unplugged, plugged in but waiting (a tap starts it), charging
      if (entities.plugged_in || entities.charging) {
        const socText = hasSoc ? `${Math.round(socValue)} %` : "";
        if (chargingActive) {
          const rate = toNumberOrZero(read("charging_rate"));
          tiles.push({
            entity: chargingEntity, tone: "ok live", icon: "mdi:ev-station",
            label: translate(hass, "tile_charging"), panel: "charge",
            sub: [socText, rate > 0 ? formatState(read("charging_rate"), hass) : ""].filter(Boolean).join(" · "),
          });
        } else if (pluggedIn) {
          const canCharge = commands && has("charge_now");
          tiles.push({
            entity: chargingEntity, tone: "bad", icon: "mdi:ev-station",
            label: translate(hass, "tile_waiting"),
            sub: canCharge ? translate(hass, "charge_now") : socText,
            steps: canCharge ? [step("button.press", "charge_now")] : null,
          });
        } else {
          tiles.push({
            entity: chargingEntity, tone: "idle", icon: "mdi:power-plug-off-outline",
            label: translate(hass, "tile_unplugged"), sub: socText, panel: "charge",
          });
        }
      }

      // Doors, and the trunk with them when the card merges the two
      const doorsKnown = has("lock_doors") ? hasUsableState(read("lock_doors")) : doorStates.length > 0;
      const doorsLocked = has("lock_doors") ? read("lock_doors")?.state === "locked" : allDoorsLocked;
      const trunkKnown = has("trunk_lock") ? hasUsableState(read("trunk_lock")) : hasUsableState(read(trunkKey));
      const trunkIsLocked = has("trunk_lock") ? isOnState(read("trunk_lock")) : trunkLocked;
      const canLockDoors = commands && has("lock_doors");
      const canLockTrunk = commands && has("trunk_lock");
      const mergeTrunk = boolConfig(cfg, "merge_trunk", false) && trunkKnown;

      if (doorsKnown) {
        const locked = doorsLocked && (!mergeTrunk || trunkIsLocked);
        const steps = [];
        if (locked) {
          if (canLockDoors) steps.push(step("lock.unlock", "lock_doors"));
          if (mergeTrunk && canLockTrunk) steps.push(step("switch.turn_off", "trunk_lock"));
        } else {
          if (canLockDoors && !doorsLocked) steps.push(step("lock.lock", "lock_doors"));
          if (mergeTrunk && canLockTrunk && !trunkIsLocked) steps.push(step("switch.turn_on", "trunk_lock"));
        }
        tiles.push({
          entity: entities.lock_doors || anyDoorEntity,
          tone: locked ? "ok" : "bad",
          icon: locked ? "mdi:lock" : "mdi:lock-open-variant",
          label: translate(hass, locked ? "tile_locked" : "tile_unlocked"),
          sub: steps.length ? translate(hass, locked ? "unlock_doors" : "lock_doors") : "",
          steps: steps.length ? steps : null,
          confirm: locked ? "confirm_unlock_doors" : "",
        });
      }

      if (trunkKnown && !mergeTrunk) {
        tiles.push({
          entity: entities.trunk_lock || trunkEntity,
          tone: trunkIsLocked ? "ok" : "bad",
          icon: trunkIsLocked ? "mdi:car-back" : "mdi:car-back",
          label: translate(hass, `tile_${trunkKey}_${trunkIsLocked ? "locked" : "unlocked"}`),
          sub: canLockTrunk ? translate(hass, trunkIsLocked ? "unlock_doors" : "lock_doors") : "",
          steps: canLockTrunk ? [step(trunkIsLocked ? "switch.turn_off" : "switch.turn_on", "trunk_lock")] : null,
          confirm: trunkIsLocked ? "confirm_unlock_trunk" : "",
        });
      }

      if (windowStates.length > 0) {
        tiles.push({
          entity: windowEntity,
          tone: allWindowsClosed ? "ok" : "warn",
          icon: allWindowsClosed ? "mdi:car-door" : "mdi:window-open-variant",
          label: translate(hass, allWindowsClosed ? "tile_windows_closed" : "tile_windows_open"),
          sub: allWindowsClosed ? "" : String(openWindows),
        });
      }

      // Switches. Preconditioning reports no state on some vehicles: the card
      // then shows what it last asked, for as long as the car keeps it on.
      const switchTile = (key, icon, labelKey, confirmOn = "") => {
        if (!commands || !has(key)) return;
        const known = hasUsableState(read(key));
        const assumed = this._assumed?.[entities[key]];
        const on = known ? isOnState(read(key)) : Boolean(assumed && assumed.until > Date.now());
        tiles.push({
          entity: entities[key],
          tone: on ? "ok live" : "idle",
          icon,
          label: translate(hass, labelKey),
          sub: translate(hass, on ? "stop" : "start"),
          steps: [step(on ? "switch.turn_off" : "switch.turn_on", key)],
          confirm: on ? "" : confirmOn,
          assume: known ? null : !on,
        });
      };
      switchTile("precondition", "mdi:fan", "precondition");
      switchTile("hvac", "mdi:fan", "hvac");
      switchTile("engine", "mdi:engine", "engine", "confirm_engine");

      // One-shot commands
      const pressTile = (key, icon, labelKey, sub = "") => {
        if (!commands || !has(key)) return;
        tiles.push({ entity: entities[key], tone: "idle", icon, label: translate(hass, labelKey), sub, steps: [step("button.press", key)] });
      };
      pressTile("lights", "mdi:car-light-high", "lights");
      pressTile("lights_horn", "mdi:bullhorn", "lights_horn");
      pressTile("refresh_location", "mdi:crosshairs-gps", "refresh_location");
      // Refresh wakes the car up so it sends fresh data; reading the cloud
      // again is what the integration's polling already does
      pressTile(has("deep_refresh") ? "deep_refresh" : "update", "mdi:refresh", "refresh", dataAge);

      const feedback = this._feedback || {};
      this._setHtml(indicatorsEl, tiles.length === 0 ? "" : `
        <div class="tiles">
          ${tiles
            .map((tile) => {
              const fb = feedback[tile.entity]?.until > Date.now() ? feedback[tile.entity].state : "";
              const icon = fb === "done" ? "mdi:check-bold" : fb === "failed" ? "mdi:close-thick" : tile.icon;
              return `
            <button class="tile ${tile.tone}${fb ? ` ${fb}` : ""}"${tile.entity && hass.states[tile.entity]?.state === "unavailable" && tile.steps ? " disabled" : ""}
              data-entity-id="${escapeHtml(tile.entity)}"
              data-steps="${escapeHtml(tile.steps ? JSON.stringify(tile.steps) : "")}"
              data-panel="${escapeHtml(tile.panel || "")}"
              data-confirm="${escapeHtml(tile.confirm || "")}"
              data-assume="${tile.assume === null || tile.assume === undefined ? "" : tile.assume ? "on" : "off"}"
              title="${escapeHtml(tile.entity)}">
              <ha-icon icon="${icon}"></ha-icon>
              <span class="tile-label">${escapeHtml(tile.label)}</span>
              <span class="tile-sub">${escapeHtml(tile.sub || "")}</span>
            </button>`;
            })
            .join("")}
        </div>
      `);
    } else {
      this._setHtml(indicatorsEl, "");
    }

    this._setHtml(this.shadowRoot.getElementById("panel"),
      this._panel === "charge" ? this._renderChargePanel(hass, socValue, read) : "");

    // Warnings that only show up when something is wrong
    {
      const alerts = [];
      const tireWarn = ["tire_fl_warn", "tire_fr_warn", "tire_rl_warn", "tire_rr_warn"].find((key) => isOnState(read(key)));
      if (tireWarn) alerts.push({ entity: entities[tireWarn], icon: "mdi:car-tire-alert", text: translate(hass, "alert_tires") });
      const volts = toNumberOrZero(read("battery_voltage"));
      if (volts > 0 && volts < LOW_12V) {
        alerts.push({ entity: entities.battery_voltage, icon: "mdi:car-battery", text: translate(hass, "alert_12v", { value: formatState(read("battery_voltage"), hass) }) });
      }
      this._setHtml(alertsEl, alerts
        .map((a) => `<button class="alert-row" data-entity-id="${escapeHtml(a.entity)}"><ha-icon icon="${a.icon}"></ha-icon><span>${escapeHtml(a.text)}</span></button>`)
        .join(""));
    }
    // Range / SOC bar
    if (showRange && (primaryLevelHasBar || rangeState)) {
      if (primaryLevelHasBar) {
        this._setHtml(rangeEl, `
          <div class="box range-box">
            <div class="range-top">
              <div class="bar-wrap ${chargingActive ? "charging" : ""}" data-entity-id="${escapeHtml(primaryLevelEntity)}" title="${escapeHtml(primaryLevelEntity)}">
                <div class="bar-level" style="width:${primaryLevelValue}%;"></div>
                <div class="energy-text">${primaryLevelLabel}</div>
              </div>
              <div class="range-value" data-entity-id="${escapeHtml(rangeEntity)}" title="${escapeHtml(rangeEntity)}">
                <ha-icon icon="${rangeIcon}"></ha-icon>
                <span>${escapeHtml(rangeText)}</span>
              </div>
            </div>
          </div>
        `);
      } else {
        this._setHtml(rangeEl, `
          <div class="box range-box">
            <div class="range-top">
              <div class="range-value" data-entity-id="${escapeHtml(rangeEntity)}" title="${escapeHtml(rangeEntity)}">
                <ha-icon icon="${rangeIcon}"></ha-icon>
                <span>${escapeHtml(rangeText)}</span>
              </div>
            </div>
          </div>
        `);
      }
    } else {
      this._setHtml(rangeEl, "");
    }

    // Vehicle image
    if (showImage && entities.image && hass?.states) {
      const imgState = hass.states[entities.image];
      const pic = imgState?.attributes?.entity_picture;
      this._setHtml(imageEl, pic
        ? `<div class="image ${chargingActive ? "charging" : ""}"><img alt="${escapeHtml(vin)}" src="${escapeHtml(pic)}"></div>`
        : "");
    } else {
      this._setHtml(imageEl, "");
    }

    // Mini map
    if (showMap) {
      this._renderMap(mapEl, hass, entities.device_tracker, boolConfig(cfg, "show_trail", false),
        formatAge(hass, read("last_location")));
    } else {
      this._setHtml(mapEl, "");
    }

    // Quick info buttons
    if (showButtons) {
      // Tire status: use pressure values if available, fall back to warning sensors
      const tireKeys = ["tire_fl", "tire_fr", "tire_rl", "tire_rr"];
      const tireWarnKeys = ["tire_fl_warn", "tire_fr_warn", "tire_rl_warn", "tire_rr_warn"];
      // tire_fl and tire_fl_warn are both the front left tire
      const tireName = (key) => translate(hass, "tire", { position: translate(hass, key.replace("_warn", "")) });
      const tireEntries = tireKeys
        .map((key) => {
          const obj = read(key);
          const value = toNumberOrZero(obj);
          const unit = obj?.attributes?.unit_of_measurement || "";
          return { key, value, unit };
        })
        .filter((t) => t.value > 0);
      const hasPressureData = tireEntries.length > 0;

      let tireAlert = false;
      let tireValue = "\u2014";
      let tireLabel = translate(hass, "tires");
      let tireEntity = entities.tire_fl || entities.tire_fr
        || entities.tire_fl_warn || entities.tire_fr_warn || "";

      if (hasPressureData) {
        // Pressure sensors available: show average, alert on low tire
        const formatPressure = (v) => v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
        const tireAvg = tireEntries.reduce((a, b) => a + b.value, 0) / tireEntries.length;
        const lowTire = tireEntries.length >= 2
          ? tireEntries.find((t) => t.value < tireAvg * 0.8)
          : null;
        tireAlert = lowTire !== null && lowTire !== undefined;
        tireValue = tireAlert
          ? `${formatPressure(lowTire.value)} ${lowTire.unit}`.trim()
          : `${formatPressure(tireAvg)} ${tireEntries[0]?.unit || ""}`.trim();
        tireLabel = tireAlert ? tireName(lowTire.key) : translate(hass, "tires");
        tireEntity = tireAlert ? (entities[lowTire.key] || "") : tireEntity;
      } else {
        // No pressure data: use warning binary sensors (on = problem)
        const warnEntries = tireWarnKeys
          .map((key) => ({ key, obj: read(key) }))
          .filter((t) => hasUsableState(t.obj));
        if (warnEntries.length > 0) {
          const failingTire = warnEntries.find((t) => isOnState(t.obj));
          if (failingTire) {
            tireAlert = true;
            tireLabel = tireName(failingTire.key);
            tireValue = translate(hass, "warning");
            tireEntity = entities[failingTire.key] || "";
          } else {
            tireValue = translate(hass, "ok");
            tireEntity = entities[warnEntries[0].key] || "";
          }
        }
      }

      const quickItems = [
        {
          icon: "mdi:map-marker",
          label: translate(hass, "location"),
          value: humanizeLocationState(read("device_tracker"), hass),
          entity: entities.device_tracker || "",
        },
        {
          icon: rangeIcon,
          label: translate(hass, hasSoc ? "range" : "fuel_range"),
          value: rangeText,
          entity: rangeEntity,
        },
        {
          icon: "mdi:ev-station",
          label: translate(hass, "charging"),
          value: translate(hass, chargingActive ? "charging" : pluggedIn ? "plugged_in" : "not_charging"),
          entity: chargingEntity,
        },
        {
          icon: "mdi:car-tire-alert",
          label: tireLabel,
          value: tireValue,
          entity: tireEntity,
          alert: tireAlert,
        },
        {
          icon: "mdi:car-battery",
          label: translate(hass, "battery_12v"),
          value: formatState(read("battery_voltage"), hass),
          entity: entities.battery_voltage || "",
        },
        {
          icon: "mdi:counter",
          label: translate(hass, "odometer"),
          value: formatState(read("odometer"), hass),
          entity: entities.odometer || "",
        },
      ].filter((item) => item && firstDefined(item.entity, item.value) !== "");

      this._setHtml(buttonsEl, `
        <div class="buttons-grid">
          ${quickItems
            .map(
              (item) => `
            <button class="btn-item${item.alert ? " alert" : ""}" data-entity-id="${escapeHtml(item.entity)}" title="${escapeHtml(item.entity)}">
              <div class="btn-icon"><ha-icon icon="${item.icon}"></ha-icon></div>
              <div class="btn-text">
                <div class="btn-title">${escapeHtml(item.label)}</div>
                <div class="btn-value">${escapeHtml(item.value)}</div>
              </div>
            </button>
          `
            )
            .join("")}
        </div>
      `);
    } else {
      this._setHtml(buttonsEl, "");
    }

  }

  _renderMessage(message) {
    if (!this.shadowRoot) return;

    const nameEl = this.shadowRoot.getElementById("name");
    const vinEl = this.shadowRoot.getElementById("vin");
    const indicatorsEl = this.shadowRoot.getElementById("indicators");
    const rangeEl = this.shadowRoot.getElementById("range_info");
    const imageEl = this.shadowRoot.getElementById("images");
    const mapEl = this.shadowRoot.getElementById("mini_map");
    const buttonsEl = this.shadowRoot.getElementById("buttons");
    const alertsEl = this.shadowRoot.getElementById("alerts");

    nameEl.textContent = "Uconnect";
    vinEl.textContent = message;
    this._setHtml(indicatorsEl, "");
    this._setHtml(rangeEl, "");
    this._setHtml(imageEl, "");
    this._setHtml(mapEl, "");
    this._setHtml(buttonsEl, "");
    this._setHtml(alertsEl, "");
  }
}

if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, UconnectVehicleCard);
}

const cards = ensureCustomCardsArray();
if (!cards.some((c) => c && c.type === CARD_TAG)) {
  cards.push({
    type: CARD_TAG,
    name: translate(null, "card_name"),
    description: translate(null, "card_description"),
    preview: true,
  });
}
