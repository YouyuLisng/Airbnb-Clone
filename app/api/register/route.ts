import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";

export async function POST(
    request: Request, 
    ) {
    const body = await request.json();
    const { 
        email,
        name,
        password,
    } = body; // 接收前端傳來的資料

    const hashedPassword = await bcrypt.hash(password, 12); // 加密 前端傳來的Password

    const user = await prisma.user.create({ // 在MongoDB 建立User資料
        data: {
        email,
        name,
        hashedPassword,
        }
    });

    return NextResponse.json(user);
}