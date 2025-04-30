import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    await connectDB();
    
    const query = storeId ? { store: storeId } : {};
    const coupons = await Coupon.find(query)
      .populate('store')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar cupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();
    
    const coupon = await Coupon.create(body);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 });
  }
}
