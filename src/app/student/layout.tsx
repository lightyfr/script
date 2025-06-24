import { Sidebar } from '@/app/components/Sidebar';
import { Header } from '@/app/Header';
import { Column, Row, Tag } from '@/once-ui/components';
import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <Column 
        data-viz="divergent">
            <Row>                <Sidebar
                    items={[
                        { icon: 'dashboard', tooltip: 'Dashboard', href: '/student/dashboard' },
                        { icon: 'stats', tooltip: 'Campaigns', href: '/student/campaigns'  },
                        { icon: 'mail', tooltip: 'Inbox', href: '/student/inbox' },
                        { icon: 'chalkboardTeacher', tooltip: 'Connections', href: '/student/connect' },
                    ]}
                />
                <Column paddingLeft='104' style={{ flex: 1 }}>
                    {children}
                </Column>
            </Row>
        </Column>
    );
};

export default DashboardLayout;