import Head from "next/head";
import { Header, Loading, SignInForm } from "../../components";
import { useIsMounted } from "../../hooks";
import { useAccount } from "wagmi";

const DashboardLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();

  return (
    <>
      <Head>
        <title>Cloth Marketplace</title>
        <meta name="description" content="Cloth Marketplace example app using Solidity + NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isMounted ? (
        isConnected ? (
          <>
            <Header />
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              </div>
            </header>
            <main>
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
            </main>
          </>
        ) : (
          <SignInForm />
        )
      ) : (
        <Loading />
      )}
    </>
  );
};

export default DashboardLayout;
