import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (request.nextUrl.searchParams.get('secret') !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  revalidatePath('/dashboard');
  revalidatePath('/deployments');
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
