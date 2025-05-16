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
        <Tag position='fixed' zIndex={1} variant='neutral' right='4' top='16' size='l'>Upgrade</Tag>
            <Row>
                <Sidebar
                    items={[
                        { icon: 'dashboard', tooltip: 'Dashboard' },
                        { icon: 'stats', tooltip: 'Stats' },
                        { icon: 'mail', tooltip: 'Your Mail' },
                        { icon: 'chalkboardTeacher', tooltip: 'Connections' },
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