import { JSX } from "solid-js";

interface MapSelectProps {
    lat: number;
    lng: number;
    zoom?: number;
    class?: string;
}

export default function MapSelect(props: MapSelectProps): JSX.Element {
    const { lat, lng, zoom = 16 } = props;

    const mapOptions = [
        { label: "Google Maps", href: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` },
        { label: "OpenStreetMap", href: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}` },
        { label: "Bing Maps", href: `https://www.bing.com/maps?cp=${lat}~${lng}&lvl=${zoom}` },
        { label: "Here WeGo", href: `https://wego.here.com/?map=${lat},${lng},${zoom},normal` },
        { label: "MapQuest", href: `https://www.mapquest.com/latlng/${lat},${lng}` },
        { label: "Apple Maps", href: `https://maps.apple.com/?ll=${lat},${lng}` },
    ];

    const openMap = (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement;
        const url = target.value;
        if (url) window.open(url, "_blank");
        // reset select to default prompt
        target.selectedIndex = 0;
    };

    return (
        <div class={"field suffix border small " + (props.class ?? "")}>
            <select onChange={openMap}>
                <option disabled selected>
                    Open location in...
                </option>
                {mapOptions.map((opt) => (
                    <option value={opt.href}>{opt.label}</option>
                ))}
            </select>
            <i>map</i>
        </div>
    );
}
