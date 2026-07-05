/**
 * Standalone page shell for the public Micro-Tools admin (renders outside
 * MainLayout, so it provides its own top bar + centered container).
 */

import { Button } from 'antd';
import { ArrowLeftOutlined, AppstoreOutlined } from '@ant-design/icons';

export default function ToolsShell({ title, subtitle, onBack, extra, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7' }}>
      <div style={{
        background: '#001529', color: '#fff', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10,
      }}>
        {onBack ? (
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ color: '#fff' }} />
        ) : (
          <AppstoreOutlined style={{ fontSize: 22 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
          {subtitle ? <div style={{ opacity: 0.7, fontSize: 13 }}>{subtitle}</div> : null}
        </div>
        {extra}
      </div>
      <div style={{ maxWidth: 1080, margin: '24px auto', padding: '0 16px' }}>
        {children}
      </div>
    </div>
  );
}
