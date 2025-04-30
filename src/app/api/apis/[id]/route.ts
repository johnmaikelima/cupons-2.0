import { NextResponse } from 'next/server';
import { ApiConfig } from '@/models/ApiConfig';
import connectDB from '@/lib/mongodb';

// GET /api/apis/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const api = await ApiConfig.findById(params.id);
    
    if (!api) {
      return NextResponse.json(
        { message: 'API não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(api);
  } catch (error) {
    console.error('Erro ao buscar API:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar API' },
      { status: 500 }
    );
  }
}

// PUT /api/apis/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    await connectDB();

    const api = await ApiConfig.findById(params.id);
    if (!api) {
      return NextResponse.json(
        { message: 'API não encontrada' },
        { status: 404 }
      );
    }

    // Verifica se já existe outra API com o mesmo nome
    const existingApi = await ApiConfig.findOne({
      name: data.name,
      _id: { $ne: params.id }
    });
    if (existingApi) {
      return NextResponse.json(
        { message: 'Já existe uma API com este nome' },
        { status: 400 }
      );
    }

    const updatedApi = await ApiConfig.findByIdAndUpdate(
      params.id,
      {
        name: data.name,
        provider: data.provider,
        appToken: data.appToken,
        sourceId: data.sourceId,
        isActive: data.isActive
      },
      { new: true }
    );

    return NextResponse.json(updatedApi);
  } catch (error) {
    console.error('Erro ao atualizar API:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar API' },
      { status: 500 }
    );
  }
}

// DELETE /api/apis/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const api = await ApiConfig.findById(params.id);
    if (!api) {
      return NextResponse.json(
        { message: 'API não encontrada' },
        { status: 404 }
      );
    }

    await ApiConfig.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'API excluída com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir API:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir API' },
      { status: 500 }
    );
  }
}
