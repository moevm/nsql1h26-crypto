import Head from "next/head";

interface PageHeadProps {
  title: string;
  description: string;
}

export const PageHead = ({ title, description }: PageHeadProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
  );
};
