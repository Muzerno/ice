import LayoutComponent from '@/components/Layout';
import React from 'react';
import { Card } from "antd";

interface IProps {
    navBarMenu: number
}
export default function Dashboard(props: IProps) {
    return (
        <LayoutComponent >
            <div className='w-full App'>
                <Card className='w-1/4 !bg-blue-300 cursor-pointer'>
                    <div>Dashboard</div>
                </Card>
            </div>
        </LayoutComponent>

    );
}


