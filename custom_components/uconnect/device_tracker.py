"""Device Tracker for Uconnect integration."""

from __future__ import annotations

from homeassistant.components.device_tracker import SourceType, TrackerEntity
from homeassistant.const import Platform
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event
from py_uconnect import Vehicle

from .const import DOMAIN
from .coordinator import UconnectConfigEntry, UconnectDataUpdateCoordinator
from .entity import UconnectEntity, should_add


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: UconnectConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator = config_entry.runtime_data
    entities = []
    for vehicle in coordinator.client.vehicles.values():
        if should_add(
            hass,
            Platform.DEVICE_TRACKER,
            f"{DOMAIN}_{vehicle.vin}_location",
            vehicle.location is not None,
        ):
            entities.append(UconnectTracker(coordinator, vehicle))

    async_add_entities(entities)


class UconnectTracker(TrackerEntity, UconnectEntity):
    def __init__(
        self,
        coordinator: UconnectDataUpdateCoordinator,
        vehicle: Vehicle,
    ):
        UconnectEntity.__init__(self, coordinator, vehicle)
        self._attr_unique_id = f"{DOMAIN}_{vehicle.vin}_location"
        self._attr_translation_key = "location"
        self._attr_icon = "mdi:map-marker-outline"
        self._image_entity_id: str | None = None

    async def async_added_to_hass(self) -> None:
        """Follow the vehicle image, shown as the marker on maps."""
        await super().async_added_to_hass()
        self._image_entity_id = er.async_get(self.hass).async_get_entity_id(
            Platform.IMAGE, DOMAIN, f"{DOMAIN}_{self.vehicle.vin}_image"
        )
        if self._image_entity_id is None:
            return

        @callback
        def _image_changed(event: Event[EventStateChangedData]) -> None:
            # The image URL carries an access token that rotates
            self.async_write_ha_state()

        self.async_on_remove(
            async_track_state_change_event(
                self.hass, [self._image_entity_id], _image_changed
            )
        )

    @property
    def entity_picture(self) -> str | None:
        """The vehicle image, so maps show the car instead of its initials."""
        if self._image_entity_id is None:
            return None
        state = self.hass.states.get(self._image_entity_id)
        return state.attributes.get("entity_picture") if state else None

    @property
    def latitude(self):
        if self.vehicle.location is None:
            return None
        return self.vehicle.location.latitude

    @property
    def longitude(self):
        if self.vehicle.location is None:
            return None
        return self.vehicle.location.longitude

    @property
    def source_type(self):
        return SourceType.GPS
