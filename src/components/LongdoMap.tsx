"use client";
import { getTrueLocation } from "@/utils/mapsService";
import { Button } from "antd";
import { LocateFixed, Car } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { UserContext } from "@/context/userContext";

declare global {
  interface Window {
    longdo: any;
  }
}

interface LongdoMap {
  Event: LongdoEvent;
  Layers: LongdoLayerCollection;
  Overlays: LongdoOverlayCollection;
  Route: LongdoRoute;
  Search: LongdoSearch;
  Tags: LongdoTagCollection;
  Ui: LongdoUiCollection;
  bound(e: any, n: any, r: any): void;
  enableFilter(enable: boolean): void;
  enableNightMode(enable: boolean): void;
  exportImage(): void;
  focus(): void;
  id(): string;
  language(lang: string): void;
  loadingTile(): void;
  location: any;
  move(e: any, n: any): void;
  pageToScreen(e: any): any;
  pause(e: boolean): void;
  pinch(e: any, n: any): void;
  pinchEnd(e: any): void;
  pitch(e: any): void;
  placeholder(): any;
  projection(): any;
  repaint(e: any): void;
  resize(): void;
  rotate(e: any): void;
  screenToPoint(e: any): any;
  zoom(level: number, x?: number, y?: number): void;
  zoomRange(range: [number, number]): void;
}

interface LongdoOverlayCollection {
  hit(location: any): any;
  element(element: HTMLElement, options?: any): any;
  image(url: string, options?: any): any;
  geometry(type: string, coordinates: any[], options?: any): any;
  add(overlay: any): void;
  remove(overlay: any): void;
  clear(): void;
}

interface LongdoEvent {
  bind(event: string, callback: Function): void;
  unbind(event: string, callback: Function): void;
  fire(event: string, ...args: any[]): void;
  pause(event: string, pause: boolean): void;
  bindAll(callback: Function): void;
}

interface LongdoLayerCollection {
  setBase(layer: any): void;
  add(layer: any): void;
  insert(layer: any, index: number): void;
  remove(layer: any): void;
  clear(): void;
}
interface LongdoRoute {
  language(lang: string): void;
  placeholder(value: any): void;
  enableContextMenu(enable: boolean): void;
  line(options: any): void;
  auto(): void;
}

interface LongdoSearch {
  language(lang: string): void;
  placeholder(value: any): void;
  suggest(query: string): void;
  search(query: string): void;
  address(location: any): void;
}
interface LongdoTagCollection {
  language(lang: string): void;
  set(tag: any): void;
  add(tag: any): void;
  remove(tag: any): void;
  clear(): void;
}
interface LongdoUiCollection {
  resize(): void;
  language(lang: string): void;
  add(ui: any): void;
  remove(ui: any): void;
  updateStyle(style: any): void;
}

interface LongdoMapProps {
  width?: string;
  height?: string;
  setMarker?: any;
  setTrueAddress?: any;
  isOpenButton?: boolean;
  isOpenButtonMap?: boolean;
  customerLocation?: any[];
  carLocation?: any[];
  updateLocaltion?: (
    carId: string,
    location: { latitude: number; longitude: number }
  ) => Promise<void>;
}

const LongdoMap: React.FC<LongdoMapProps> = ({
  width = "100%",
  height = "400px",
  setMarker,
  setTrueAddress,
  isOpenButton,
  isOpenButtonMap,
  customerLocation,
  carLocation,
  updateLocaltion,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any | null>(null);
  const [locations, setLocations] = useState<{ lon: number; lat: number }[]>(
    []
  );

  const { userLogin } = useContext(UserContext);
  const roleKey = userLogin?.user?.role?.role_key;

  const safeParseJSON = (input: string) => {
    try {
      return JSON.parse(input);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (!window.longdo) {
      console.error("Longdo Map library not loaded");
      return;
    }

    mapInstance.current = new window.longdo.Map({
      placeholder: mapRef.current,
    });

    const formatMapAddress = (json: any) => {
      if (!json) return "";
      const road = json.road ?? "";
      const subdistrict = json.subdistrict?.replace(/^ต\./, "ตำบล") ?? "";
      const district = json.district?.replace(/^อ\./, "อำเภอ") ?? "";
      const province = json.province?.replace(/^จ\./, "จังหวัด") ?? "";
      const postcode = json.postcode ?? "";
      return [road, subdistrict, district, province, postcode]
        .filter(Boolean)
        .join(", ");
    };

    const parseFullAddress = (
      fullAddress: string
    ): { manual: string; map: string } => {
      const [manualAddress, mapAddressPart] = fullAddress.split(
        "\n\n[ที่อยู่จากแผนที่]: "
      );
      if (!mapAddressPart) return { manual: manualAddress || "-", map: "" };

      try {
        const json = JSON.parse(mapAddressPart);
        return {
          manual: manualAddress || "-",
          map: formatMapAddress(json),
        };
      } catch (err) {
        console.error("Failed to parse map address:", err);
        return {
          manual: manualAddress || "-",
          map: mapAddressPart, // raw fallback
        };
      }
    };

    if (customerLocation && mapInstance.current) {
      mapInstance.current.Overlays.clear();

      console.log("customerLocation", customerLocation);
      
      
      customerLocation.forEach((location) => {
        const lon = parseFloat(location.longitude);
        const lat = parseFloat(location.latitude);
        

        if (!isNaN(lon) && !isNaN(lat)) {
          let name = "";
          let addressInfo: { manual: string; map: string } = {
            manual: "-",
            map: "",
          };

          const note = location.note?.trim() ? location.note.trim() : "-";

          if (location.customer) {        
            name = location.customer.name;
            addressInfo = parseFullAddress(location.customer.address);
          } else if (location.customer_order) {
            name = location.customer_order.name;
            addressInfo = parseFullAddress(location.customer_order.address);
          } else {
            // fallback กรณีที่ไม่มี customer หรือ customer_order แต่มี name และ address ตรง ๆ
            name = location.name || "-";
            addressInfo = parseFullAddress(location.address || "");

          }

          const marker = new window.longdo.Marker(
            { lon, lat },
            {
              title: name,
              detail: `${addressInfo.manual}${
                addressInfo.map ? "\n" + addressInfo.map : ""
              }\nหมายเหตุ: ${note}`,
              size: { width: 200, height: 100 },
            }
          );

          mapInstance.current.Overlays.add(marker);
        } else {
          console.error("Invalid coordinates:", location);
        }
      });
    } else if (carLocation) {
      carLocation.forEach((item) => {
        const lon = parseFloat(item.longitude);
        const lat = parseFloat(item.latitude);

        if (!isNaN(lon) && !isNaN(lat)) {
          const marker = new window.longdo.Marker(
            { lon, lat },
            {
              title: `${item.car_number} - ${item.users?.firstname || ""} ${
                item.users?.lastname || ""
              }`,
              detail: `เลขทะเบียน: ${item.car_number}<br/>คนขับ: ${
                item.users?.firstname || ""
              } ${item.users?.lastname || ""}`,
              size: { width: 200, height: 100 },
            }
          );
          mapInstance.current.Overlays.add(marker);
        } else {
          console.error("Invalid coordinates:", item);
        }
      });
    }
  }, [customerLocation, carLocation]);

  useEffect(() => {
    if (!carLocation) return;

    const interval = setInterval(() => {
      if (!mapInstance.current) return;

      // ลบ marker เดิมก่อน
      mapInstance.current.Overlays.clear();

      carLocation.forEach((item) => {
        const lon = parseFloat(item.longitude);
        const lat = parseFloat(item.latitude);

        if (!isNaN(lon) && !isNaN(lat)) {
          const marker = new window.longdo.Marker(
            { lon, lat },
            {
              title: `${item.car_number} - ${item.users?.firstname || ""} ${
                item.users?.lastname || ""
              }`,
              detail: `เลขทะเบียน: ${item.car_number}<br/>คนขับ: ${
                item.users?.firstname || ""
              } ${item.users?.lastname || ""}`,
              size: { width: 200, height: 100 },
            }
          );
          mapInstance.current.Overlays.add(marker);
        }
      });
    }, 5000); // ทุก 5 วินาที

    return () => clearInterval(interval); // ล้าง timer ตอน component unmount
  }, [carLocation]);

  const setLocation = () => {
    if (mapInstance.current) {
      const currentLocation = mapInstance.current.location();
      setMarker(currentLocation);
      trueAddress(currentLocation);
    }
  };

  const centerToCar = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude, longitude } = coords;

          // อัพเดทตำแหน่งรถในฐานข้อมูล
          if (updateLocaltion && userLogin?.user?.transportation_car?.car_id) {
            try {
              await updateLocaltion(userLogin.user.transportation_car.car_id, {
                latitude,
                longitude,
              });
            } catch (error) {
              console.error("Failed to update car location:", error);
            }
          }

          if (mapInstance.current) {
            const carLocation = {
              lon: longitude,
              lat: latitude,
            };

            mapInstance.current.location(carLocation);

            // ส่งตำแหน่งและที่อยู่ผ่าน setMarker และ setTrueAddress
            if (setMarker) {
              setMarker(carLocation);
            }

            // เรียก trueAddress เพื่อหาที่อยู่จากพิกัด
            trueAddress(carLocation);

            const carMarker = new window.longdo.Marker(carLocation, {
              title: "ตำแหน่งปัจจุบันของรถ",
              detail: `พิกัด: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              size: { width: 200, height: 100 },
            });

            mapInstance.current.Overlays.add(carMarker);
            mapInstance.current.zoom(15);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("ไม่สามารถหาตำแหน่งปัจจุบันได้ กรุณาตรวจสอบการตั้งค่า GPS");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("เบราว์เซอร์ของคุณไม่รองรับการหาตำแหน่ง GPS");
    }
  };

  const trueAddress = async (currentLocation: any) => {
    const res = await getTrueLocation(currentLocation.lat, currentLocation.lon);
    if (res && setTrueAddress) {
      setTrueAddress(res);
    }
  };

  return (
    <div>
      <div ref={mapRef} style={{ width, height }} />
      {isOpenButton && roleKey !== "deliver" && (
        <div className="flex flex-col gap-2 mt-2">
          <Button
            type="primary"
            icon={<LocateFixed />}
            onClick={setLocation}
            className="flex items-center"
          >
            ตำแหน่งปัจจุบัน
          </Button>
        </div>
      )}

      {isOpenButtonMap && roleKey === "deliver" && (
        <div className="flex flex-col gap-2 mt-2">
          <Button
            type="default"
            icon={<Car />}
            onClick={centerToCar}
            className="flex items-center"
          >
            ตำแหน่งปัจจุบันของรถ
          </Button>
        </div>
      )}
    </div>
  );
};

export default LongdoMap;