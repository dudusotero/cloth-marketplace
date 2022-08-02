import Image from "next/image";
import { useConnect } from "wagmi";

const SignInForm = () => {
  const { connect, connectors } = useConnect();

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12">
          <Image
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt="Workflow"
            height={48}
            width={52}
          />
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Cloth Marketplace</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="grid grid-cols-2 gap-3">
            {connectors.map((connector) => (
              <div key={connector.id}>
                <button
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => connect({ connector })}
                >
                  {connector.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
