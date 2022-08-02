import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe("EtherWallet", function () {
  async function deployEtherWalletFixture() {
    const [account1, account2] = await ethers.getSigners();
    const EtherWallet = await ethers.getContractFactory("EtherWallet");
    const etherWallet = await EtherWallet.deploy();

    return { etherWallet, account1, account2 } as {
      etherWallet: Contract;
      account1: SignerWithAddress;
      account2: SignerWithAddress;
    };
  }

  async function withFundsFixture(depositAmountAcc1?: BigNumber, depositAmountAcc2?: BigNumber) {
    const { etherWallet, account1, account2 } = await loadFixture(deployEtherWalletFixture);

    if (depositAmountAcc1) {
      await etherWallet.deposit({ value: depositAmountAcc1 });
    }
    if (depositAmountAcc2) {
      await etherWallet.connect(account2).deposit({ value: depositAmountAcc2 });
    }

    return { etherWallet, account1, account2 };
  }

  describe("Methods", function () {
    it("deposit", async function () {
      const { etherWallet } = await loadFixture(deployEtherWalletFixture);

      const DEPOSIT_AMOUNT = ethers.utils.parseEther("0.02");

      const balanceBefore = await etherWallet.balance();
      await etherWallet.deposit({ value: DEPOSIT_AMOUNT });
      const balanceAfter = await etherWallet.balance();

      expect(balanceAfter.sub(balanceBefore)).to.equal(DEPOSIT_AMOUNT);
    });

    describe("withdraw", function () {
      it("Validations", async function () {
        const { etherWallet } = await loadFixture(deployEtherWalletFixture);

        await expect(etherWallet.withdraw(ethers.utils.parseEther("0.01"))).to.be.rejectedWith("Insufficient funds!");
      });

      it("Implementation", async function () {
        const { etherWallet } = await loadFixture(
          withFundsFixture.bind(null, ethers.utils.parseEther("0.02"), ethers.utils.parseEther("0.01")),
        );

        const WITHDRAW_AMOUNT = ethers.utils.parseEther("0.02");

        const balanceBefore = await etherWallet.balance();
        await etherWallet.withdraw(WITHDRAW_AMOUNT);
        const balanceAfter = await etherWallet.balance();

        expect(balanceBefore.sub(balanceAfter)).to.equal(WITHDRAW_AMOUNT);
      });
    });

    it("balance", async function () {
      const { etherWallet } = await loadFixture(withFundsFixture.bind(null, ethers.utils.parseEther("0.02")));

      expect(await etherWallet.balance()).to.equal(ethers.utils.parseEther("0.02"));
    });

    it("getTotalBalance", async function () {
      const { etherWallet } = await loadFixture(
        withFundsFixture.bind(null, ethers.utils.parseEther("0.02"), ethers.utils.parseEther("0.01")),
      );

      expect(await etherWallet.getTotalBalance()).to.equal(ethers.utils.parseEther("0.03"));
    });

    describe("transfer", function () {
      it("Validations", async function () {
        const { etherWallet } = await loadFixture(deployEtherWalletFixture);

        await expect(etherWallet.withdraw(ethers.utils.parseEther("0.01"))).to.be.rejectedWith("Insufficient funds!");
      });

      it("Implementation", async function () {
        const ACCOUNT_1_INITIAL_BALANCE = ethers.utils.parseEther("0.02");
        const ACCOUNT_2_INITIAL_BALANCE = ethers.utils.parseEther("0.01");
        const { etherWallet, account2 } = await loadFixture(
          withFundsFixture.bind(null, ACCOUNT_1_INITIAL_BALANCE, ACCOUNT_2_INITIAL_BALANCE),
        );

        const TRANSFER_AMOUNT = ethers.utils.parseEther("0.02");

        const balanceBefore = await etherWallet.balance();
        await etherWallet.transfer(account2.address, TRANSFER_AMOUNT);
        expect(await etherWallet.balance()).to.equal(balanceBefore.sub(TRANSFER_AMOUNT));

        expect(await etherWallet.connect(account2).balance()).to.equal(ACCOUNT_2_INITIAL_BALANCE.add(TRANSFER_AMOUNT));
      });
    });

    it("receive", async function () {
      const { etherWallet, account1 } = await loadFixture(deployEtherWalletFixture);

      const TX_VALUE = ethers.utils.parseEther("0.02");

      await account1.sendTransaction({ to: etherWallet.address, value: TX_VALUE });

      expect(await etherWallet.balance()).to.equal(TX_VALUE);
    });

    it("fallback", async function () {
      const { etherWallet, account1 } = await loadFixture(deployEtherWalletFixture);

      const TX_VALUE = ethers.utils.parseEther("0.02");

      await account1.sendTransaction({ to: etherWallet.address, value: TX_VALUE, data: "0x1234" });

      expect(await etherWallet.balance()).to.equal(TX_VALUE);
    });
  });
});
