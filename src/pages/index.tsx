import { NextPageWithLayout } from "../types";
import { DashboardLayout } from "../layouts";
import { env } from "../env/client.mjs";
import { MyWallet } from "../components";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import ClothMarketplace from "../server/artifacts/contracts/ClothMarketplace.sol/ClothMarketplace.json";
import { Fragment, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { Dialog, Transition } from "@headlessui/react";
import { useForm } from "react-hook-form";
import clsx from "clsx";

const ClothListItem = ({
  seller,
  cloth,
}: {
  seller: string;
  cloth: { id: BigNumber; name: string; price: BigNumber; quantity: BigNumber };
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { config } = usePrepareContractWrite({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "buyCloth",
    args: [seller, cloth.id, 1],
  });
  const { data, write } = useContractWrite(config);
  const { isSuccess, isFetching } = useWaitForTransaction({
    hash: data?.hash,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{ quantity: number }>({
    defaultValues: { quantity: 0 },
  });

  const watchQuantity = watch("quantity");

  const onSubmit = handleSubmit(({ quantity }) => {
    write?.({
      recklesslySetUnpreparedArgs: [seller, cloth.id, quantity],
    });
  });

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
    }
  }, [isSuccess, reset]);

  return (
    <li>
      {cloth.id.toString()} - {cloth.name} - {cloth.price.toNumber()} - {cloth.quantity.toNumber()}
      <button
        type="button"
        className="relative inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
        onClick={() => setIsOpen(true)}
      >
        Buy
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Buy Cloth
                  </Dialog.Title>

                  <form className="flex flex-col gap-2 mt-4" onSubmit={onSubmit}>
                    <input
                      type="number"
                      className={clsx(
                        "flex-1 border-2 border-gray-500 rounded-lg py-2 px-4",
                        errors.quantity && "border-red-500 focus:border-red-500",
                      )}
                      {...register("quantity", { required: true, min: 1 })}
                    />
                    <p>
                      <strong>Total Price:</strong> {cloth.price.toNumber() * watchQuantity}
                    </p>
                    <input
                      disabled={isFetching}
                      type="submit"
                      value={isFetching ? "Loading..." : "Buy"}
                      className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:cursor-not-allowed disabled:opacity-80"
                    />
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </li>
  );
};

const CustomerListItem = ({ customer }: { customer: string }) => {
  const { data: cloths } = useContractRead({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "getClothsByOwner",
    args: [customer],
    watch: true,
  });

  return (
    <li>
      {customer}
      <ul>
        {cloths?.map((cloth) => (
          <ClothListItem key={cloth.id} seller={customer} cloth={cloth} />
        ))}
      </ul>
    </li>
  );
};

const Customers = ({ customers }: { customers?: string[] }) => {
  const { address } = useAccount();
  const [otherCustomers, setOtherCustomers] = useState<string[]>([]);

  useEffect(() => {
    setOtherCustomers(customers?.filter((customer) => customer !== address) ?? []);
  }, [address, customers]);

  return (
    <ul className="bg-green-200">
      {otherCustomers?.map((customer) => (
        <CustomerListItem key={customer} customer={customer} />
      ))}
    </ul>
  );
};

const Home: NextPageWithLayout = () => {
  const { address } = useAccount();
  const { data: cloths } = useContractRead({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "getClothsByOwner",
    args: [address],
    watch: true,
  });

  const { data: customers } = useContractRead({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "getCustomers",
    watch: true,
  });

  return (
    <div className="flex flex-col gap-4">
      <MyWallet />

      <Customers customers={customers as string[]} />

      <div className="bg-red-200">
        {cloths?.map((cloth) => (
          <div key={cloth.id}>
            <h2>{cloth.name}</h2>
            <p>{cloth.price.toString()}</p>
            <p>{cloth.quantity.toString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout title="Cloth Marketplace">{page}</DashboardLayout>;
};

export default Home;
