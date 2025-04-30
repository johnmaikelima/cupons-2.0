import { ApiConfig } from '@/models/ApiConfig';
import connectDB from '@/lib/mongodb';

export default async function ApisLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await connectDB();
  const apis = await ApiConfig.find().sort({ createdAt: -1 }).lean();

  const formattedApis = apis.map(api => ({
    ...api,
    _id: api._id.toString()
  }));

  return (
    <div>
      {children}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__INITIAL_APIS__ = ${JSON.stringify(formattedApis)}`
        }}
      />
    </div>
  );
}
