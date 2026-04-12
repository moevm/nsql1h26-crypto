import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>CryptoWatch</title>
        <meta name="description" content="CryptoWatch frontend." />
      </Head>
      <div className="text-sm text-text-main">
        Затычка: проект инициализирован, Next.js + TS.
      </div>
    </>
  );
}
