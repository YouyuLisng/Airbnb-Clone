import { ImageResponse } from 'next/og';

export const alt = 'GearShare -- 戶外裝備 P2P 租借市集';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

// Text wordmark, matching app/components/Navbar/Logo.tsx (there's no
// GearShare logo image asset -- public/images/logo.png is unused
// leftover Airbnb-tutorial artwork, not something to render here).
export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 32,
                    // emerald-700 -> emerald-500, the app's brand gradient.
                    background: 'linear-gradient(135deg, #047857 0%, #059669 55%, #10b981 100%)',
                }}
            >
                <div
                    style={{
                        fontSize: 128,
                        fontWeight: 700,
                        color: '#ffffff',
                    }}
                >
                    GearShare
                </div>
                <div
                    style={{
                        fontSize: 36,
                        color: 'rgba(255,255,255,0.92)',
                    }}
                >
                    戶外裝備 P2P 租借市集
                </div>
            </div>
        ),
        { ...size }
    );
}
