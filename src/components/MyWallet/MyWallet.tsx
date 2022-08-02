// deposit
// withdraw
// transfer
// balance

import { Fragment, useEffect, useState } from "react";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useForm } from "react-hook-form";
import { env } from "../../env/client.mjs";
import ClothMarketplace from "../../server/artifacts/contracts/ClothMarketplace.sol/ClothMarketplace.json";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";

const Balance = () => {
  const { address } = useAccount();
  const { data: balance } = useContractRead({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "balance",
    watch: true,
    overrides: { from: address },
  });
  const { data: totalBalance } = useContractRead({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "getTotalBalance",
    watch: true,
  });
  return (
    <div>
      <h2>Balance</h2>
      <p>{balance?.toString()}</p>
      <p>{totalBalance?.toString()}</p>
    </div>
  );
};

const Deposit = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { config } = usePrepareContractWrite({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "deposit",
  });
  const { data, write } = useContractWrite(config);
  const { isSuccess, isFetching } = useWaitForTransaction({
    hash: data?.hash,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ amount: number }>({
    defaultValues: { amount: 0 },
  });

  const onSubmit = handleSubmit(({ amount }) => {
    write?.({
      recklesslySetUnpreparedOverrides: {
        value: amount,
      },
    });
  });

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
    }
  }, [isSuccess, reset]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
      >
        <span>Deposit</span>
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
                    Deposit Ether
                  </Dialog.Title>

                  <form className="flex flex-col gap-2 mt-4" onSubmit={onSubmit}>
                    <input
                      type="number"
                      className={clsx(
                        "flex-1 border-2 border-gray-500 rounded-lg py-2 px-4",
                        errors.amount && "border-red-500 focus:border-red-500",
                      )}
                      {...register("amount", { required: true, min: 1 })}
                    />
                    <input
                      disabled={isFetching}
                      type="submit"
                      value={isFetching ? "Loading..." : "Deposit"}
                      className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:cursor-not-allowed disabled:opacity-80"
                    />
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const Withdraw = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { config } = usePrepareContractWrite({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "withdraw",
    args: [0],
  });
  const { data, write } = useContractWrite(config);
  const { isSuccess, isFetching } = useWaitForTransaction({
    hash: data?.hash,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ amount: number }>({
    defaultValues: { amount: 0 },
  });

  const onSubmit = handleSubmit(({ amount }) => {
    write?.({
      recklesslySetUnpreparedArgs: [amount],
    });
  });

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
    }
  }, [isSuccess, reset]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
      >
        <span>Withdraw</span>
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
                    Withdraw Ether
                  </Dialog.Title>

                  <form className="flex flex-col gap-2 mt-4" onSubmit={onSubmit}>
                    <input
                      type="number"
                      className={clsx(
                        "flex-1 border-2 border-gray-500 rounded-lg py-2 px-4",
                        errors.amount && "border-red-500 focus:border-red-500",
                      )}
                      {...register("amount", { required: true, min: 1 })}
                    />
                    <input
                      disabled={isFetching}
                      type="submit"
                      value={isFetching ? "Loading..." : "Withdraw"}
                      className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:cursor-not-allowed disabled:opacity-80"
                    />
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const Transfer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();
  const { config } = usePrepareContractWrite({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "transfer",
    args: [address, 0],
  });
  const { data, write } = useContractWrite(config);
  const { isSuccess, isFetching } = useWaitForTransaction({
    hash: data?.hash,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ address: string; amount: number }>({
    defaultValues: { address: "", amount: 0 },
  });

  const onSubmit = handleSubmit(({ address, amount }) => {
    write?.({
      recklesslySetUnpreparedArgs: [address, amount],
    });
  });

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
    }
  }, [isSuccess, reset]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
      >
        <span>Transfer</span>
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
                    Transfer Ether
                  </Dialog.Title>

                  <form className="flex flex-col gap-2 mt-4" onSubmit={onSubmit}>
                    <input
                      type="text"
                      className={clsx(
                        "flex-1 border-2 border-gray-500 rounded-lg py-2 px-4",
                        errors.address && "border-red-500 focus:border-red-500",
                      )}
                      {...register("address", { required: true })}
                    />
                    <input
                      type="number"
                      className={clsx(
                        "flex-1 border-2 border-gray-500 rounded-lg py-2 px-4",
                        errors.amount && "border-red-500 focus:border-red-500",
                      )}
                      {...register("amount", { required: true, min: 1 })}
                    />
                    <input
                      disabled={isFetching}
                      type="submit"
                      value={isFetching ? "Loading..." : "Trasnfer"}
                      className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:cursor-not-allowed disabled:opacity-80"
                    />
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const MyWallet = () => {
  return (
    <div className="grid gap-4">
      <Balance />
      <hr />
      <Deposit />
      <hr />
      <Withdraw />
      <hr />
      <Transfer />
    </div>
  );
};

export default MyWallet;
