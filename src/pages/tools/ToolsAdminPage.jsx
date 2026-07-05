/**
 * Micro-Tools admin hub — section cards linking to each resource manager.
 */

import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Typography } from 'antd';
import {
  BankOutlined, TeamOutlined, SafetyOutlined, ScheduleOutlined,
  NotificationOutlined, CalendarOutlined, FileOutlined, PictureOutlined,
} from '@ant-design/icons';
import { SECTIONS, SECTION_ORDER } from './resourceConfigs';

const { Title, Text, Paragraph } = Typography;

const ICONS = {
  gavel: BankOutlined,
  team: TeamOutlined,
  safety: SafetyOutlined,
  schedule: ScheduleOutlined,
  notification: NotificationOutlined,
  calendar: CalendarOutlined,
  file: FileOutlined,
  picture: PictureOutlined,
};

const ToolsAdminPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>Micro-Tools</Title>
      <Paragraph type="secondary" style={{ marginTop: -8 }}>
        Manage the public reference data shown in the mobile app. Pick a section to add or edit entries.
      </Paragraph>

      <Row gutter={[16, 16]}>
        {SECTION_ORDER.map((key) => {
          const s = SECTIONS[key];
          const Icon = ICONS[s.icon] || FileOutlined;
          return (
            <Col xs={24} sm={12} lg={8} key={key}>
              <Card
                hoverable
                onClick={() => navigate(`/tools-admin/${key}`)}
                styles={{ body: { display: 'flex', alignItems: 'center', gap: 16 } }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: s.color + '18', color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>
                  <Icon />
                </div>
                <div>
                  <Text strong style={{ fontSize: 15 }}>{s.title}</Text>
                  <div><Text type="secondary" style={{ fontSize: 12.5 }}>{s.description}</Text></div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default ToolsAdminPage;
