import { NextResponse } from 'next/server';
import { ApiConfig } from '@/models/ApiConfig';
import connectDB from '@/lib/mongodb';

// GET /api/apis
export async function GET() {
  try {
    await connectDB();
    const apis = await ApiConfig.find().sort({ createdAt: -1 });
    return NextResponse.json(apis);
  } catch (error) {
    console.error('Erro ao buscar APIs:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar APIs' },
      { status: 500 }
    );
  }
}

// POST /api/apis
export async function POST(request: Request) {
  try {
    const data = await request.json();
    await connectDB();

    // Verifica se já existe uma API com o mesmo nome
    const existingApi = await ApiConfig.findOne({ name: data.name });
    if (existingApi) {
      return NextResponse.json(
        { message: 'Já existe uma API com este nome' },
        { status: 400 }
      );
    }

    const api = await ApiConfig.create(data);
    return NextResponse.json(api);
  } catch (error) {
    console.error('Erro ao criar API:', error);
    return NextResponse.json(
      { message: 'Erro ao criar API' },
      { status: 500 }
    );
  }
}
