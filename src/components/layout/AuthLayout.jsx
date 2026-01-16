/**
 * Auth layout for login/register pages.
 */

import { Typography, theme } from 'antd';

const { Title, Text } = Typography;

const AuthLayout = ({ children }) => {
    const { token } = theme.useToken();

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
            }}
        >
            {/* Left side - Branding */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 48,
                    background: token.colorPrimary,
                    color: '#fff',
                }}
                className="auth-branding"
            >
                <div style={{ textAlign: 'center', maxWidth: 400 }}>
                    <Title level={1} style={{ color: '#fff', marginBottom: 24 }}>
                        Legal Case Management
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                        Streamline your legal practice with our comprehensive case management system.
                        Manage cases, documents, tasks, and team members all in one place.
                    </Text>
                </div>
            </div>

            {/* Right side - Auth form */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 48,
                }}
            >
                <div
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        padding: 32,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                        boxShadow: token.boxShadowSecondary,
                    }}
                >
                    {children}
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .auth-branding {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
};

export default AuthLayout;
