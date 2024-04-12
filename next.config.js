/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXTAUTH_JWT_SECRET: 'NEXT-JWT-SECRET',
        NEXTAUTH_SECRET: 'NEXT-SECRET',
    },
    images: {
        domains: [
            'res.cloudinary.com', 
            'avatars.githubusercontent.com',
            'lh3.googleusercontent.com'
        ]
    }
}  
module.exports = nextConfig