'use client'
import LayoutComponent from '@/components/Layout';
import LongdoMap from "@/components/LongdoMap";
import { getLocationCar } from '@/utils/dashboardService';
import { Card, Row } from "antd";
import { useEffect, useState } from 'react';


export default function Page() {
    const [carLocation, setCarLocation] = useState<any>([]);
    useEffect(()=>{
        fetchCarLocation()
    },[])

    const fetchCarLocation = async () => {
        const res = await getLocationCar();
        if (res) {
            setCarLocation(res);
        }
        
    };
    return (
        <LayoutComponent>
            <Row justify="center">
                <div className='mt-1 w-full'>
                    <Card className='w-full' title="ตำแหน่งรถ">
                        <LongdoMap width='100%'  height='600px' isOpenButton={false} carLocation={carLocation} />
                    </Card>
                </div>
            </Row>
        </LayoutComponent>
    );
}
