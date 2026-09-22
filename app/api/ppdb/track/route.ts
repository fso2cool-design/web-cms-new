import { NextRequest, NextResponse } from 'next/server';
import rawConfig from '@/firebase-applet-config.json';

// Server-side safe tracking route
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regNumber = searchParams.get('regNumber')?.trim().toUpperCase();

    if (!regNumber) {
      return NextResponse.json(
        { error: 'Nomor registrasi wajib disertakan' },
        { status: 400 }
      );
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || rawConfig.projectId;
    const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || rawConfig.firestoreDatabaseId || '(default)';
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || rawConfig.apiKey;

    // Query Firestore REST API directly
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents:runQuery?key=${apiKey}`;

    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'ppdbApplicants' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'registrationNumber' },
            op: 'EQUAL',
            value: { stringValue: regNumber },
          },
        },
        limit: 1,
      },
    };

    const response = await fetch(firestoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[API PPDB Track] Firestore REST query error:', errText);
      return NextResponse.json({ found: false, data: null });
    }

    const results = await response.json();
    const match = results.find((r: any) => r.document && r.document.fields);

    if (!match) {
      return NextResponse.json({ found: false, data: null });
    }

    const fields = match.document.fields;
    // Return only non-sensitive public tracking data
    const trackingData = {
      registrationNumber: fields.registrationNumber?.stringValue || regNumber,
      fullName: fields.fullName?.stringValue || '',
      nisn: fields.nisn?.stringValue ? `${fields.nisn.stringValue.slice(0, 4)}****` : '****',
      previousSchool: fields.previousSchool?.stringValue || '',
      entryTrack: fields.entryTrack?.stringValue || '',
      status: fields.status?.stringValue || 'submitted',
      notes: fields.notes?.stringValue || '',
      createdAt: fields.createdAt?.stringValue || '',
    };

    return NextResponse.json({ found: true, data: trackingData });
  } catch (error) {
    console.error('[API PPDB Track] Error:', error);
    return NextResponse.json(
      { error: 'Gagal melacak data registrasi PPDB' },
      { status: 500 }
    );
  }
}
