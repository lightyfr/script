import { Sidebar } from '@/app/components/Sidebar';
import { Header } from '@/app/Header';
import { Column, Row } from '@/once-ui/components';
import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <Column >
            
            <Row>
                <Sidebar
                    items={[
                        { icon: 'refresh', tooltip: 'Refresh' },
                        { icon: 'chevronUp', tooltip: 'Scroll to Top' },
                        { icon: 'search', tooltip: 'Search' },
                    ]}
                />
                <Column paddingLeft='xl' style={{ flex: 1 }}>
                    {children}
                </Column>
            </Row>
        </Column>
    );
};

export default DashboardLayout;