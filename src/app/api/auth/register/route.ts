import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verifica se já existe algum usuário admin
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Já existe um usuário administrador' },
        { status: 400 }
      );
    }

    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está em uso' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário admin
    const user = await User.create({
      email,
      password: hashedPassword,
      isAdmin: true,
    });

    return NextResponse.json(
      { message: 'Usuário admin criado com sucesso' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { message: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
