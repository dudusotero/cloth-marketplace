import { useEffect, useState, Fragment } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useForm } from "react-hook-form";
import { env } from "../../env/client.mjs";
import ClothMarketplace from "../../server/artifacts/contracts/ClothMarketplace.sol/ClothMarketplace.json";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import { PlusSmIcon } from "@heroicons/react/outline";

const AddCloth = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();
  const { config } = usePrepareContractWrite({
    addressOrName: env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractInterface: ClothMarketplace.abi,
    functionName: "addCloth",
    args: ["", 1, 1, address],
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
  } = useForm<{ name: string; price: number; quantity: number }>({
    defaultValues: { name: "", price: 0, quantity: 0 },
  });

  const onSubmit = handleSubmit(({ name, price, quantity }) => {
    write?.({
      recklesslySetUnpreparedArgs: [name, price, quantity, address],
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
        className="relative inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
      >
        <PlusSmIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        <span>Add Cloth</span>
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
                    Add Cloth
                  </Dialog.Title>

                  <form className="flex flex-col gap-2 mt-4" onSubmit={onSubmit}>
                    <input
                      type="text"
                      className={clsx(
                        "flex-1 border-2 border-gray-500 rounded-lg py-2 px-4",
                        errors.name && "border-red-500 focus:border-red-500",
                      )}
                      {...register("name", { required: true })}
                    />
                    <input
                      type="number"
                      className={clsx(
                        "flex-1 border-2 border-gray-500 rounded-lg py-2 px-4",
                        errors.price && "border-red-500 focus:border-red-500",
                      )}
                      {...register("price", { required: true, min: 1 })}
                    />
                    <input
                      type="number"
                      className={clsx(
                        "flex-1 border-2 border-gray-500 rounded-lg py-2 px-4",
                        errors.quantity && "border-red-500 focus:border-red-500",
                      )}
                      {...register("quantity", { required: true, min: 1 })}
                    />
                    <input
                      disabled={isFetching}
                      type="submit"
                      value={isFetching ? "Loading..." : "Add"}
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

export default AddCloth;
