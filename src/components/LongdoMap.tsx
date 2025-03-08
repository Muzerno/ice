'use client';
import { getTrueLocation } from '@/utils/mapsService';
import { Button, Input } from 'antd';
import { de } from 'date-fns/locale';
import React, { useEffect, useRef, useState } from 'react';

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
    setMarker?: any
    setTrueAddress?: any
    isOpenButton?: boolean
    customerLocation?: any[]
    carLocation?: any[]
}

const LongdoMap: React.FC<LongdoMapProps> = ({ width = '100%', height = '400px', setMarker, setTrueAddress, isOpenButton, customerLocation, carLocation }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any | null>(null);
    const [locations, setLocations] = useState<{ lon: number, lat: number }[]>([]);


    useEffect(() => {
        if (window.longdo) {
            mapInstance.current = new window.longdo.Map({
                placeholder: mapRef.current,
            });

            if (customerLocation) {
                customerLocation.forEach((location) => {
                    const lon = parseFloat(location.longitude);
                    const lat = parseFloat(location.latitude);

                    if (!isNaN(lon) && !isNaN(lat)) {
                        let address
                        if (location.customer) {
                            address = JSON.parse(location.customer.address)
                        } else if (location.customer_order) {
                            address = JSON.parse(location.customer_order.address)
                        }
                        const marker = new window.longdo.Marker({
                            lon,
                            lat
                        }, {
                            title: location?.customer?.name || location?.customer_order?.name,
                            detail: `${address.road ? address.road : ''} ${address?.subdistrict ? address.subdistrict : ''} ${address.district} ${address.province} ${address.country} ${address.postcode}`,
                            size: { width: 200, height: 100 }
                        });
                        mapInstance.current.Overlays.add(marker);
                    } else {
                        console.error('Invalid coordinates:', location);
                    }
                });
            } else if (carLocation) {
                console.log('carLocation', carLocation)
                carLocation.forEach((item) => {
                    const lon = parseFloat(item.longitude);
                    const lat = parseFloat(item.latitude);

                    if (!isNaN(lon) && !isNaN(lat)) {
                        const marker = new window.longdo.Marker({
                            lon,
                            lat
                        }, {
                            title: item.car_number,
                            detail: `เลขทะเบียน ${item.car_number}`,
                            size: { width: 200, height: 100 }
                        });
                        mapInstance.current.Overlays.add(marker);
                    } else {
                        console.error('Invalid coordinates:', location);
                    }
                });
            }
        } else {
            console.error('Longdo Map library not loaded');
        }
    }, [customerLocation, carLocation]);


    const setLocation = () => {
        if (mapInstance.current) {
            const currentLocation = mapInstance.current.location()
            setMarker(currentLocation)
            trueAddress(currentLocation)
        }
    };

    const trueAddress = async (currentLocation: any) => {

        const res = await getTrueLocation(currentLocation.lat, currentLocation.lon)
        if (res) {
            setTrueAddress(res)
        }

    }

    return <div>

        <div ref={mapRef} style={{ width, height }} />
        {isOpenButton && <Button type='default' className='w-full mt-2 ' onClick={(e) => setLocation()} >ตําแหน่งปัจจุบัน</Button>}

    </div>;
};

export default LongdoMap;
